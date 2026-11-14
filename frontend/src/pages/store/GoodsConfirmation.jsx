import { useMemo, useState } from "react";
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
} from "lucide-react";

import GoodsProgress from "../../components/goods/GoodsProgress";
import GoodsPreparationTable from "../../components/goods/GoodsPreparationTable";
import GoodsHandoverTable from "../../components/goods/GoodsHandoverTable";
import GoodsReceivedTable from "../../components/goods/GoodsReceivedTable";

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

const getSavedBooking = (bookingId) => {
  try {
    const savedBookings = JSON.parse(
      localStorage.getItem("goodsBookings") || "[]"
    );
    return savedBookings.find((item) => item.id === bookingId);
  } catch {
    return null;
  }
};

const GoodsConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const booking = useMemo(() => {
    return (
      location.state?.booking ||
      getSavedBooking(bookingId) || {
        ...sampleBooking,
        id: bookingId || sampleBooking.id,
      }
    );
  }, [location.state, bookingId]);

  const isReceiving = booking.direction === "receiving";
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  const initialStage = useMemo(() => {
    if (isReceiving) {
      if (booking.status === "Awaiting Dispatch") return 1;
      if (booking.status === "In Transit") return 2;
      return 3;
    }

    if (booking.status === "Awaiting Preparation") return 1;
    if (booking.status === "Awaiting Handover") return 2;
    return 3;
  }, [booking.status, isReceiving]);

  const [currentStage, setCurrentStage] = useState(initialStage);
  const [preparationNote, setPreparationNote] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  const [preparationItems] = useState(() =>
    (booking.itemDetails || sampleBooking.itemDetails).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      inventory: Number(item.inventory ?? item.requested ?? 0),
      requested: Number(item.requested ?? 0),
    }))
  );

  const [handoverItems, setHandoverItems] = useState(() =>
    (booking.itemDetails || sampleBooking.itemDetails).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      requested: Number(item.requested ?? 0),
      actual: Number(item.prepared ?? item.actual ?? item.requested ?? 0),
    }))
  );

  const [receivedItems, setReceivedItems] = useState(() =>
    (booking.itemDetails || sampleBooking.itemDetails).map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      handedOver: Number(
        item.prepared ?? item.actual ?? item.requested ?? 0
      ),
      received: Number(
        item.received ?? item.prepared ?? item.actual ?? item.requested ?? 0
      ),
    }))
  );

  const isCompleted = currentStatus === "Completed";
  const isReceivingWaiting =
    isReceiving &&
    (currentStatus === "Awaiting Dispatch" || currentStatus === "In Transit");
  const isSendingWaiting =
    !isReceiving && currentStatus === "Awaiting Receipt";

  const allItemsReady = preparationItems.every(
    (item) => item.inventory >= item.requested
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

  // Save the current booking status and item quantities.
  const updateBooking = (newStatus, updatedItems = null) => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem("goodsBookings") || "[]"
      );
      const existingIndex = savedBookings.findIndex(
        (item) => item.id === booking.id
      );

      const updatedBooking = {
        ...booking,
        direction: booking.direction,
        status: newStatus,
        ...(updatedItems ? { itemDetails: updatedItems } : {}),
      };

      if (existingIndex >= 0) {
        savedBookings[existingIndex] = {
          ...savedBookings[existingIndex],
          ...updatedBooking,
        };
      } else {
        savedBookings.push(updatedBooking);
      }

      localStorage.setItem("goodsBookings", JSON.stringify(savedBookings));
      setCurrentStatus(newStatus);
      return true;
    } catch (error) {
      console.error("Unable to save goods booking:", error);
      alert("Unable to save the booking status.");
      return false;
    }
  };

  const updateHandoverQuantity = (index, value) => {
    setHandoverItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, actual: value } : item
      )
    );
  };

  const updateReceivedQuantity = (index, value) => {
    setReceivedItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, received: value } : item
      )
    );
  };

  // Sending store: Awaiting Preparation -> Awaiting Handover.
  const handlePreparation = () => {
    if (isReceiving) return;

    if (!allItemsReady) {
      alert("Some items do not have sufficient inventory.");
      return;
    }

    setHandoverItems((current) =>
      current.map((item) => ({ ...item, actual: item.requested }))
    );

    if (updateBooking("Awaiting Handover")) {
      setCurrentStage(2);
    }
  };

  // Sending store: Awaiting Handover -> Awaiting Receipt.
  const handleHandover = () => {
    if (isReceiving) return;

    if (!validHandoverQuantities) {
      alert("Please enter valid actual quantities for all items.");
      return;
    }

    const updatedItems = handoverItems.map((item) => ({
      id: item.id,
      name: item.name,
      requested: item.requested,
      prepared: Number(item.actual),
    }));

    if (updateBooking("Awaiting Receipt", updatedItems)) {
      setReceivedItems(
        handoverItems.map((item) => ({
          id: item.id,
          name: item.name,
          handedOver: Number(item.actual),
          received: Number(item.actual),
        }))
      );
      setCurrentStage(3);
    }
  };

  // Receiving store: In Transit -> Awaiting Confirmation.
  const handleGoodsArrival = () => {
    if (!isReceiving || currentStatus !== "In Transit") return;

    if (updateBooking("Awaiting Confirmation")) {
      setCurrentStage(3);
      alert(
        "Goods arrival confirmed. You can now verify the received quantities."
      );
    }
  };

  // Only the receiving store can confirm receipt and complete the booking.
  const handleReceipt = () => {
    if (!isReceiving || currentStatus !== "Awaiting Confirmation") return;

    if (!validReceivedQuantities) {
      alert("Please enter valid received quantities for all items.");
      return;
    }

    const updatedItems = receivedItems.map((item) => ({
      id: item.id,
      name: item.name,
      requested:
        booking.itemDetails?.find((original) => original.id === item.id)
          ?.requested ?? item.handedOver,
      prepared: item.handedOver,
      received: Number(item.received),
    }));

    if (updateBooking("Completed", updatedItems)) {
      alert("Goods receipt confirmed successfully.");
    }
  };

  const handleCancel = () => {
    navigate("/store/goods-handling");
  };

  const stageDetails = {
    1: {
      title: isReceiving ? "Awaiting Dispatch" : "Goods Preparation",
      description: isReceiving
        ? "Wait for the sending store to dispatch the goods."
        : "Check inventory and prepare the requested goods.",
      button: "Confirm Preparation",
      noteLabel: "Preparation note",
      note: preparationNote,
      setNote: setPreparationNote,
      action: handlePreparation,
      disabled: !allItemsReady || isReceiving,
    },
    2: {
      title: isReceiving ? "Goods In Transit" : "Goods Handover",
      description: isReceiving
        ? "The goods are on their way to your store."
        : "Enter the actual quantities handed over to the driver.",
      button: "Confirm Handover",
      noteLabel: "Handover note",
      note: handoverNote,
      setNote: setHandoverNote,
      action: handleHandover,
      disabled: !validHandoverQuantities || isReceiving,
    },
    3: {
      title: isReceiving ? "Goods Received" : "Awaiting Receipt Confirmation",
      description: isReceiving
        ? "Check the delivered goods and confirm the quantities received."
        : "The goods have been handed over. Wait for the destination store to confirm receipt.",
      button: "Confirm Receipt",
      noteLabel: "Receipt note",
      note: receiptNote,
      setNote: setReceiptNote,
      action: handleReceipt,
      disabled: !isReceiving || !validReceivedQuantities,
    },
  };

  const currentDetails = stageDetails[currentStage] || stageDetails[1];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
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
              {booking.id} - Goods Confirmation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {currentDetails.description}
            </p>
          </div>

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
      {isReceiving && currentStatus === "Awaiting Dispatch" && (
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
      {isReceiving && currentStatus === "In Transit" && (
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
            <p className="font-semibold">Waiting for Receipt Confirmation</p>
            <p className="mt-1">
              The goods have been handed over to the driver. {booking.destination} must 
              confirm arrival and verify the received quantities.
            </p>
          </div>
        </div>
      )}

      {/* Current Stage Card */}
      <div className="mx-auto max-w-[905px] rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#078A68]">
              Stage {currentStage} of 3
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
          <GoodsPreparationTable items={preparationItems} />
        )}

        {!isReceiving && currentStage === 2 && (
          <GoodsHandoverTable
            items={handoverItems}
            onQuantityChange={updateHandoverQuantity}
          />
        )}

        {isReceiving && currentStatus === "Awaiting Confirmation" && (
          <GoodsReceivedTable
            items={receivedItems}
            onQuantityChange={updateReceivedQuantity}
            readOnly={isCompleted}
          />
        )}

        {/* Sending store sees the quantities it handed over, not a receipt form. */}
        {!isReceiving && currentStatus === "Awaiting Receipt" && (
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
            <Truck className="mx-auto mb-3 text-slate-400" size={30} />
            <p className="text-sm font-semibold text-gray-800">
              {currentStatus === "Awaiting Dispatch"
                ? "Waiting for the sending store"
                : "Waiting for the goods to arrive"}
            </p>
            <p className="mx-auto mt-1 max-w-[520px] text-sm text-slate-500">
              {currentStatus === "Awaiting Dispatch"
                ? "The sending store must dispatch the goods before you can confirm their arrival."
                : "Once the goods physically arrive, select Confirm Goods Arrival to begin quantity verification."}
            </p>
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

        {isReceiving && currentStatus === "Awaiting Confirmation" && (
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
          currentStatus === "Awaiting Confirmation" &&
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
        {isReceiving && currentStatus === "In Transit" && (
          <button
            type="button"
            onClick={handleGoodsArrival}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557]"
          >
            <CheckCircle2 size={17} />
            Confirm Goods Arrival
          </button>
        )}

        {/* Sending store can prepare and hand over only. */}
        {!isReceiving &&
          !isCompleted &&
          (currentStatus === "Awaiting Preparation" ||
            currentStatus === "Awaiting Handover") && (
            <button
              type="button"
              onClick={currentDetails.action}
              disabled={currentDetails.disabled}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CheckCircle2 size={17} />
              {currentDetails.button}
            </button>
          )}

        {/* Only receiving store can confirm quantities and complete. */}
        {isReceiving && currentStatus === "Awaiting Confirmation" && (
          <button
            type="button"
            onClick={handleReceipt}
            disabled={!validReceivedQuantities || isCompleted}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#078A68] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#067557] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <CheckCircle2 size={17} />
            Confirm Receipt
          </button>
        )}
      </div>
    </div>
  );
};

export default GoodsConfirmation;
