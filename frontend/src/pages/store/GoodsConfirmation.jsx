import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarClock,
  Truck,
  UserRound,
  Route,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Package,
} from "lucide-react";

import GoodsProgress from "../../components/goods/GoodsProgress";
import GoodsPreparationTable from "../../components/goods/GoodsPreparationTable";
import GoodsHandoverTable from "../../components/goods/GoodsHandoverTable";
import GoodsReceivedTable from "../../components/goods/GoodsReceivedTable";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const sampleBooking = {
  id: "BK-256",
  direction: "sending",
  route: "Colombo → Kandy",
  origin: "Colombo Store",
  destination: "Kandy Store",
  scheduledPickup: "06 Nov 2026",
  pickupTime: "10:00 AM",
  vehicle: "VH-020",
  driver: "Minindu Rajapaksha",
  status: "Awaiting Preparation",
  itemDetails: [
    { id: 1, name: "Ceylon Tea", inventory: 80, requested: 10 },
    { id: 2, name: "Rice Bags", inventory: 50, requested: 20 },
    { id: 3, name: "Sugar", inventory: 60, requested: 15 },
  ],
};

const GoodsConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(location.state?.booking || { ...sampleBooking, id: bookingId });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    let active = true;
    api.get(`/store-bookings/${bookingId}`)
      .then(({ data }) => {
        if (!active) return;
        const record = data.booking;
        const storeId = String(user?.storeId || user?.store?._id || user?.store || "");
        const origin = record.pickupStore?.name || "Pickup store";
        const destination = record.destinationStore?.name || "Destination store";
        setBooking({
          ...record,
          id: record._id,
          displayId: record.bookingCode || record._id,
          direction: String(record.pickupStore?._id || record.pickupStore) === storeId ? "sending" : "receiving",
          origin, destination,
          route: `${origin} → ${destination}`,
          status: record.status,
          scheduledPickup: record.requestedPickupDate,
          pickupTime: record.requestedTimeWindow?.startTime || "",
          itemDetails: (record.items || []).map((line) => ({
            id: line._id, lineId: line._id, item: line.item?._id || line.item,
            name: line.item?.name || "Item", requested: line.quantity,
            inventory: line.inventoryVerifiedQuantity ?? line.item?.inventoryQuantity ?? line.item?.availableQuantity ?? "",
            prepared: line.handedOverQuantity,
            handedOver: line.handedOverQuantity, received: line.receivedQuantity,
          })),
        });
        setLoadError("");
      })
      .catch((error) => active && setLoadError(error.response?.data?.message || "Unable to load this booking."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [bookingId, user?.storeId, user?.store]);

  const isReceiving = booking.direction === "receiving";
  const currentStatus = booking.status || "Submitted";
  const goodsDetails = (booking.itemDetails || sampleBooking.itemDetails).map(
    (item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      requested: Number(item.requested ?? 0),
      dispatched: Number(
        item.prepared ?? item.actual ?? item.handedOver ?? item.requested ?? 0
      ),
    })
  );

  const hasHandedOverQuantities = booking.items?.some((line) => line.handedOverQuantity !== null && line.handedOverQuantity !== undefined);
  const hasReceivedQuantities = booking.items?.length > 0 && booking.items.every((line) => line.receivedQuantity !== null && line.receivedQuantity !== undefined);
  const destinationStop = booking.stops?.find((stop) => stop.stopType === "DROP");
  const currentStage = useMemo(() => {
    if (isReceiving) {
      if (booking.status === "Completed") return 3;
      if (hasReceivedQuantities) return 2;
      return 1;
    }

    if (booking.status === "Completed" || destinationStop?.status === "Completed") return 5;
    if (booking.status === "In Progress" && destinationStop?.status === "Arrived") return 4;
    if (booking.status === "In Progress" && hasHandedOverQuantities) return 3;
    if (booking.status === "In Progress") return 2;
    return 1;
  }, [booking.status, destinationStop?.status, hasHandedOverQuantities, hasReceivedQuantities, isReceiving]);
  const [preparationNote, setPreparationNote] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  const [preparationInventoryEdits, setPreparationInventoryEdits] = useState({});
  const preparationItems = useMemo(() =>
    (booking.itemDetails || []).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      inventory: preparationInventoryEdits[item.id || index + 1] ?? item.inventory ?? "",
      requested: Number(item.requested ?? 0),
    }))
  , [booking.itemDetails, preparationInventoryEdits]);

  const [handoverEdits, setHandoverEdits] = useState({});
  const handoverItems = useMemo(() =>
    (booking.itemDetails || []).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      requested: Number(item.requested ?? 0),
      actual: handoverEdits[item.id || index + 1] ?? Number(item.prepared ?? item.actual ?? item.handedOver ?? item.requested ?? 0),
    }))
  , [booking.itemDetails, handoverEdits]);

  const [receivedEdits, setReceivedEdits] = useState({});
  const receivedItems = useMemo(() =>
    (booking.itemDetails || []).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      handedOver: Number(item.prepared ?? item.actual ?? item.handedOver ?? item.requested ?? 0),
      received: receivedEdits[item.id || index + 1] ?? Number(item.received ?? item.prepared ?? item.handedOver ?? item.requested ?? 0),
    }))
  , [booking.itemDetails, receivedEdits]);

  const isCompleted = currentStatus === "Completed";
  const isReceivingWaiting = isReceiving && ["Draft", "Submitted", "Approved"].includes(currentStatus);
  const isSendingWaiting = !isReceiving && currentStatus === "In Progress" && hasHandedOverQuantities;

  const allItemsReady = preparationItems.every(
    (item) => item.inventory !== "" && Number.isFinite(Number(item.inventory)) && Number(item.inventory) >= item.requested
  );

  const validHandoverQuantities = handoverItems.every(
    (item) =>
      item.actual !== "" &&
      Number.isInteger(Number(item.actual)) &&
      Number(item.actual) >= 0
  );

  const validReceivedQuantities = receivedItems.every(
    (item) =>
      item.received !== "" &&
      Number.isInteger(Number(item.received)) &&
      Number(item.received) >= 0
  );

  const updateBooking = async (newStatus, updatedItems = [], reason = "") => {
    setSaving(true);
    try {
      const items = updatedItems.map((item) => ({
        lineId: item.id,
        ...(newStatus === "Completed" || newStatus === "Received"
          ? { receivedQuantity: Number(item.received) }
          : { handedOverQuantity: Number(item.actual) }),
      }));
      const { data } = await api.patch(`/store-bookings/${booking.id}/handover-receipt`, {
        items,
        reason: reason.trim() || (newStatus === "Completed" || newStatus === "Received" ? "Goods receipt quantities recorded" : "Goods handed over"),
      });
      let updatedBooking = data.booking;
      setBooking((current) => ({
        ...current,
        ...updatedBooking,
        id: updatedBooking._id,
        status: updatedBooking.status,
        itemDetails: (updatedBooking.items || []).map((line) => ({
          id: line._id, name: line.item?.name || current.itemDetails?.find((entry) => entry.id === line._id)?.name || "Item",
          requested: line.quantity, prepared: line.handedOverQuantity,
          inventory: line.item?.inventoryQuantity ?? line.item?.availableQuantity ?? current.itemDetails?.find((entry) => entry.id === line._id)?.inventory ?? null,
          handedOver: line.handedOverQuantity, received: line.receivedQuantity,
        })),
      }));
      setNotification(newStatus === "Received" ? "Received quantities saved." : "Goods handover quantities saved.");
      return true;
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save goods confirmation.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateHandoverQuantity = (index, value) => {
    const item = handoverItems[index];
    if (item) setHandoverEdits((current) => ({ ...current, [item.id]: value }));
  };

  const updatePreparationInventory = (index, value) => {
    const item = preparationItems[index];
    if (item) setPreparationInventoryEdits((current) => ({ ...current, [item.id]: value }));
  };

  const updateReceivedQuantity = (index, value) => {
    const item = receivedItems[index];
    if (item) setReceivedEdits((current) => ({ ...current, [item.id]: value }));
  };

  // Sending store: Awaiting Preparation -> Awaiting Handover.
  const handlePreparation = async () => {
    if (isReceiving || currentStatus !== "Approved") return;

    if (!allItemsReady) {
      alert("Some items do not have sufficient inventory.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.patch(`/store-bookings/${booking.id}/start`, {
        reason: preparationNote.trim() || "Goods prepared; trip started",
        inventoryQuantities: preparationItems.map((item) => ({
          lineId: item.id,
          availableQuantity: Number(item.inventory),
        })),
      });
      setBooking((current) => ({ ...current, ...data.booking, id: data.booking._id }));
      setPreparationInventoryEdits({});
      setNotification("Preparation confirmed. Booking is now In Progress.");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to confirm goods preparation.");
    } finally {
      setSaving(false);
    }
  };

  // Sending store: Awaiting Handover -> Awaiting Receipt.
  const handleHandover = async () => {
    if (isReceiving || currentStatus !== "In Progress") return;

    if (!validHandoverQuantities) {
      alert("Please enter valid actual quantities for all items.");
      return;
    }

    if (await updateBooking("Awaiting Receipt", handoverItems, handoverNote)) {
      setReceivedEdits({});
    }
  };

  // Receiving store: In Transit -> Awaiting Confirmation.
  const handleGoodsArrival = async () => {
    if (!isReceiving || currentStatus !== "In Progress" || destinationStop?.status === "Arrived" || destinationStop?.status === "Completed") return;
    const storeId = String(user?.storeId || user?.store?._id || user?.store || "");
    const storeDestinationStop = booking.stops?.find((stop) =>
      stop.stopType === "DROP" && String(stop.store?._id || stop.store) === storeId
    );
    if (!storeDestinationStop) {
      alert("No destination stop is configured for this booking.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch(`/store-bookings/${booking.id}/stops/${storeDestinationStop._id}`, {
        status: "Arrived",
        notes: "Goods arrival confirmed by store",
      });
      setBooking((current) => ({ ...current, ...data.booking }));
      setNotification("Goods arrival recorded.");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to record goods arrival.");
    } finally {
      setSaving(false);
    }
  };

  // Only the receiving store can confirm receipt and complete the booking.
  const handleReceipt = async () => {
    if (!isReceiving || currentStatus !== "In Progress" || destinationStop?.status !== "Arrived" || hasReceivedQuantities) return;

    if (!validReceivedQuantities) {
      alert("Please enter valid received quantities for all items.");
      return;
    }

    await updateBooking("Received", receivedItems, receiptNote);
  };

  const handleCompleteReceipt = async () => {
    if (!isReceiving || currentStatus !== "In Progress" || destinationStop?.status !== "Arrived" || !hasReceivedQuantities) return;
    setSaving(true);
    try {
      const storeId = String(user?.storeId || user?.store?._id || user?.store || "");
      const destinationStop = booking.stops?.find((stop) =>
        stop.stopType === "DROP" && String(stop.store?._id || stop.store) === storeId
      );
      if (destinationStop && destinationStop.status !== "Completed") {
        await api.patch(`/store-bookings/${booking.id}/stops/${destinationStop._id}`, {
          status: "Completed",
          notes: receiptNote.trim() || "Goods received and checked",
        });
      }
      const { data } = await api.patch(`/store-bookings/${booking.id}/complete`, {
        reason: receiptNote.trim() || "Goods receipt confirmed",
      });
      setBooking((current) => ({ ...current, ...data.booking, id: data.booking._id }));
      setNotification("Receiving process completed.");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to complete goods receipt.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/store/goods-handling", {
      state: { activeTab: isCompleted ? "completed" : isReceiving ? "receiving" : "sending" },
    });
  };

  const stageDetails = {
    1: {
      title: isReceiving ? "Awaiting Receipt" : "Awaiting Preparation",
      description: isReceiving
        ? "Wait for the sending store to dispatch the goods."
        : "Check inventory and prepare the requested goods.",
      button: "Confirm Preparation",
      noteLabel: "Preparation note",
      note: preparationNote,
      setNote: setPreparationNote,
      action: handlePreparation,
      disabled: !allItemsReady || isReceiving || currentStatus !== "Approved" || saving,
    },
    2: {
      title: isReceiving ? "Received" : "Prepared",
      description: isReceiving
        ? "The goods are on their way to your store."
        : "Enter the actual quantities handed over to the driver.",
      button: "Confirm Handover",
      noteLabel: "Handover note",
      note: handoverNote,
      setNote: setHandoverNote,
      action: handleHandover,
      disabled: !validHandoverQuantities || isReceiving || currentStatus !== "In Progress" || saving,
    },
    3: {
      title: isReceiving ? "Completed" : "In Transit",
      description: isReceiving
        ? "The receiving process has been completed."
        : "Goods were handed over to the driver and are on the way to the destination store.",
      button: "Confirm Receipt",
      noteLabel: "Receipt note",
      note: receiptNote,
      setNote: setReceiptNote,
      action: handleReceipt,
      disabled: !isReceiving || currentStatus !== "In Progress" || !validReceivedQuantities || saving,
    },
    4: {
      title: "Awaiting Handover",
      description: `The destination store has recorded arrival at ${booking.destination}.`,
      button: "Awaiting Handover",
      noteLabel: "Handover note",
      note: handoverNote,
      setNote: setHandoverNote,
      action: handleHandover,
      disabled: true,
    },
    5: {
      title: "Handed Over",
      description: "The receiving store confirmed the goods and completed the booking.",
      button: "Handed Over",
      noteLabel: "Handover note",
      note: handoverNote,
      setNote: setHandoverNote,
      action: handleHandover,
      disabled: true,
    },
  };

  const currentDetails = stageDetails[currentStage] || stageDetails[1];

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading booking…</div>;
  if (loadError || !booking?._id) {
    return (
      <div className="mx-auto max-w-[900px] rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{loadError || "Booking not found."}</p>
        <button type="button" onClick={handleCancel} className="mt-4 font-semibold underline">Back to Goods Handling</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {notification && (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {notification}
        </div>
      )}
      {/* Page Heading */}
      <div className="mb-10">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#078A68]"
        >
          <ArrowLeft size={17} />
          Back to Goods Handling
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-bold tracking-tight text-gray-950">
              {booking.displayId || booking.id} - Goods Confirmation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {currentDetails.description}
            </p>
          </div>

          {loading && <span className="text-sm text-slate-500">Loading booking…</span>}
          {loadError && <span className="text-sm text-red-600">{loadError}</span>}
          {isCompleted && (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              <CheckCircle2 size={17} />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Booking Information */}
      <div className="mb-10 grid grid-cols-1 gap-5 border-b border-gray-200 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 lg:border-r lg:border-gray-300">
          <Truck size={22} className="shrink-0 text-[#078A68]" />
          <div>
            <p className="text-xs text-slate-500">Vehicle</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booking.vehicle || "Not assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:border-r lg:border-gray-300 lg:pl-5">
          <UserRound size={22} className="shrink-0 text-[#078A68]" />
          <div>
            <p className="text-xs text-slate-500">Driver</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booking.driver || "Not assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:border-r lg:border-gray-300 lg:pl-5">
          <CalendarClock size={22} className="shrink-0 text-[#078A68]" />
          <div>
            <p className="text-xs text-slate-500">Scheduled Pickup</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booking.scheduledPickup} {booking.pickupTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:pl-5">
          <Route size={22} className="shrink-0 text-[#078A68]" />
          <div>
            <p className="text-xs text-slate-500">Route</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booking.route}
            </p>
          </div>
        </div>
      </div>

      <GoodsProgress currentStage={currentStage} isReceiving={isReceiving} />

      {/* Current Status */}
      <div className="mx-auto mb-5 max-w-[905px] rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Current Status
        </p>
        <p className="mt-1 text-base font-semibold text-gray-900">
          {currentStatus}
        </p>
      </div>

      {/* Receiving store: waiting for dispatch */}
      {isReceiving && currentStatus === "Approved" && (
        <div className="mx-auto mb-5 flex max-w-[905px] items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Waiting for Dispatch</p>
            <p className="mt-1">
              {booking.origin} has not dispatched these goods yet. You can
              confirm arrival after the goods reach your store.
            </p>
          </div>
        </div>
      )}

      {/* Receiving store: goods in transit */}
      {isReceiving && currentStatus === "In Progress" && (
        <div className="mx-auto mb-5 flex max-w-[905px] items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-800">
          <Truck size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Goods In Transit</p>
            <p className="mt-1">
              Goods have been dispatched from {booking.origin} and are on
              their way to {booking.destination}. Confirm arrival when they
              physically reach your store.
            </p>
          </div>
        </div>
      )}

      {/* Sending store: wait for destination store */}
      {isSendingWaiting && (
        <div className="mx-auto mb-5 flex max-w-[905px] items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{destinationStop?.status === "Arrived" ? "Awaiting Handover" : "Goods Handed Over"}</p>
            <p className="mt-1">
              {destinationStop?.status === "Arrived"
                ? `The destination store has recorded arrival at ${booking.destination}. It can verify the delivered quantities.`
                : `The goods are moving to ${booking.destination}. The receiving store will record arrival and verify quantities.`}
            </p>
          </div>
        </div>
      )}

      {/* Current Stage Card */}
      <div className="mx-auto max-w-[905px] rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#078A68]">
              Stage {currentStage} of {isReceiving ? 3 : 5}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {currentDetails.title}
            </h3>
          </div>

          {currentStage === 1 && !isReceiving && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              Preparation Stage
            </span>
          )}
          {currentStage === 2 && !isReceiving && (
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              Handover Stage
            </span>
          )}
          {currentStage === 3 && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
              {isReceiving ? "Receipt Verification" : "Waiting for Destination"}
            </span>
          )}
        </div>

        {!isReceiving && currentStage === 1 && (
          <GoodsPreparationTable items={preparationItems} onInventoryChange={updatePreparationInventory} />
        )}

        {!isReceiving && currentStage === 2 && (
          <GoodsHandoverTable
            items={handoverItems}
            onQuantityChange={updateHandoverQuantity}
          />
        )}

        {isReceiving && ["In Progress", "Completed"].includes(currentStatus) && (
          <GoodsReceivedTable
            items={receivedItems}
            onQuantityChange={updateReceivedQuantity}
            readOnly={isCompleted}
          />
        )}

        {/* Sending store sees the quantities it handed over, not a receipt form. */}
        {!isReceiving && ["In Progress", "Completed"].includes(currentStatus) && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#F0F4F1] text-slate-600">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Requested Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Handed-over Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {handoverItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.requested}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {item.actual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isReceivingWaiting && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Package size={21} className="text-[#078A68]" />
              <h3 className="text-base font-semibold text-gray-900">
                {currentStatus === "Approved"
                  ? "Goods Awaiting Dispatch"
                  : "Goods In Transit"}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-sm">
                <thead>
                  <tr className="h-12 bg-[#F0F4F1] text-gray-700">
                    <th className="w-[10%] px-4 text-center font-medium">#</th>
                    <th className="w-[30%] px-4 text-left font-medium">Item</th>
                    <th
                      className={`px-4 text-center font-medium ${
                        currentStatus === "In Progress" ? "w-[30%]" : "w-[60%]"
                      }`}
                    >
                      Requested Quantity
                    </th>
                    {currentStatus === "In Progress" && (
                      <th className="w-[30%] px-4 text-center font-medium">
                        Dispatched Quantity
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {goodsDetails.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="h-[58px] border-b border-gray-200 text-gray-900"
                    >
                      <td className="px-4 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 font-medium">{item.name}</td>
                      <td className="px-4 text-center">{item.requested}</td>
                      {currentStatus === "In Progress" && (
                        <td className="px-4 text-center font-semibold">
                          {item.dispatched}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {!isReceiving && (currentStage === 1 || currentStage === 2) && (
          <div className="mt-9">
            <label
              htmlFor="goods-note"
              className="mb-3 block text-sm font-medium text-gray-900"
            >
              {currentDetails.noteLabel}
            </label>
            <textarea
              id="goods-note"
              rows={3}
              value={currentDetails.note}
              onChange={(e) => currentDetails.setNote(e.target.value)}
              placeholder="Add any notes or discrepancies..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-[#FAFAFA] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078A68] focus:ring-2 focus:ring-[#078A68]/10"
            />
          </div>
        )}

        {isReceiving && ["In Progress", "Completed"].includes(currentStatus) && (
          <div className="mt-9">
            <label
              htmlFor="goods-note"
              className="mb-3 block text-sm font-medium text-gray-900"
            >
              Receipt note
            </label>
            <textarea
              id="goods-note"
              rows={3}
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              disabled={isCompleted}
              placeholder="Add any notes or discrepancies..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-[#FAFAFA] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#078A68] focus:ring-2 focus:ring-[#078A68]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        )}

        {!isReceiving && currentStage === 1 && !allItemsReady && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={17} className="shrink-0" />
            <p>
              Some items have insufficient inventory. You cannot confirm
              preparation until all items are ready.
            </p>
          </div>
        )}

        {!isReceiving &&
          currentStage === 2 &&
          handoverItems.some((item) => Number(item.actual) !== item.requested) && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={17} className="shrink-0" />
              <p>
                Actual handover quantities differ from requested quantities.
              </p>
            </div>
          )}

        {isReceiving &&
          ["In Progress", "Completed"].includes(currentStatus) &&
          receivedItems.some(
            (item) => Number(item.received) !== item.handedOver
          ) && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={17} className="shrink-0" />
              <p>
                Received quantities differ from handed-over quantities.
              </p>
            </div>
          )}

        {isCompleted && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Receipt has been confirmed by the receiving store. This booking is
            now completed.
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mx-auto mt-6 flex max-w-[905px] flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-[#078A68] bg-transparent px-7 py-3 text-sm font-medium text-[#078A68] transition hover:bg-emerald-50"
        >
          Back
        </button>
        {/* Receiving arrival confirmation */}
        {isReceiving && currentStatus === "In Progress" && !["Arrived", "Completed"].includes(destinationStop?.status) && (
          <button
            type="button"
            onClick={handleGoodsArrival}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557]"
          >
            <CheckCircle2 size={17} />
            Confirm Goods Arrival
          </button>
        )}

        {/* Sending store can prepare and hand over only. */}
        {!isReceiving && !isCompleted && (
          (currentStatus === "Approved" && currentStage === 1) ||
          (currentStatus === "In Progress" && currentStage === 2)
        ) && (
            <button
              type="button"
              onClick={currentDetails.action}
              disabled={currentDetails.disabled || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CheckCircle2 size={17} />
              {currentDetails.button}
            </button>
          )}

        {/* Only receiving store can confirm quantities and complete. */}
        {isReceiving && currentStatus === "In Progress" && (
          <button
            type="button"
            onClick={hasReceivedQuantities ? handleCompleteReceipt : handleReceipt}
            disabled={!validReceivedQuantities || isCompleted || saving || destinationStop?.status !== "Arrived"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <CheckCircle2 size={17} />
            {hasReceivedQuantities ? "Complete Receiving" : "Confirm Receipt"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoodsConfirmation;
