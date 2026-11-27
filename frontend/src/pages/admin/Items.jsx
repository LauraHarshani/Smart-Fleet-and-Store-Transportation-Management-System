import { useCallback, useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Box, CheckCircle2, ArrowLeft, RotateCcw, Download, ChevronDown, Shield, AlertTriangle, Camera, Leaf, Layers, Thermometer, Droplets, FileArchive, Activity, Snowflake, MapPin } from 'lucide-react';
import { getAllItems, createItem, updateItem, deleteItem } from '../../services/itemService';

const STATUS_STYLE_MAP = {
  'Active': 'bg-[#d1f4e0]/60 text-[#0d9468]',
  'Under Review': 'bg-gray-100 text-gray-500',
  'Restricted': 'bg-red-50 text-red-600',
  'Inactive': 'bg-gray-100 text-gray-500'
};

const getCategoryBadgeStyle = (cat = '') => {
  const lower = cat.toLowerCase();
  if (lower.includes('cold') || lower.includes('pharma') || lower.includes('fresh')) {
    return 'bg-[#e8f8f2] text-[#0d9468] border-[#0fa979]/30';
  }
  if (lower.includes('chem') || lower.includes('hazmat')) {
    return 'bg-red-50 text-red-600 border-red-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [uomFilter, setUomFilter] = useState('All UoMs');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form States
  const [sku, setSku] = useState('');
  const [itemName, setItemName] = useState('');
  const [freightCat, setFreightCat] = useState('');
  const [uom, setUom] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState('0');
  const [grossWeight, setGrossWeight] = useState('');
  const [itemStatus, setItemStatus] = useState('Active');
  const [itemImage, setItemImage] = useState(null);

  // Toggles for Edit View
  const [stackable, setStackable] = useState(true);
  const [tempMonitor, setTempMonitor] = useState(false);
  const [moisture, setMoisture] = useState(true);
  const [fragile, setFragile] = useState(false);

  const fileInputRef = useRef(null);

  const buildNextItemCode = (existingList = items) => {
    const usedCodes = new Set(
      (Array.isArray(existingList) ? existingList : []).map((it) =>
        String(it.code || it.id || '').trim().toUpperCase()
      )
    );
    for (let attempt = 0; attempt < 25; attempt++) {
      const candidate = `ITM-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!usedCodes.has(candidate)) return candidate;
    }
    return `ITM-${Date.now().toString().slice(-4)}`;
  };

  const normalizeItemRecord = useCallback((raw, idx = 0) => {
    const codeText = raw.code || raw.id || `ITM-${1001 + idx}`;
    const catText = raw.category || 'Dry Grocery / Export';
    const uomText = raw.unitOfMeasure || raw.uom || 'Cartons / Cases (CTN)';
    const weightNum = raw.weightKg !== undefined && raw.weightKg !== null
      ? Number(raw.weightKg)
      : parseFloat(String(raw.weight || '0').replace(/[^\d.]/g, '')) || 0;
    const statusText = raw.status || 'Active';

    return {
      ...raw,
      id: codeText,
      code: codeText,
      name: raw.name || '',
      description: raw.description || 'Standard commercial catalog item',
      category: catText,
      uom: uomText,
      weightKg: weightNum,
      inventoryQuantity: Number.isInteger(Number(raw.inventoryQuantity)) ? Number(raw.inventoryQuantity) : 0,
      weight: `${weightNum.toFixed(1)} kg`,
      status: statusText,
      statusColor: STATUS_STYLE_MAP[statusText] || STATUS_STYLE_MAP['Active'],
      categoryColor: getCategoryBadgeStyle(catText),
      image: raw.image || null
    };
  }, []);

  const loadItemsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllItems().catch((err) => {
        console.error('getAllItems failed:', err);
        return [];
      });
      setItems((Array.isArray(data) ? data : []).map(normalizeItemRecord));
    } finally {
      setLoading(false);
    }
  }, [normalizeItemRecord]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadItemsData(); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadItemsData]);

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || i.category === categoryFilter;
    const matchesUom = uomFilter === 'All UoMs' || (i.uom || '').toLowerCase().includes(uomFilter.replace(/s$/i, '').toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || i.status === statusFilter;
    return matchesSearch && matchesCategory && matchesUom && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All Categories');
    setUomFilter('All UoMs');
    setStatusFilter('All Statuses');
    setCurrentPage(1);
  };

  const handleDelete = async (item) => {
    const targetId = item.code || item.id || item._id;
    if (!targetId) return;
    if (window.confirm('Are you sure you want to remove this catalog item?')) {
      try {
        await deleteItem(targetId);
        setItems((prev) => prev.filter((i) => (i._id || i.id) !== (item._id || item.id)));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  const openAddItem = () => {
    setEditingItem(null);
    setSku(buildNextItemCode(items));
    setItemName('');
    setFreightCat('');
    setUom('');
    setInventoryQuantity('0');
    setGrossWeight('');
    setItemStatus('Active');
    setItemImage(null);
    setCurrentView('add');
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setSku(item.code || item.id);
    setItemName(item.name);
    setFreightCat(item.category);
    setUom(item.uom);
    setInventoryQuantity(String(item.inventoryQuantity ?? 0));
    setGrossWeight(String(item.weightKg ?? String(item.weight || '').replace(/[^\d.]/g, '')));
    setItemStatus(item.status || 'Active');
    setItemImage(item.image || null);
    if (item.handlingConstraints) {
      setStackable(Boolean(item.handlingConstraints.stackable));
      setTempMonitor(Boolean(item.handlingConstraints.tempMonitor));
      setMoisture(Boolean(item.handlingConstraints.moisture));
      setFragile(Boolean(item.handlingConstraints.fragile));
    } else {
      setStackable(true);
      setTempMonitor(item.category?.toLowerCase().includes('cold') || false);
      setMoisture(true);
      setFragile(false);
    }
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
    setEditingItem(null);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    const finalCode = (sku || buildNextItemCode(items)).trim().toUpperCase();
    if (!itemName.trim() || !uom) {
      alert('Please fill in required fields (Item Name and Unit of Measure).');
      return;
    }

    const weightVal = parseFloat(grossWeight) || 0;
    const catVal = freightCat || 'Dry Grocery / Export';

    const apiPayload = {
      code: finalCode,
      name: itemName.trim(),
      description: `${catVal} — Standard freight catalog item`,
      category: catVal,
      unitOfMeasure: uom,
      inventoryQuantity: Number(inventoryQuantity),
      weightKg: weightVal,
      isHazardous: catVal.toLowerCase().includes('hazmat') || catVal.toLowerCase().includes('chem'),
      status: 'Active',
      image: itemImage
    };

    try {
      const created = await createItem(apiPayload);
      setItems((prev) => [normalizeItemRecord(created), ...prev]);
      closeView();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating item');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const targetId = editingItem.code || editingItem.id || editingItem._id;
    const weightVal = parseFloat(grossWeight) || 0;

    const apiUpdate = {
      name: itemName.trim(),
      category: freightCat,
      unitOfMeasure: uom,
      inventoryQuantity: Number(inventoryQuantity),
      weightKg: weightVal,
      status: itemStatus,
      handlingConstraints: {
        stackable,
        tempMonitor,
        moisture,
        fragile
      },
      image: itemImage
    };

    try {
      const saved = await updateItem(targetId, apiUpdate);
      setItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === (editingItem._id || editingItem.id)
            ? normalizeItemRecord({ ...i, ...saved })
            : i
        )
      );
      closeView();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating item');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Item Code', 'Name', 'Description', 'Category', 'UoM', 'Inventory Quantity', 'Weight', 'Status'];
    const csvRows = filteredItems.map((i) => {
      return [i.id, `"${i.name}"`, `"${i.description}"`, `"${i.category}"`, `"${i.uom}"`, i.inventoryQuantity, `"${i.weight}"`, `"${i.status}"`].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logifleet_items_export.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const generateAutoSku = () => {
    setSku(buildNextItemCode(items));
  };

  const totalMetricTonnes = (items.reduce((sum, i) => sum + (Number(i.weightKg) || 0), 0) / 1000).toFixed(2);
  const coldChainCount = items.filter((i) => (i.category || '').toLowerCase().includes('cold') || (i.category || '').toLowerCase().includes('fresh')).length;
  const coldChainPct = items.length > 0 ? ((coldChainCount / items.length) * 100).toFixed(1) : '0.0';
  const activeCount = items.filter((i) => i.status === 'Active').length;
  const restrictedOrReviewCount = items.filter((i) => i.status !== 'Active').length;
  const compliancePct = items.length > 0 ? ((activeCount / items.length) * 100).toFixed(1) : '100.0';

  // ----------------------------------------------------
  // 1. ADD NEW ITEM VIEW
  // ----------------------------------------------------
  if (currentView === 'add') {
    return (
      <div className="p-8 bg-[#f8faf9] min-h-screen font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span>ITEMS</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">ADD NEW ITEM</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Add New Item</h1>
            <span className="bg-[#d1f4e0] text-[#0d9468] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5">
               ● NEW RECORD
            </span>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Item List
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-8 -mt-6">Create and register a new master SKU catalog entry with packaging specs and tare metrics.</p>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-[1000px] mx-auto">
            <div className="flex justify-between items-center pb-5 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#113b2e] rounded-lg flex items-center justify-center text-white"><Box size={20}/></div>
                 <div>
                    <h3 className="text-[15px] font-bold text-[#113b2e] flex items-center gap-3">
                      Item Master Details <span className="text-[9px] text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-200">TMS-SKU-V4</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">Enter core catalog identification, commercial classification, and physical packaging metrics.</p>
                 </div>
              </div>
              <div className="text-[10px] text-gray-500 font-bold border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                 <Shield size={12} className="text-[#0fa979]"/> Audit Tracked
              </div>
            </div>

            <form id="addItemForm" onSubmit={handleCreateItem} className="space-y-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-gray-900">Item Code / SKU <span className="text-[#0fa979]">(Auto)</span></label>
                    <button type="button" onClick={generateAutoSku} className="text-[10px] font-bold text-[#0fa979] flex items-center gap-1 hover:underline cursor-pointer"><RotateCcw size={10}/> Auto-generate</button>
                  </div>
                  <input type="text" value={sku} readOnly className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold text-[#113b2e] outline-none shadow-sm cursor-default"/>
                  <p className="text-[9px] text-gray-500 mt-2 font-medium">Automatically generated unique SKU code (click Auto-generate to refresh).</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-900 mb-2">Gross Weight per Unit <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="number" step="0.01" min="0" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} placeholder="0.00" className="w-full pl-4 pr-16 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none focus:border-[#0fa979] shadow-sm transition-all" required/>
                    <div className="absolute inset-y-0 right-1 flex items-center">
                       <span className="bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">kg / unit</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-2 font-medium">Net tare plus secondary and palletizing packaging weight.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-900 mb-2">Item Name / Description <span className="text-red-500">*</span></label>
                  <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Premium Ceylon High-Grown Tea FBOPF - Export Grade" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none focus:border-[#0fa979] shadow-sm transition-all" required/>
                  <p className="text-[9px] text-gray-500 mt-2 font-medium">Full commercial commodity designation for bills of lading, manifest logs, and export dockets.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-900 mb-2">Freight Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={freightCat} onChange={(e) => setFreightCat(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 outline-none appearance-none shadow-sm transition-all" required>
                      <option value="">-- Select Freight Category --</option>
                      <option value="Dry Grocery / Export">Dry Grocery / Export</option>
                      <option value="Cold-Chain Perishables">Cold-Chain Perishables</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Dairy & Ambient">Dairy & Ambient</option>
                      <option value="Chemicals / Hazmat">Chemicals / Hazmat</option>
                      <option value="Agricultural Spices">Agricultural Spices</option>
                      <option value="Fresh Produce">Fresh Produce</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={2.5}/></div>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-2 font-medium leading-relaxed pr-6">Directs stowage compatibility rules and dangerous goods isolation protocols.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-900 mb-2">Unit of Measure (UoM) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={uom} onChange={(e) => setUom(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 outline-none appearance-none shadow-sm transition-all" required>
                      <option value="">-- Select Packaging Unit --</option>
                      <option value="Cartons / Cases (CTN)">Cartons / Cases (CTN)</option>
                      <option value="Sacks / Bags">Sacks / Bags</option>
                      <option value="Master Box">Master Box</option>
                      <option value="Pallet (EURO)">Pallet (EURO)</option>
                      <option value="Drum (200L)">Drum (200L)</option>
                      <option value="Crate (15kg)">Crate (15kg)</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={2.5}/></div>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-2 font-medium leading-relaxed pr-6">Standard freight manifest packaging quantifier and stacking calculation unit.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-900 mb-2">Initial Inventory Quantity <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="1" value={inventoryQuantity} onChange={(e) => setInventoryQuantity(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none focus:border-[#0fa979] shadow-sm transition-all" required />
                  <p className="text-[9px] text-gray-500 mt-2 font-medium">Enter current stock in the selected unit of measure. Store users use this figure when confirming goods preparation.</p>
                </div>

              </div>

              <div className="mt-10 bg-[#f0f9f4] p-4 rounded-xl border border-[#0fa979]/20 flex items-start gap-3">
                 <div className="bg-[#0d9468]/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                   <CheckCircle2 size={14} className="text-[#0d9468]"/>
                 </div>
                 <div className="text-[11px] text-[#113b2e] leading-relaxed">
                   <span className="font-bold">Master Data Protocol:</span> SKU will be registered in active master catalog for quantity-based booking and vehicle capacity calculations.
                 </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-10">
                <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5"><span className="text-[#0fa979]">●</span> Item code is generated automatically; fill required (*) fields and save</div>
                <div className="flex gap-4">
                  <button type="button" onClick={closeView} className="px-6 py-2.5 bg-white text-gray-700 font-bold text-[11px] hover:text-gray-900 cursor-pointer border border-gray-200 rounded-lg">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 bg-[#113b2e] text-white rounded-lg font-bold text-[11px] hover:bg-[#0fa979] flex items-center gap-2 shadow-sm cursor-pointer transition-colors">
                    <FileArchive size={14} /> Save Item
                  </button>
                </div>
              </div>
            </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. EDIT ITEM DETAILS VIEW
  // ----------------------------------------------------
  if (currentView === 'edit' && editingItem) {
    return (
      <div className="bg-[#f8faf9] min-h-full font-sans text-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>MASTER DATA</span> <span className="text-gray-300">&gt;</span> <span>ITEMS</span> <span className="text-gray-300">&gt;</span> <span className="text-[#0fa979]">EDIT ITEM ({editingItem.id})</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-[#113b2e] tracking-tight leading-none">Edit Item Details <span className="text-gray-800">({editingItem.id})</span></h1>
            <span className="bg-[#d1f4e0] text-[#0d9468] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-[#0fa979]"></span> Synchronized & Active
            </span>
          </div>
          <button onClick={closeView} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
            <ArrowLeft size={14} strokeWidth={2.5}/> Back to Item List
          </button>
        </div>
        <div className="mb-6 -mt-4">
           <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">{editingItem.id}</span>
           <p className="text-[11px] text-gray-500 mt-3 font-medium">Global transit parameters, container loading specs, and telematics audit flags.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded border border-gray-200"><Box size={14} className="text-gray-600"/></div>
                  SKU Core Master Data
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">REV-2026.10</span>
              </div>
              
              <form id="editItemForm" onSubmit={handleUpdateItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  
                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                      <span>Unique SKU Identifier</span> 
                    </label>
                    <div className="relative">
                      <input type="text" disabled value={sku} className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 outline-none" />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400"><Shield size={14} /></div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 font-medium">System primary key locked to customs registry.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                      <span>Unit of Measure (UoM)</span> 
                    </label>
                    <div className="relative">
                      <select value={uom} onChange={(e) => setUom(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none appearance-none focus:border-[#0fa979] shadow-sm">
                        <option value="Cartons / Cases (CTN)">Cartons / Cases (CTN)</option>
                        <option value="Sacks / Bags">Sacks / Bags</option>
                        <option value="Master Box">Master Box</option>
                        <option value="Pallet (EURO)">Pallet (EURO)</option>
                        <option value="Drum (200L)">Drum (200L)</option>
                        <option value="Crate (15kg)">Crate (15kg)</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 font-medium">ISO Standard 8601 packaging protocol.</p>
                  </div>

                  <div className="col-span-2">
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2">
                      <span>Commodity Item Description</span> 
                    </label>
                    <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 outline-none" required/>
                    <p className="text-[9px] text-gray-400 mt-2 font-medium">Registered commercial trade name declared for export bills.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Freight Category</span></label>
                    <div className="relative">
                      <select value={freightCat} onChange={(e) => setFreightCat(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none appearance-none focus:border-[#0fa979] shadow-sm">
                        <option value="Dry Grocery / Export">Dry Grocery / Export</option>
                        <option value="Cold-Chain Perishables">Cold-Chain Perishables</option>
                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                        <option value="Dairy & Ambient">Dairy & Ambient</option>
                        <option value="Chemicals / Hazmat">Chemicals / Hazmat</option>
                        <option value="Agricultural Spices">Agricultural Spices</option>
                        <option value="Fresh Produce">Fresh Produce</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Gross Carton Weight</span></label>
                    <div className="relative">
                      <input type="number" step="0.01" min="0" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none focus:border-[#0fa979] shadow-sm"/>
                      <div className="absolute inset-y-0 right-1 flex items-center">
                         <span className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-1 rounded">KG</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Available Inventory Quantity</span></label>
                    <input type="number" min="0" step="1" value={inventoryQuantity} onChange={(e) => setInventoryQuantity(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none focus:border-[#0fa979] shadow-sm" required />
                    <p className="text-[9px] text-gray-400 mt-2 font-medium">Units currently available for store booking preparation.</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-[11px] font-bold text-gray-900 mb-2"><span>Catalog Status</span></label>
                    <div className="relative">
                      <select value={itemStatus} onChange={(e) => setItemStatus(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 outline-none appearance-none focus:border-[#0fa979] shadow-sm">
                        <option value="Active">Active</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Restricted">Restricted</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} /></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fcfdfc] p-4 rounded-xl border border-gray-100 text-[10px] text-gray-500 flex flex-wrap gap-x-8 gap-y-2 mt-2">
                   <div className="flex items-center gap-1.5"><Shield size={12} className="text-[#0fa979]"/> <span className="font-bold text-gray-700">HS Code: 0906.11.10</span> (Pure Alba Ceylon)</div>
                   <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-gray-400"/> <span className="font-bold text-gray-700">Net Content: 12.00 kg</span> (0.50 kg Tare)</div>
                   <div className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> <span className="text-gray-500">Origin: <span className="font-bold text-gray-700">Matara District, Sri Lanka</span></span></div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                 <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2">
                  <div className="p-1 bg-gray-50 rounded border border-gray-200"><Layers size={14} className="text-gray-600"/></div>
                  Handling Constraints & Directives
                 </h3>
                 <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">4 Active Protocols</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#113b2e] mb-1">
                         <Layers size={14} className="text-[#0fa979]"/> Stackable Cargo
                      </div>
                      <p className="text-[10px] text-gray-500 pr-12 leading-relaxed">Max 3 tiers high under 1,500 kg compression rating. Staging permits certified interlocked column formation.</p>
                   </div>
                   <div onClick={() => setStackable(!stackable)} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${stackable ? 'bg-[#113b2e]' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${stackable ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                </div>

                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 mb-1">
                         <Thermometer size={14} className="text-gray-400"/> Temperature Monitored
                      </div>
                      <p className="text-[10px] text-gray-500 pr-12 leading-relaxed">Standard ambient temperature logging active. Requires shaded, dry warehousing at 20°C–28°C envelope.</p>
                   </div>
                   <div onClick={() => setTempMonitor(!tempMonitor)} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${tempMonitor ? 'bg-[#113b2e]' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${tempMonitor ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                </div>

                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#113b2e] mb-1">
                         <Droplets size={14} className="text-[#0fa979]"/> Moisture Sensitive
                      </div>
                      <p className="text-[10px] text-gray-500 pr-12 leading-relaxed">Double poly-foil moisture barrier seal mandatory for export Alba grade quills (&lt;12% relative humidity threshold).</p>
                   </div>
                   <div onClick={() => setMoisture(!moisture)} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${moisture ? 'bg-[#113b2e]' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${moisture ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                </div>

                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 mb-1">
                         <AlertTriangle size={14} className="text-gray-400"/> Fragile Goods
                      </div>
                      <p className="text-[10px] text-gray-500 pr-12 leading-relaxed">Reinforced multiwall export cartons; standard shock tolerance without supplemental air pillows.</p>
                   </div>
                   <div onClick={() => setFragile(!fragile)} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${fragile ? 'bg-[#113b2e]' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${fragile ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[13px] font-bold text-[#113b2e] flex items-center gap-2"><Camera size={14} className="text-gray-400"/> Asset Visual & Staging</h3>
                 <span className="text-[9px] text-[#0fa979] font-bold uppercase tracking-widest leading-tight">LIVE FEED BAY 04</span>
               </div>

               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
               />
               
               <div className="w-full h-40 bg-gray-100 rounded-lg relative overflow-hidden mb-4 group border border-gray-200">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${itemImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'})` }}></div>
                  
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                     <div className="bg-white/95 px-2.5 py-1.5 rounded-lg shadow-sm text-[9px] font-bold flex items-center gap-1.5 backdrop-blur-sm text-[#113b2e]">
                        <span className="text-[#0fa979] text-xs">●</span> Staged At Colombo Main<br/>Store
                     </div>
                     <div className="bg-black/60 text-white px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm text-right">
                       CAM-BAY-<br/>04D
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                     <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">CONFIGURATION</div>
                     <div className="text-[11px] font-bold text-[#113b2e] leading-tight">40 ctns /<br/>Pallet</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                     <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">BASE STANDARD</div>
                     <div className="text-[11px] font-bold text-gray-700 leading-tight">EURO Pallet<br/>Spec</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                     <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL GROSS</div>
                     <div className="text-[11px] font-bold text-gray-900 mt-1">{(Number(grossWeight || 0) * 40 || 622.0).toFixed(1)} kg</div>
                  </div>
               </div>
               
               <button type="button" onClick={triggerImageUpload} className="w-full py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                 <RotateCcw size={12}/> Replace Image Asset
               </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-[#113b2e] flex items-center gap-2"><CheckCircle2 size={16} className="text-gray-400"/> Regulatory<br/>Compliance</h3>
                  <div className="flex flex-col items-center">
                     <Shield size={14} className="text-[#0fa979] mb-0.5"/>
                     <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center">Customs<br/>Linked</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">Sri Lanka Export Development<br/>Board (EDB)</div>
                        <div className="text-[9px] text-gray-500 mb-1">Licence Ref: EDB/AGR/CIN-<br/>8834/2026</div>
                        <div className="text-[8px] text-gray-400 leading-tight">Exporter of Record verified under<br/>Priority Gate</div>
                      </div>
                      <div className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-[#0d9468]/20"><CheckCircle2 size={10}/> Cleared</div>
                   </div>
                   
                   <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">SLSI Packaging Standard</div>
                        <div className="text-[9px] text-gray-500 mb-1">Certificate: SLS 81:2010<br/>Certification</div>
                        <div className="text-[8px] text-gray-400 leading-tight">Sri Lanka Standards Institution high-<br/>grade seal</div>
                      </div>
                      <div className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-[#0d9468]/20"><CheckCircle2 size={10}/> Grade A+</div>
                   </div>

                   <div className="flex justify-between items-start pb-2">
                      <div>
                        <div className="text-[11px] font-bold text-gray-900 mb-0.5">National Plant Quarantine (Sri<br/>Lanka)</div>
                        <div className="text-[9px] text-gray-500 mb-1">Phytosanitary Clearance: NPQS-<br/>CMB-9942</div>
                        <div className="text-[8px] text-gray-400 leading-tight">Ministry of Agriculture pre-<br/>shipment fumigation</div>
                      </div>
                      <div className="bg-[#d1f4e0] text-[#0d9468] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-[#0d9468]/20"><CheckCircle2 size={10}/> Approved</div>
                   </div>
                </div>

                <div className="mt-4 bg-[#113b2e] rounded-lg p-3 flex justify-between items-center text-white shadow-sm">
                   <div>
                      <div className="text-[9px] text-[#0fa979] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><Shield size={10}/> SENTINEL LEDGER INTEGRITY</div>
                      <div className="text-[11px] font-bold mb-1">HASH</div>
                      <div className="text-[8px] text-[#8ba29a] font-mono">SHA256: d81a9bc2c40f8bc99af72...</div>
                   </div>
                   <div className="text-[9px] font-bold text-white uppercase tracking-widest border border-[#0fa979]/30 px-2 py-1 rounded bg-[#0fa979]/10">VERIFIED</div>
                </div>
             </div>

          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto mt-6 bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex justify-between items-center">
           <div className="flex items-center gap-6 text-[10px] text-gray-400 font-medium">
             <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#0fa979] rounded-full"></span> Last synchronized: <span className="font-bold text-gray-700">Oct 24, 2026 at<br/>15:10 IST</span></div>
             <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> Synchronized by <span className="font-bold text-gray-700">Nuwan Perera</span> (Fleet & Dispatch<br/>Manager)</div>
           </div>
           
           <div className="flex gap-4 items-center">
              <button type="button" onClick={closeView} className="text-[11px] font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-center leading-tight">Discard &<br/>Cancel</button>
              <button type="submit" form="editItemForm" className="px-6 py-2 bg-[#113b2e] text-white rounded-lg font-bold text-[11px] hover:bg-[#0fa979] flex items-center justify-center gap-2 shadow-sm text-center leading-tight transition-colors">
                <FileArchive size={14} /> Save<br/>Changes
              </button>
           </div>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // 3. MAIN LIST VIEW
  // ----------------------------------------------------
  return (
    <div className="bg-[#f8faf9] min-h-full font-sans text-gray-800">
      
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-[#173F35]">Item Management</h1>
            <div className="flex gap-2">
               <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">Total SKUs: {items.length}</span>
               <span className="bg-[#d1f4e0] text-[#0d9468] px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">Active: {activeCount}</span>
               <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-red-100">Low Stock / Alert: {restrictedOrReviewCount}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Browse the inventory catalog and monitor stock availability.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
            <Download size={14} strokeWidth={2.5}/> Export CSV
          </button>
          <button 
            onClick={openAddItem} 
            className="flex items-center gap-2 bg-[#113b2e] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0fa979] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} /> Add New Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#e8f8f2] text-[#0fa979] flex items-center justify-center"><Box size={14}/></div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL CATALOG WEIGHT RATING</div>
          <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-8 flex flex-col gap-1">{totalMetricTonnes} Metric<br/><span className="text-[26px]">Tonnes</span></div>
          
          <div className="flex justify-between items-end border-t border-gray-100 pt-4">
             <div className="text-[10px] font-medium text-gray-500 leading-relaxed pr-4">Active inventory payload in<br/>transit across warehouses</div>
             <div className="text-[11px] font-bold text-[#0fa979] flex items-center gap-1 bg-[#e8f8f2] px-2 py-1 rounded"><Activity size={12}/> Live DB</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative flex flex-col justify-between">
          <div>
              <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center"><Snowflake size={14}/></div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">COLD-CHAIN MONITORED ITEMS</div>
              <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-2 flex items-baseline gap-2">{coldChainCount} SKUs <span className="text-[11px] font-bold text-gray-400 tracking-normal">({coldChainPct}%)</span></div>
          </div>
          <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-6">
             <div className="text-[10px] font-medium text-gray-500 leading-relaxed pr-4">Sub-zero & chilled items<br/>requiring refrigerated<br/>reefers</div>
             <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 border border-gray-200 px-2 py-1 rounded text-right leading-tight">Reefer<br/>Enforced</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative flex flex-col justify-between">
          <div>
              <div className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#0fa979]"><CheckCircle2 size={24} strokeWidth={2}/></div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">COMPLIANCE & SAFETY RATING</div>
              <div className="text-3xl font-extrabold text-[#113b2e] tracking-tight mb-2 flex items-baseline gap-2">{compliancePct}% <span className="text-[11px] font-bold text-[#0fa979] uppercase tracking-widest">Audit Cleared</span></div>
          </div>
          <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-6">
             <div className="text-[10px] font-medium text-gray-500 leading-relaxed pr-4">SLA Standards &<br/>phytosanitary customs<br/>compliance</div>
             <div className="text-[11px] font-bold text-[#0fa979] flex flex-col items-center gap-0.5"><Shield size={16}/> Grade<br/>A</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-t-xl border border-gray-100 shadow-sm border-b-0 mt-2">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-4 top-2.5 text-gray-400" size={14} />
            <input 
              type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search item code, SKU name, barcode, category..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-[13px] font-medium text-gray-600 outline-none focus:ring-1 focus:ring-[#0fa979]/30 transition-all" 
            />
          </div>
          
          <div className="flex gap-3 flex-1 justify-end">
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer min-w-[160px] hover:bg-gray-100 transition-colors">
                <option value="All Categories">All Categories</option>
                <option value="Dry Grocery / Export">Dry Grocery / Export</option>
                <option value="Cold-Chain Perishables">Cold-Chain Perishables</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Dairy & Ambient">Dairy & Ambient</option>
                <option value="Agricultural Spices">Agricultural Spices</option>
                <option value="Chemicals / Hazmat">Chemicals / Hazmat</option>
                <option value="Fresh Produce">Fresh Produce</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>

            <div className="relative">
              <select value={uomFilter} onChange={(e) => { setUomFilter(e.target.value); setCurrentPage(1); }} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer min-w-[140px] hover:bg-gray-100 transition-colors">
                <option value="All UoMs">All UoMs</option>
                <option value="Sacks">Sacks</option>
                <option value="Carton">Cartons</option>
                <option value="Box">Boxes</option>
                <option value="Pallet">Pallets</option>
                <option value="Drum">Drums</option>
                <option value="Crate">Crates</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>

            <div className="relative">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="appearance-none bg-gray-50 border border-transparent rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer min-w-[140px] hover:bg-gray-100 transition-colors">
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Restricted">Restricted</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><ChevronDown size={14} strokeWidth={3}/></div>
            </div>

            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 ml-2 hover:text-gray-800 transition-colors cursor-pointer">
               <RotateCcw size={14}/> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfdfc] border-y border-gray-100">
            <tr>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[100px] text-center leading-tight">ITEM<br/>CODE</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ITEM NAME & DESCRIPTION</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">CATEGORY</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">UNIT OF<br/>MEASURE</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">INVENTORY<br/>QUANTITY</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">WEIGHT<br/>/<br/>DENSITY</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-[120px]">STATUS</th>
              <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-[100px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="8" className="py-10 text-center text-gray-500 text-[13px] font-medium">Loading items from database...</td></tr>
            ) : paginatedItems.length === 0 ? (
              <tr><td colSpan="8" className="py-10 text-center text-gray-500 text-[13px] font-medium">No items found matching your filters.</td></tr>
            ) : (
              paginatedItems.map((i) => (
                <tr key={i._id || i.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-center">
                    <span className="font-bold text-gray-700 bg-gray-100/80 px-2.5 py-1.5 rounded-lg text-[11px] tracking-widest flex flex-col items-center leading-tight">
                       {i.id.includes('-') ? (
                         <>
                           <span>{i.id.split('-')[0]}-</span>
                           <span className="text-gray-900">{i.id.split('-')[1]}</span>
                         </>
                       ) : (
                         <span className="text-gray-900">{i.id}</span>
                       )}
                    </span>
                  </td>
                  <td className="py-5 px-6 max-w-[300px]">
                    <div className="font-bold text-[#113b2e] text-[13px] mb-1 leading-snug pr-4">{i.name}</div>
                    <div className="text-gray-500 text-[9px] font-medium leading-relaxed pr-8">{i.description}</div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold border ${i.categoryColor} whitespace-nowrap`}>
                       {i.category.includes('Cold') ? <Snowflake size={12}/> : i.category.includes('Grocery') ? <RotateCcw size={12} className="rotate-45"/> : i.category.includes('Pharma') ? <Shield size={12}/> : i.category.includes('Chem') ? <AlertTriangle size={12}/> : i.category.includes('Spices') ? <Leaf size={12}/> : <CheckCircle2 size={12}/>} 
                       {i.category}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                     <div className="bg-gray-50 border border-gray-200 text-gray-600 font-bold text-[10px] px-2 py-1.5 rounded-lg leading-tight inline-block text-center">
                        {i.uom.includes('(') ? (
                            <>
                               <div>{i.uom.split('(')[0].trim()}</div>
                               <div className="text-[9px] text-gray-400">({i.uom.split('(')[1]}</div>
                            </>
                        ) : i.uom}
                     </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="font-bold text-[#113b2e] text-[12px]">{Number(i.inventoryQuantity || 0).toLocaleString()}</div>
                    <div className="mt-1 max-w-28 truncate text-[9px] text-gray-400" title={i.uom}>{i.uom}</div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="font-bold text-gray-900 text-[11px]">{i.weight}</div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1.5 ${i.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${i.statusColor.includes('red') ? 'bg-red-500' : i.statusColor.includes('gray') ? 'bg-gray-400' : 'bg-[#0fa979]'}`}></span> {i.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex justify-center gap-4 text-gray-400">
                      <button type="button" onClick={() => openEditItem(i)} className="hover:text-[#113b2e] transition-colors p-1 cursor-pointer"><Edit2 size={14} strokeWidth={2.5}/></button>
                      <button type="button" onClick={() => handleDelete(i)} className="hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 size={14} strokeWidth={2.5}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 bg-[#fcfdfc]">
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
             <span>
               Showing {filteredItems.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1} - {Math.min(safePage * rowsPerPage, filteredItems.length)} of {filteredItems.length} items
             </span>
             <div className="flex items-center gap-1.5 ml-2">
                PER PAGE: 
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-white border border-gray-200 rounded px-2 py-1 outline-none font-bold text-gray-700 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
             <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 cursor-pointer disabled:opacity-40">&lt;</button>
             {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
               <button
                 key={pageNum}
                 type="button"
                 onClick={() => setCurrentPage(pageNum)}
                 className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer ${safePage === pageNum ? 'bg-[#113b2e] text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}
               >
                 {pageNum}
               </button>
             ))}
             <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer disabled:opacity-40">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
