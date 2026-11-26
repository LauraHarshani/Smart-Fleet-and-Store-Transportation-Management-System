import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Plus, Calendar, ChevronRight, Truck, 
  CheckCircle2, History, Edit2, ArrowLeft,
  MapPin, Clock, Package, Trash2, ShieldAlert, Save, Send 
} from 'lucide-react';

const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_ROOT = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`;
const BOOKINGS_API = `${API_ROOT}/store-bookings`;
const apiFetch = (url, options = {}) => fetch(url, { ...options, credentials: 'include' });

const isObjectId = (val) => typeof val === 'string' && /^[a-f\d]{24}$/i.test(val.trim());

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch (_) {
    return null;
  }
};

const extractUserIdFromAny = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  const candidates = [
    obj._id,
    obj.id,
    obj.userId,
    obj.sub,
    obj.user?._id,
    obj.user?.id,
    obj.data?._id,
    obj.data?.id,
    obj.data?.user?._id,
    obj.data?.user?.id,
  ];
  for (const c of candidates) {
    if (isObjectId(c)) return c.trim();
  }
  return '';
};

const getAuthToken = () => {
  const directKeys = ['token', 'authToken', 'accessToken', 'jwt', 'userToken'];
  for (const k of directKeys) {
    const val = localStorage.getItem(k);
    if (val) return val.replace(/^Bearer\s+/i, '').trim();
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    if (!val) continue;
    if (val.startsWith('eyJ')) return val.trim();
    try {
      const parsed = JSON.parse(val);
      const t = parsed?.token || parsed?.accessToken || parsed?.data?.token;
      if (typeof t === 'string' && t.length > 10) return t.replace(/^Bearer\s+/i, '').trim();
    } catch (_) {}
  }
  return '';
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const resolveCurrentUserId = (usersList = []) => {
  const idKeys = ['userId', 'currentUserId', '_id', 'id'];
  for (const k of idKeys) {
    const val = localStorage.getItem(k);
    if (isObjectId(val)) return val.trim();
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const foundId = extractUserIdFromAny(parsed);
      if (foundId) return foundId;
    } catch (_) {}
  }

  const token = getAuthToken();
  const payload = decodeJwtPayload(token);
  const jwtUserId = extractUserIdFromAny(payload);
  if (jwtUserId) return jwtUserId;

  const listMatch = usersList.find((u) => isObjectId(u?._id || u?.id));
  if (listMatch) return (listMatch._id || listMatch.id).trim();

  return '';
};

const parseTimeSlot = (slotLabel) => {
  if (slotLabel && slotLabel.includes('Afternoon')) {
    return { startTime: '13:00', endTime: '16:00' };
  }
  return { startTime: '09:00', endTime: '12:00' };
};

const formatDisplayDate = (isoDate, timeWindow) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const start = timeWindow?.startTime || '';
  return start ? `${datePart} - ${start} IST` : datePart;
};

const mapBackendStatusToUi = (backendStatus) => {
  switch (backendStatus) {
    case 'In Progress':
      return 'In Transit';
    case 'Approved':
      return 'Confirmed';
    case 'Draft':
    case 'Submitted':
    case 'Changes Requested':
      return 'Pending Approval';
    case 'Completed':
      return 'Completed';
    case 'Cancelled':
      return 'Cancelled';
    case 'Rejected':
      return 'Rejected';
    default:
      return backendStatus || '';
  }
};

// ==========================================
// 1. CREATE / EDIT BOOKING COMPONENT (FE-3)
// ==========================================
const CreateBookingView = ({ onBack, editData, storesList = [], itemsList = [], currentUserId, assignedStoreId, onSaved, onSuccess }) => {
  const pickupStoresList = assignedStoreId
    ? storesList.filter((store) => store._id === assignedStoreId)
    : storesList;
  const defaultPickupStore = pickupStoresList[0];

  const [formData, setFormData] = useState({
    pickupStoreId: defaultPickupStore?._id || '',
    pickupStore: defaultPickupStore?.name || '',
    destinationStoreId: '',
    destinationStore: '',
    dispatchDate: '',
    timeSlot: '',
    specialInstructions: '',
    directives: []
  });

  const [items, setItems] = useState([
    { id: 1, itemId: '', itemType: '', quantity: '', unit: 'Cartons', weight: '', weightUnit: 'kg' }
  ]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editData && pickupStoresList.length > 0 && !formData.pickupStoreId) {
      const first = pickupStoresList[0];
      setFormData((prev) => ({
        ...prev,
        pickupStoreId: first._id,
        pickupStore: first.name,
      }));
    }
  }, [storesList, assignedStoreId, editData, formData.pickupStoreId]);

  useEffect(() => {
    if (editData) {
      const raw = editData.rawBooking || {};
      const matchedPickup =
        storesList.find(
          (s) =>
            s._id === (raw.pickupStore?._id || raw.pickupStore) ||
            s.name === (raw.pickupStore?.name || editData.from)
        ) || defaultPickupStore;

      const matchedDest = storesList.find(
        (s) =>
          s._id === (raw.destinationStore?._id || raw.destinationStore) ||
          s.name === (raw.destinationStore?.name || editData.to)
      );

      const isoDate = raw.requestedPickupDate
        ? new Date(raw.requestedPickupDate).toISOString().split('T')[0]
        : editData.rawDate || '';
      const startTime = raw.requestedTimeWindow?.startTime || '09:00';
      const slotValue = startTime.startsWith('13')
        ? 'Afternoon: 01:00 PM - 04:00 PM IST'
        : 'Morning Prime: 09:00 AM - 12:00 PM IST';

      setFormData({
        pickupStoreId: matchedPickup?._id || '',
        pickupStore: matchedPickup?.name || '',
        destinationStoreId: matchedDest?._id || '',
        destinationStore: matchedDest?._id || '',
        dispatchDate: isoDate,
        timeSlot: slotValue,
        specialInstructions: raw.reviewNote || '',
        directives: []
      });

      if (Array.isArray(raw.items) && raw.items.length > 0) {
        setItems(
          raw.items.map((line, idx) => {
            const itemObj =
              typeof line.item === 'object'
                ? line.item
                : itemsList.find((it) => it._id === line.item);
            const unitWeight = Number(itemObj?.weightKg) || 1;
            const qty = Number(line.quantity) || 1;
            const matchedLabel = itemObj
              ? `${itemObj.name}${itemObj.code ? ` (${itemObj.code})` : ''}`
              : '';
            return {
              id: line._id || Date.now() + idx,
              itemId: itemObj?._id || line.item || '',
              itemType: matchedLabel,
              quantity: String(qty),
              unit: line.unit || itemObj?.unitOfMeasure || 'units',
              weight: String(qty * unitWeight),
              weightUnit: 'kg'
            };
          })
        );
      }
    }
  }, [editData, itemsList, storesList, defaultPickupStore]);

  const quickDirectives = ['+ Keep Dry', '+ Tailgate Lift', '+ Export Priority', '+ Weighbridge Slip'];

  const handleAddItem = () =>
    setItems([...items, { id: Date.now(), itemId: '', itemType: '', quantity: '', unit: 'units', weight: '', weightUnit: 'kg' }]);
  
  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      if (field === 'itemType') {
        const matched = itemsList.find(
          (it) => it._id === value || `${it.name}${it.code ? ` (${it.code})` : ''}` === value
        );
        if (matched) {
          const qty = Number(item.quantity) || 1;
          const autoWeight = matched.weightKg ? String(qty * Number(matched.weightKg)) : item.weight;
          return {
            ...item,
            itemId: matched._id,
            itemType: value,
            unit: matched.unitOfMeasure || 'units',
            weight: item.weight || autoWeight,
          };
        }
      }
      if (field === 'quantity' && item.itemId) {
        const matched = itemsList.find((it) => it._id === item.itemId);
        if (matched?.weightKg && Number(value) > 0) {
          return {
            ...item,
            quantity: value,
            weight: String(Number(value) * Number(matched.weightKg)),
          };
        }
      }
      return { ...item, [field]: value };
    }));
  };

  const toggleDirective = (dir) => {
    const newDirectives = formData.directives.includes(dir)
      ? formData.directives.filter(d => d !== dir)
      : [...formData.directives, dir];
    setFormData({ ...formData, directives: newDirectives });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.destinationStore) newErrors.destinationStore = 'Required';
    if (!formData.dispatchDate) newErrors.dispatchDate = 'Required';
    if (!formData.timeSlot) newErrors.timeSlot = 'Required';

    let hasItemErrors = false;
    const itemErrs = items.map(item => {
      const err = {};
      if (!item.itemType) err.itemType = 'Required';
      if (!item.quantity || Number(item.quantity) <= 0) err.quantity = 'Invalid';
      if (!item.weight || Number(item.weight) <= 0) err.weight = 'Invalid';
      if (Object.keys(err).length > 0) hasItemErrors = true;
      return err;
    });

    if (hasItemErrors) newErrors.items = itemErrs;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const persistBooking = async (submitImmediately = true) => {
    if (!validateForm()) return;

    const actorId = currentUserId || resolveCurrentUserId();

    const pickupId = formData.pickupStoreId || pickupStoresList[0]?._id;
    const destStoreObj = storesList.find(
      (s) => s._id === formData.destinationStore || s.name === formData.destinationStore
    );
    const destinationId = formData.destinationStoreId || destStoreObj?._id || '';

    const mappedItems = items.map((line) => {
      const matchedItem = itemsList.find(
        (it) =>
          it._id === line.itemId ||
          it._id === line.itemType ||
          `${it.name}${it.code ? ` (${it.code})` : ''}` === line.itemType
      );
      return {
        item: matchedItem?._id || line.itemId,
        quantity: Number(line.quantity),
        unit: line.unit || matchedItem?.unitOfMeasure || 'units',
      };
    });

    const payload = {
      pickupStore: pickupId,
      destinationStore: destinationId,
      ...(actorId ? { requestedBy: actorId, updatedBy: actorId } : {}),
      requestedPickupDate: formData.dispatchDate,
      requestedTimeWindow: parseTimeSlot(formData.timeSlot),
      items: mappedItems,
      reason: [formData.specialInstructions, ...formData.directives].filter(Boolean).join(' | '),
    };

    setSubmitting(true);
    try {
      const editMongoId = editData?.mongoId || editData?.rawBooking?._id;
      const url = editMongoId ? `${BOOKINGS_API}/${editMongoId}` : BOOKINGS_API;
      const method = editMongoId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save booking');
      }

      const savedBooking = data.booking;
      if (submitImmediately && savedBooking?._id && ['Draft', 'Changes Requested'].includes(savedBooking.status)) {
        const subRes = await apiFetch(`${BOOKINGS_API}/${savedBooking._id}/submit`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ updatedBy: actorId, reason: 'Submitted via Store Bookings UI' }),
        });
        const subData = await subRes.json();
        if (!subRes.ok) {
          throw new Error(subData.message || 'Booking saved as Draft, but submit failed');
        }
      }

      if (onSaved) await onSaved();
      onSuccess?.(
        editMongoId
          ? 'Booking updated successfully!'
          : submitImmediately
            ? 'Booking created and submitted successfully!'
            : 'Booking saved as Draft!'
      );
      onBack();
    } catch (err) {
      alert(err.message || 'Error saving booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    persistBooking(true);
  };

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  const payloadPercentage = Math.min((totalWeight / 5000) * 100, 100).toFixed(0);
  const selectedPickupObj =
    storesList.find((s) => s._id === formData.pickupStoreId || s.name === formData.pickupStore) ||
    storesList[0];
  const selectedDestObj = storesList.find(
    (s) => s._id === formData.destinationStore || s.name === formData.destinationStore
  );

  return (
    <div className="flex flex-col bg-white w-full min-h-full">
      {/* Header */}
      <div className="px-8 py-6 bg-white">
        <div className="flex items-center text-xs font-medium text-gray-400 mb-6">
          <button onClick={onBack} className="hover:text-gray-700 hover:underline">Bookings</button>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-green-700 font-semibold">{editData ? 'Edit Booking' : 'Create Booking'}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editData ? `Edit Booking #${editData.id}` : 'Create New Booking'}</h1>
            <p className="text-sm text-gray-400 mt-1">Modify transportation request and dispatch manifest specifications</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {editData ? `Editing #${editData.id}` : 'New Booking Draft'}
            </span>
            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-green-100">
              <CheckCircle2 size={14} /> TMS Tier-1 Node
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex-1">
        <form onSubmit={handleSubmit} id="create-booking-form" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Logistics Route */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-green-700" size={18} /> Logistics Route
              </h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Island Network (LK)</span>
            </div>
            
            <p className="text-[10px] text-gray-400 mb-6 -mt-4 pl-7">Select authorized distribution hubs and staging warehouses</p>

            <div className="grid grid-cols-2 gap-8 pl-7 mb-6">
              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full border-2 border-green-700"></div> Pickup Store / Hub</span>
                  <span className="text-gray-400 font-normal">Origin Gate</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.pickupStoreId || formData.pickupStore}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = storesList.find((s) => s._id === val || s.name === val);
                      const nextPickupId = found?._id || val;
                      setFormData((prev) => ({
                        ...prev,
                        pickupStoreId: nextPickupId,
                        pickupStore: found ? found.name : val,
                        destinationStore: prev.destinationStore === nextPickupId ? '' : prev.destinationStore,
                        destinationStoreId: prev.destinationStoreId === nextPickupId ? '' : prev.destinationStoreId,
                      }));
                    }}
                    className="w-full p-3.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 outline-none appearance-none"
                  >
                    {pickupStoresList.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500"></span> {selectedPickupObj?.address || selectedPickupObj?.region || 'Authorized Store Hub'}
                </p>
              </div>
              <div>
                <label className="flex justify-between text-[11px] font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full border-2 border-red-500"></div> Destination Store / Depot</span>
                  <span className="text-gray-400 font-normal">Destination Hub</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.destinationStore}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = storesList.find((s) => s._id === val || s.name === val);
                      setFormData({
                        ...formData,
                        destinationStoreId: found?._id || val,
                        destinationStore: val,
                      });
                    }}
                    className={`w-full p-3.5 border rounded-lg text-sm bg-white outline-none appearance-none focus:ring-1 focus:ring-green-700 ${errors.destinationStore ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select destination hub...</option>
                    {storesList
                      .filter((st) => st._id !== formData.pickupStoreId && st.name !== formData.pickupStore)
                      .map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name}
                        </option>
                      ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                {errors.destinationStore && <p className="text-red-500 text-xs mt-1">{errors.destinationStore}</p>}
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500"></span> {selectedDestObj?.address || selectedDestObj?.region || 'Authorized Destination Store'}
                </p>
              </div>
            </div>
            
            {formData.destinationStore && (
              <div className="ml-7 bg-green-50/50 rounded-lg p-5 border border-green-100 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="bg-green-100 w-8 h-8 flex items-center justify-center rounded-md text-green-800 font-bold text-sm">A</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-0.5">Inter-Store Route <span className="text-[9px] bg-gray-200/50 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Verified</span></p>
                    <p className="text-[11px] text-gray-500">{selectedPickupObj?.name || ''} → {selectedDestObj?.name || ''}</p>
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Items</p>
                    <p className="text-sm font-bold text-gray-900">{items.length}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total Weight</p>
                    <p className="text-sm font-bold text-green-700">{totalWeight.toLocaleString()} kg</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Schedule */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-green-700" size={18} /> Dispatch Schedule
              </h2>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Timezone: UTC+05:30 (IST)</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-6 -mt-4 pl-7">Define pickup window compliance and driver arrival buffer</p>
            
            <div className="grid grid-cols-2 gap-8 pl-7">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Requested Pickup Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="date" value={formData.dispatchDate} onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})} className={`w-full pl-12 p-3.5 border rounded-lg text-sm text-gray-600 outline-none focus:ring-1 focus:ring-green-700 ${errors.dispatchDate ? 'border-red-500' : 'border-gray-200'}`} />
                </div>
                {errors.dispatchDate && <p className="text-red-500 text-xs mt-1">{errors.dispatchDate}</p>}
                <p className="text-[10px] text-gray-400 mt-2">Select requested pickup date from database schedule</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Loading Dock Time Slot</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <select value={formData.timeSlot} onChange={(e) => setFormData({...formData, timeSlot: e.target.value})} className={`w-full pl-12 p-3.5 border rounded-lg text-sm bg-white text-gray-600 outline-none appearance-none focus:ring-1 focus:ring-green-700 ${errors.timeSlot ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">Select time slot...</option>
                    <option value="Morning Prime: 09:00 AM - 12:00 PM IST">Morning Prime: 09:00 AM - 12:00 PM IST</option>
                    <option value="Afternoon: 01:00 PM - 04:00 PM IST">Afternoon: 01:00 PM - 04:00 PM IST</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-4 rotate-90 text-gray-400" size={16} />
                </div>
                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
                <p className="text-[10px] text-green-700 mt-2 flex items-center gap-1.5 font-medium"><ShieldAlert size={12}/> Server validates slot and capacity rules</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Items to Transport */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-green-700" size={18} /> Items to Transport (Payload Manifest)
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 pl-7">Itemized consignment cargo breakdown with automated aggregate tare</p>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">{items.length} Consignments</span>
            </div>
            
            <div className="space-y-4 pl-7 mt-8">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-center bg-gray-50/30 border border-gray-100 rounded-xl p-4 transition-colors">
                  <div className="flex-1 relative">
                    <select value={item.itemType} onChange={(e) => handleItemChange(item.id, 'itemType', e.target.value)} className={`w-full p-3 border-b text-sm bg-transparent text-gray-600 outline-none appearance-none focus:border-green-700 ${errors.items?.[index]?.itemType ? 'border-red-500' : 'border-gray-200'}`}>
                      <option value="">Select item...</option>
                      {itemsList.map((opt) => {
                        const label = `${opt.name}${opt.code ? ` (${opt.code})` : ''}`;
                        return (
                          <option key={opt._id} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronRight className="absolute right-2 top-3.5 rotate-90 text-gray-400" size={16} />
                  </div>
                  
                  <div className="w-32 flex items-center border-b border-gray-200 pb-1">
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className={`w-full p-2 text-sm outline-none bg-transparent ${errors.items?.[index]?.quantity ? 'text-red-500 placeholder-red-300' : 'text-gray-600'}`} placeholder="Qty" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">{item.unit}</span>
                  </div>
                  
                  <div className="w-40 flex items-center border-b border-gray-200 pb-1 bg-green-50/30 px-3 rounded-t-lg">
                    <Package size={16} className="text-green-700 shrink-0" />
                    <input type="number" min="0.1" step="0.1" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)} className={`w-full p-2 text-sm text-right outline-none font-bold text-gray-800 bg-transparent ${errors.items?.[index]?.weight ? 'text-red-500 placeholder-red-300' : ''}`} placeholder="Weight" />
                    <span className="text-[10px] text-gray-500 font-bold ml-1">{item.weightUnit}</span>
                  </div>
                  
                  <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 ml-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={handleAddItem} className="mt-6 ml-7 flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-lg">
              <Plus size={16} /> Add Item
            </button>

            {/* Payload Summary */}
            <div className="mt-10 ml-7 bg-gray-50/50 rounded-xl p-6 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-5">
                <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 text-gray-400"><Truck size={24}/></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">Consolidated Net Payload</h3>
                    <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 tracking-wider uppercase">
                      <CheckCircle2 size={10} /> Within Axle Limit
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">Recommended Carrier Class: Rigid Body (Medium Heavy 4x2 / 6x2)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">Total Gross Weight</p>
                  <p className="text-xl font-bold text-gray-900">{totalWeight.toLocaleString()} kg</p>
                </div>
                <div className="text-right border-l border-gray-200 pl-10">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">Fleet Rating Limit</p>
                  <p className="text-sm font-bold text-gray-900">5,000 kg</p>
                </div>
                <div className="w-32 pl-4">
                  <div className="flex justify-between text-[9px] font-bold mb-2">
                    <span className="text-gray-400 uppercase tracking-widest">Load</span>
                    <span className="text-green-700">{payloadPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-700 rounded-full transition-all duration-500" style={{ width: `${payloadPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2" />

          {/* Additional Info */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="text-green-700" size={18} /> Additional Information
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 pl-7">Handling protocols, security seals, and destination gate access</p>
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">Optional Directives</span>
            </div>

            <div className="mb-6 pl-7">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-[11px] font-bold text-gray-700">Special Handling & Gate Instructions</label>
                <span className="text-[10px] text-gray-400 font-medium">Max 500 characters</span>
              </div>
              <textarea 
                rows="4"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                placeholder="Provide special handling notes, dock instructions, or delivery remarks..."
                className="w-full p-4 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-green-700 focus:border-green-700 outline-none text-gray-600 bg-gray-50/50 placeholder-gray-400 resize-none"
              ></textarea>
            </div>

            <div className="pl-7 flex items-center gap-4">
              <p className="text-[11px] font-bold text-gray-700">Add Quick Directives:</p>
              <div className="flex flex-wrap gap-2.5">
                {quickDirectives.map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => toggleDirective(dir)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                      formData.directives.includes(dir) 
                      ? 'bg-gray-100 border-gray-200 text-gray-800' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-50 border-t-2 mt-4 mb-4" />

          {/* Footer inside the card */}
          <div className="px-8 pb-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-400 font-bold tracking-widest flex items-center gap-1.5 uppercase">
                <ShieldAlert size={14} className="text-gray-400"/> Encrypted Master Data Record • SLA Verified • ISO-28000 Security Compliant
              </p>
              <div className="flex gap-4">
                <button type="button" onClick={onBack} disabled={submitting} className="px-6 py-3 text-xs font-bold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="button" onClick={() => persistBooking(false)} disabled={submitting} className="px-6 py-3 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Save size={16}/> Save Draft
                </button>
                <button type="submit" disabled={submitting} className="px-8 py-3 bg-[#0d3b2e] rounded-lg text-xs font-bold text-white hover:bg-[#092a21] transition-colors flex items-center gap-2 shadow-sm">
                  {editData ? 'Save Changes' : 'Submit Booking'} <Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 2. MAIN BOOKINGS LIST COMPONENT (FE-4)
// ==========================================
const StoreBookings = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null); 
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses'); 
  const [activeButtonFilter, setActiveButtonFilter] = useState('All'); 
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [bookings, setBookings] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [assignedStoreId, setAssignedStoreId] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingNotice, setBookingNotice] = useState('');

  const transformBookingFromApi = (b) => {
    const pickupName = b.pickupStore?.name || '';
    const destName = b.destinationStore?.name || '';
    const lineSummaries = Array.isArray(b.items)
      ? b.items.map((l) => {
          const itemName = l.item?.name || '';
          const qty = Number(l.quantity) || 0;
          const unit = l.unit || l.item?.unitOfMeasure || 'units';
          return `${itemName} (${qty} ${unit})`.trim();
        })
      : [];

    const computedWeight = Array.isArray(b.items)
      ? b.items.reduce((sum, l) => {
          const qty = Number(l.quantity) || 0;
          const wt = Number(l.item?.weightKg) || 0;
          return sum + qty * wt;
        }, 0)
      : 0;

    const formattedHistory = Array.isArray(b.changeHistory)
      ? b.changeHistory.map((h) => ({
          time: h.changedAt
            ? new Date(h.changedAt).toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }) + ' IST'
            : '',
          action: h.reason ? `${h.action}: ${h.reason}` : `${h.action} (${h.toStatus})`,
          by: h.changedBy?.name || h.changedBy?.username || (h.changedBy ? 'Authorized User' : 'System'),
        }))
      : [];

    return {
      mongoId: b._id,
      id: b.bookingCode || b._id,
      backendStatus: b.status,
      status: mapBackendStatusToUi(b.status),
      type: 'Outbound',
      date: formatDisplayDate(b.requestedPickupDate, b.requestedTimeWindow),
      rawDate: b.requestedPickupDate ? new Date(b.requestedPickupDate).toISOString().split('T')[0] : '',
      from: pickupName,
      to: destName,
      cargo: lineSummaries.join(' & '),
      consignments: Array.isArray(b.items) ? b.items.length : 0,
      distance: b.distanceKm ? `${b.distanceKm} km` : '',
      driver: b.assignedTrip?.driver?.name || b.assignedTrip?.driver || b.assignedVehicle?.assignedDriverName || '',
      vehicle: b.assignedVehicle?.registrationNumber || b.assignedVehicle?.vehicleId || b.assignedVehicle?.plateNumber || '',
      totalWeight: `${computedWeight.toLocaleString()} kg`,
      history: formattedHistory,
      rawBooking: b,
    };
  };

  const fetchAllData = async () => {
    try {
      const headers = getAuthHeaders();
      const [bookingsRes, optionsRes, meRes] = await Promise.allSettled([
        apiFetch(BOOKINGS_API, { headers }),
        apiFetch(`${BOOKINGS_API}/options`, { headers }),
        apiFetch(`${API_ROOT}/auth/me`, { headers }),
      ]);

      let fetchedStores = [];
      let fetchedItems = [];
      let meUserId = '';

      if (optionsRes.status === 'fulfilled' && optionsRes.value.ok) {
        const options = await optionsRes.value.json();
        fetchedStores = Array.isArray(options.stores) ? options.stores : [];
        fetchedItems = Array.isArray(options.items) ? options.items : [];
      }

      if (meRes.status === 'fulfilled' && meRes.value.ok) {
        const mData = await meRes.value.json();
        meUserId = extractUserIdFromAny(mData);
        const meUser = mData.user || mData.data?.user || {};
        const role = String(meUser.role || '').toUpperCase();
        const storeId = meUser.storeId || (typeof meUser.store === 'string' ? meUser.store : meUser.store?._id);
        setAssignedStoreId(role === 'ADMIN' ? '' : (isObjectId(storeId) ? storeId : ''));
      }

      let rawList = [];
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
        const bData = await bookingsRes.value.json();
        rawList = Array.isArray(bData) ? bData : bData.bookings || [];
        const mapped = rawList.map(transformBookingFromApi);
        setBookings(mapped);

        setSelectedBooking((prev) => {
          if (!prev) return null;
          return mapped.find((m) => (m.mongoId && m.mongoId === prev.mongoId) || m.id === prev.id) || null;
        });
      }

      const bookingUserId = rawList.find((b) => isObjectId(b?.requestedBy?._id || b?.requestedBy))
        ? (rawList.find((b) => isObjectId(b?.requestedBy?._id || b?.requestedBy)).requestedBy._id ||
            rawList.find((b) => isObjectId(b?.requestedBy?._id || b?.requestedBy)).requestedBy)
        : '';

      setCurrentUserId(meUserId || resolveCurrentUserId() || bookingUserId || '');

      if (fetchedStores.length === 0 && rawList.length > 0) {
        const storeMap = new Map();
        rawList.forEach((b) => {
          if (b.pickupStore?._id) storeMap.set(b.pickupStore._id, b.pickupStore);
          if (b.destinationStore?._id) storeMap.set(b.destinationStore._id, b.destinationStore);
        });
        fetchedStores = Array.from(storeMap.values());
      }

      if (fetchedItems.length === 0 && rawList.length > 0) {
        const itemMap = new Map();
        rawList.forEach((b) => {
          (b.items || []).forEach((l) => {
            if (l.item?._id) itemMap.set(l.item._id, l.item);
          });
        });
        fetchedItems = Array.from(itemMap.values());
      }

      setStoresList(fetchedStores);
      setItemsList(fetchedItems);
    } catch (err) {
      console.error('Failed to load store bookings:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cargo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDropdownStatus = 
      statusFilter === 'All Statuses' || booking.status === statusFilter;
      
    const matchesButtonStatus = 
      activeButtonFilter === 'All' || booking.status === activeButtonFilter;

    let matchesDate = true;
    if (startDate || endDate) {
      const bDate = new Date(booking.rawDate);
      if (startDate) {
        const sDate = new Date(startDate);
        if (bDate < sDate) matchesDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        if (bDate > eDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDropdownStatus && matchesButtonStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-green-100 text-green-800';
      case 'Confirmed': return 'bg-gray-100 text-gray-800';
      case 'Pending Approval': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditBooking = (booking) => {
    if (!booking) return false;
    return ['Draft', 'Changes Requested'].includes(booking.backendStatus);
  };

  const canCancelBooking = (booking) => {
    if (!booking) return false;
    return ['Draft', 'Submitted', 'Changes Requested', 'Approved'].includes(booking.backendStatus);
  };

  const handleEditClick = () => {
    if (!selectedBooking) return;
    setBookingToEdit(selectedBooking);
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setIsCreating(false);
    setBookingToEdit(null);
  };

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Status', 'Type', 'Date', 'From', 'To', 'Cargo', 'Consignments', 'Total Weight'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.status,
      b.type,
      `"${b.date}"`,
      `"${b.from}"`,
      `"${b.to}"`,
      `"${b.cargo}"`,
      b.consignments,
      b.totalWeight || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bookings_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = () => {
    if (!selectedBooking) return;
    const blob = new Blob([JSON.stringify(selectedBooking.rawBooking || selectedBooking, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedBooking.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCancelBookingClick = async () => {
    if (!selectedBooking || !selectedBooking.mongoId) return;
    const reason = window.prompt('Enter cancellation reason:', 'Cancelled by store user');
    if (!reason?.trim()) return;

    setIsCancelling(true);
    setBookingNotice('');
    try {
      const res = await apiFetch(`${BOOKINGS_API}/${selectedBooking.mongoId}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ updatedBy: currentUserId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      await fetchAllData();
      const trip = data.trip;
      setBookingNotice(trip
        ? `Booking cancelled. Trip ${trip.id || ''} recalculated: ${trip.load || '0 Units'}; ${trip.route || 'no remaining route'}; ${trip.activeReservationsRevalidated || 0} reservations revalidated.`
        : 'Booking cancelled successfully.');
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isCreating) {
    return (
      <CreateBookingView
        onBack={handleBackToList}
        editData={bookingToEdit}
        storesList={storesList}
        itemsList={itemsList}
        currentUserId={currentUserId}
        assignedStoreId={assignedStoreId}
        onSaved={fetchAllData}
        onSuccess={setBookingNotice}
      />
    );
  }

  const countAll = bookings.length;
  const countInTransit = bookings.filter(b => b.status === 'In Transit').length;
  const countConfirmed = bookings.filter(b => b.status === 'Confirmed').length;
  const countPending = bookings.filter(b => b.status === 'Pending Approval').length;
  const activeOrdersCount = bookings.filter(b => !['Completed', 'Cancelled', 'Rejected'].includes(b.backendStatus)).length;

  const selectedRaw = selectedBooking?.rawBooking || {};
  const selectedRawItems = Array.isArray(selectedRaw.items) ? selectedRaw.items : [];

  return (
    <div className="flex flex-col bg-gray-50"> 
      
      {/* Top Header */}
      <div className="flex justify-between items-start p-6 bg-transparent shrink-0">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-950">Manage Booking</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage dispatch schedules, real-time consignment movements, and delivery milestones.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">{activeOrdersCount} Active Orders</span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => { setBookingToEdit(null); setIsCreating(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#113b2e] text-white rounded-md text-sm font-medium hover:bg-[#0c2a21]">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      {bookingNotice && (
        <div role="status" className="mx-6 mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {bookingNotice}
        </div>
      )}

      <div className="flex px-6 pb-6 gap-6 items-start"> 
        
        {/* Left Column: List */}
        <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 space-y-4 shrink-0">
            
            <div className="flex gap-2">
               <button 
                  onClick={() => setActiveButtonFilter('All')} 
                  className={`px-4 py-1.5 text-xs rounded-full font-medium transition-colors ${activeButtonFilter === 'All' ? 'bg-[#0f3c2c] text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
               >
                 All {countAll}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('In Transit')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'In Transit' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'In Transit' ? 'bg-green-400' : 'bg-green-500'}`}></span> In Transit {countInTransit}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('Confirmed')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'Confirmed' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'Confirmed' ? 'bg-gray-300' : 'bg-gray-400'}`}></span> Confirmed {countConfirmed}
               </button>
               <button 
                  onClick={() => setActiveButtonFilter('Pending Approval')} 
                  className={`px-4 py-1.5 text-xs rounded-full border flex items-center gap-1.5 font-medium transition-colors ${activeButtonFilter === 'Pending Approval' ? 'bg-[#0f3c2c] text-white border-[#0f3c2c]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${activeButtonFilter === 'Pending Approval' ? 'bg-gray-300' : 'bg-gray-300'}`}></span> Pending {countPending}
               </button>
            </div>

            <div className="flex gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search ID, destination, cargo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#113b2e]" 
                />
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => {
                   setStatusFilter(e.target.value);
                   if (e.target.value !== 'All Statuses') setActiveButtonFilter('All');
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden px-2 gap-1">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="py-1.5 text-xs text-gray-700 outline-none bg-transparent"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-1.5 text-xs text-gray-700 outline-none bg-transparent"
                />
                <Calendar size={14} className="text-gray-400 ml-1" />
              </div>

            </div>
          </div>

          <div>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.mongoId || booking.id} onClick={() => setSelectedBooking(booking)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedBooking?.id === booking.id ? 'bg-green-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">#{booking.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(booking.status)} flex items-center gap-1`}>
                         {booking.status === 'In Transit' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                         {booking.status}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={12}/> {booking.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-bold mb-1 truncate">
                        <span className="truncate">{booking.from}</span>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{booking.to}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Package size={12}/>
                        <span className="truncate max-w-[300px]">{booking.cargo}</span>
                        <span className="whitespace-nowrap ml-2 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">• {booking.consignments} Consignments</span>
                      </div>
                    </div>
                    {/* Light Green Arrow */}
                    <div className="w-8 h-8 rounded-full bg-[#113b2e] flex items-center justify-center text-white shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No bookings found matching your criteria.
              </div>
            )}
            
            <div className="p-4 flex justify-between items-center text-xs text-gray-500">
               <span>Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings</span>
               <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100"><ChevronRight size={14} className="rotate-180"/></button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-[#113b2e] text-white font-bold">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold">2</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold">3</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"><ChevronRight size={14}/></button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        {selectedBooking && (
          <div className="w-[450px] shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sticky top-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">#{selectedBooking.id}</h2>
                  <p className="text-xs text-gray-500 mt-1">Created on {selectedBooking.date.split(' - ')[0]} • Status: <span className="font-bold text-gray-700">{selectedBooking.backendStatus}</span></p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)} flex items-center gap-1`}>
                    {selectedBooking.status === 'In Transit' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#113b2e] rounded text-white shrink-0"><Truck size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedBooking.from} → {selectedBooking.to}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{selectedRaw.requestedTimeWindow?.startTime || ''} {selectedRaw.requestedTimeWindow?.endTime ? `- ${selectedRaw.requestedTimeWindow.endTime}` : ''}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">{selectedBooking.totalWeight}</p>
                  <p className="text-[10px] text-green-600 font-bold mt-0.5">{selectedBooking.backendStatus}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center px-6 pt-4 pb-2 border-b border-gray-200 shrink-0">
                <div className="flex gap-6">
                  <button onClick={() => setActiveTab('milestones')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'milestones' ? 'border-[#113b2e] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>Consignment Milestones</button>
                  <button onClick={() => setActiveTab('history')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'history' ? 'border-[#113b2e] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>Change History</button>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{selectedBooking.backendStatus}</span>
              </div>

              <div className="p-6">
                {activeTab === 'milestones' ? (
                  <div className="space-y-6">
                     <div className="relative pl-6 border-l-2 border-[#113b2e] space-y-6">
                        <div className="relative">
                          <CheckCircle2 className="absolute -left-[31px] bg-white text-[#113b2e]" size={18} />
                          <h4 className="text-sm font-bold text-gray-900">Request Created</h4>
                          <p className="text-xs text-gray-500 mt-1">{selectedBooking.date}</p>
                        </div>
                        <div className="relative">
                          <CheckCircle2 className={`absolute -left-[31px] bg-white ${selectedBooking.vehicle || selectedBooking.driver ? 'text-[#113b2e]' : 'text-gray-300'}`} size={18} />
                          <h4 className="text-sm font-bold text-gray-900">Vehicle & Driver</h4>
                          <p className="text-xs text-gray-500 mt-1">{[selectedBooking.vehicle, selectedBooking.driver].filter(Boolean).join(' • ') || 'Pending allocation'}</p>
                        </div>
                        {selectedBooking.status === 'In Transit' && (
                          <div className="relative border-l-2 border-dashed border-gray-200 -ml-[2px] pl-[26px]">
                            <Truck className="absolute -left-[27px] bg-white text-[#113b2e] p-0.5 border-2 border-[#113b2e] rounded-full" size={18} />
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">In Transit <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span></h4>
                            <p className="text-xs text-gray-500 mt-1">{selectedBooking.from} → {selectedBooking.to}</p>
                          </div>
                        )}
                        <div className="relative border-l-2 border-transparent -ml-[2px] pl-[26px]">
                          <CheckCircle2 className={`absolute -left-[27px] bg-white ${selectedBooking.status === 'Completed' ? 'text-[#113b2e]' : 'text-gray-300'}`} size={18} />
                          <h4 className={`text-sm font-bold ${selectedBooking.status === 'Completed' ? 'text-gray-900' : 'text-gray-400'}`}>Gate Arrival & Offload</h4>
                          <p className="text-xs text-gray-400 mt-1">{selectedBooking.to}</p>
                        </div>
                     </div>

                     {/* Store Route & Asset */}
                     <div className="mt-8 border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Store Route & Asset</h4>
                        <div className="flex gap-2 mb-3">
                           <div className="bg-gray-50 border border-gray-100 flex-1 p-3 rounded text-xs">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Origin Hub</span>
                              <p className="font-bold text-gray-900 mt-1">{selectedBooking.from}</p>
                              <p className="text-gray-500 mt-1 leading-tight">{selectedRaw.pickupStore?.address || selectedRaw.pickupStore?.region || ''}</p>
                           </div>
                           <div className="bg-gray-50 border border-gray-100 flex-1 p-3 rounded text-xs">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Destination Hub</span>
                              <p className="font-bold text-gray-900 mt-1">{selectedBooking.to}</p>
                              <p className="text-gray-500 mt-1 leading-tight">{selectedRaw.destinationStore?.address || selectedRaw.destinationStore?.region || ''}</p>
                           </div>
                        </div>
                        {(selectedBooking.driver || selectedBooking.vehicle) && (
                          <div className="bg-gray-50 border border-gray-100 p-3 rounded flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#113b2e] rounded-full flex items-center justify-center text-white text-xs font-bold tracking-wider">
                                  {(selectedBooking.driver || 'DR').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-900 leading-none mb-1">{selectedBooking.driver}</p>
                                  <p className="text-[10px] text-gray-500">{selectedRaw.assignedVehicle?.assignedDriver?.name || selectedRaw.assignedVehicle?.assignedDriverName || selectedRaw.assignedTrip?.driver || ''}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-bold text-gray-900 leading-none mb-1">{selectedBooking.vehicle}</p>
                                <p className="text-[10px] text-gray-500">{selectedRaw.assignedVehicle?.type || selectedRaw.assignedVehicle?.vehicleType || ''}</p>
                             </div>
                          </div>
                        )}
                     </div>

                     {/* Manifest Items */}
                     <div className="mt-6">
                        <div className="flex justify-between items-end mb-3">
                           <h4 className="text-sm font-bold text-gray-900">Manifest Items ({selectedBooking.consignments})</h4>
                           <span className="text-[10px] font-bold text-gray-600">Total: {selectedBooking.totalWeight}</span>
                        </div>
                        <div className="border border-gray-200 rounded text-sm bg-white divide-y divide-gray-100">
                           {selectedRawItems.map((line, idx) => {
                             const itemObj = typeof line.item === 'object' ? line.item : {};
                             const qty = Number(line.quantity) || 0;
                             const unitWt = Number(itemObj.weightKg) || 0;
                             return (
                               <div key={line._id || idx} className="p-3 flex justify-between items-center">
                                  <div>
                                     <p className="font-bold text-gray-800 text-xs">{itemObj.name || ''}</p>
                                     <p className="text-[10px] text-gray-500 mt-0.5">{itemObj.code || ''}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="font-bold text-gray-800 text-xs">{(qty * unitWt).toLocaleString()} kg</p>
                                     <p className="text-[10px] text-gray-500 mt-0.5">{qty} {line.unit || 'units'}</p>
                                  </div>
                               </div>
                             );
                           })}
                        </div>
                        {selectedRaw.reviewNote && (
                          <div className="mt-3 bg-green-50/50 border border-green-100 rounded p-2.5 flex items-start gap-2">
                             <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
                             <p className="text-[10px] font-bold text-green-800">{selectedRaw.reviewNote}</p>
                          </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {selectedBooking.history?.map((log, idx) => (
                        <div key={idx} className="flex gap-4 text-sm">
                           <div className="text-gray-400 pt-1 shrink-0"><History size={16} /></div>
                           <div>
                              <p className="text-gray-900 font-medium">{log.action}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{log.time} • by <span className="font-semibold">{log.by}</span></p>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
               {/* 1. Download Button */}
               <button 
                  onClick={handleDownloadClick}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50 shrink-0 shadow-sm"
               >
                  <Download size={16} />
               </button>
               
               {/* 2. Cancel Button */}
               <button 
                  onClick={handleCancelBookingClick}
                  disabled={!canCancelBooking(selectedBooking) || isCancelling}
                  className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${canCancelBooking(selectedBooking) && !isCancelling ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}`}
               >
                  {isCancelling ? 'Cancelling…' : 'Cancel Booking'}
               </button>
               
               {/* 3. Edit Button */}
               <button 
                  onClick={handleEditClick}
                  disabled={!canEditBooking(selectedBooking)}
                  className={`px-6 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm ${canEditBooking(selectedBooking) ? 'bg-[#0f3c2c] text-white hover:bg-[#0a2e21]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
               >
                  <Edit2 size={16} /> Edit Booking
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default StoreBookings;
