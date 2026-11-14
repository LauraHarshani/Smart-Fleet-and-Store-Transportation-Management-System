export const tripStats = {
  distance: "48.2 km",
  transitTime: "2h 45m",
  stops: "5 Points",
  carbon: "0.0 kg",
};

export const stopsData = [
  { id: 1, type: "ORIGIN", location: "Pelayagoda Central Hub", time: "Oct 06 08:30", items: ["Load 135 Crates", "Bay 04"] },
  { id: 2, type: "DROP", location: "Keells Super - Odell Mall", time: "ETA 07:35", window: "07:00 - 07:45", items: ["45 Crates (Dry / Produce)"] },
  { id: 3, type: "DROP", location: "Cargills Food City", time: "ETA 08:05", window: "07:50 - 08:30", items: ["60 Crates (Dry / Produce)"] },
  { id: 4, type: "PICK & DROP", location: "Elephant House Depot", time: "ETA 08:50", window: "09:00 - 10:00", items: ["30 / 15 Returnable Pallets"] },
  { id: 5, type: "RETURN", location: "Pelayagoda Central Hub", time: "Arr 09:30", items: ["Return Empty Containers"] },
];

export const capacityData = {
  weight: { current: 3280, max: 4000, percentage: 82 },
  volume: { current: 18.5, max: 25.0, percentage: 74 },
  temperature: "2°C Zone 1 Ambient",
  items: [
    { name: "Highland Fresh Milk & Dairy", qty: "45 crates • 1,125 kg" },
    { name: "Maliban Packaged Dry Provisions", qty: "60 crates • 1,440 kg" },
    { name: "Ceylinco Spices Assortment", qty: "30 crates • 715 kg" },
  ]
};

export const historyData = [
  { id: "TRP-1042", date: "12 May", route: "Colombo North • 6 stops", distance: "48.2 km", carbon: "0.0 kg", status: "Completed", dispatch: "08:15 AM" },
  { id: "TRP-1038", date: "11 May", route: "Kelani Valley • 5 stops", distance: "42.8 km", carbon: "0.0 kg", status: "Pending", dispatch: "06:10 AM" },
  { id: "TRP-1031", date: "10 May", route: "Colombo South • 7 stops", distance: "51.4 km", carbon: "0.0 kg", status: "Delayed", dispatch: "06:20 AM" },
];