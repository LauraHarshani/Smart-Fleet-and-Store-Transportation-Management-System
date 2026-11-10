
import { useMemo, useState } from 'react';
import {
  Activity, CalendarClock, CarFront, ChevronDown, Clock3,
  Crosshair, Navigation, Package, Route, Search, Signal,
  UserRound, Wifi,
} from 'lucide-react';

// Sample active vehicle data
const vehicles = [
  {
    vehicle: 'VH-020',
    trip: 'TR-160',
    route: 'Colombo → Kandy',
    driver: 'Minindu Rajapaksha',
    eta: '11:00',
    progress: 45,
    status: 'In Progress',
    update: '10 sec ago',
    load: '80 Units',
    start: '08:00',
    accuracy: '± 8 m',
    point: { left: '50%', top: '46%' },
  },
  {
    vehicle: 'VH-021',
    trip: 'TR-161',
    route: 'Galle → Kandy',
    driver: 'Kasun Perera',
    eta: '11:30',
    progress: 60,
    status: 'In Progress',
    update: '15 sec ago',
    load: '62 Units',
    start: '08:30',
    accuracy: '± 12 m',
    point: { left: '60%', top: '34%' },
  },
  {
    vehicle: 'VH-022',
    trip: 'TR-162',
    route: 'Colombo → Galle',
    driver: 'Nimal Fernando',
    eta: '11:30',
    progress: 45,
    status: 'Delayed',
    update: '10 sec ago',
    load: '95 Units',
    start: '08:15',
    accuracy: '± 15 m',
    point: { left: '43%', top: '67%' },
  },
  {
    vehicle: 'VH-023',
    trip: 'TR-163',
    route: 'Colombo → Galle',
    driver: 'Sahan Silva',
    eta: '12:10',
    progress: 90,
    status: 'Delayed',
    update: '12 sec ago',
    load: '70 Units',
    start: '07:45',
    accuracy: '± 10 m',
    point: { left: '67%', top: '58%' },
  },
];

// Different colors for the vehicle routes
const routeStyles = {
  'VH-020': '#0a9b76',
  'VH-021': '#2563eb',
  'VH-022': '#d97706',
  'VH-023': '#9333ea',
};

// Route paths on the illustrative map
const routePaths = {
  'VH-020': 'M645 562C700 496 687 437 751 379s44-115 122-174',
  'VH-021': 'M590 180C650 220 690 260 740 300S830 350 920 380',
  'VH-022': 'M645 562C620 500 580 460 550 400S530 300 570 230',
  'VH-023': 'M645 562C720 590 780 560 830 500S900 430 960 400',
};

const statusStyle = {
  'In Progress': 'bg-emerald-100 text-emerald-800',
  Delayed: 'bg-rose-100 text-rose-700',
};

// Map component
function TrackingMap({ selected, onSelect, showAllRoutes }) {
  // Decide which routes should be visible
  const visibleRoutes = showAllRoutes ? vehicles : [selected];

  return (
    <div className="relative h-[550px] min-h-[450px] w-full overflow-hidden rounded-xl border border-[#168e70] bg-[#eaf0ed] lg:h-[650px] xl:h-[720px]">

      {/* Illustrative Colombo map */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Illustrated map of Colombo"
      >
        <rect width="1000" height="700" fill="#f5f6f5" />

        {/* Sea area */}
        <path
          d="M0 0h525l-12 55 28 45-10 52 34 50-5 50 38 62-22 38 20 50-38 50 14 53-28 43 18 52-28 50H0z"
          fill="#91dce9"
        />

        <path
          d="M512 0l-4 130 46 82-5 64 60 69-28 56 35 65-36 58 34 83-42 83"
          fill="none"
          stroke="#67c8db"
          strokeWidth="7"
        />

        {/* Local roads */}
        <g fill="none" stroke="#d5dde3" strokeWidth="5">
          <path d="M545-20 610 125 568 228 642 320 595 410 650 510 603 730" />
          <path d="M610-20 677 120 636 220 708 302 663 420 722 520 676 730" />
          <path d="M700-20 742 110 708 202 770 280 735 385 800 490 762 730" />
          <path d="M820-20 850 125 812 225 880 310 845 400 905 505 878 730" />
          <path d="M520 130 710 115 850 170 1010 125M530 205 670 190 820 245 1010 220M550 290 700 270 835 330 1010 300M560 380 710 360 850 410 1010 395M570 475 720 450 860 505 1010 480M585 570 720 545 870 590 1010 565M615 655 750 625 900 680 1010 645" />
          <path d="M640 0 625 700M748 0 735 700M910 0 890 700" strokeWidth="3" />
        </g>

        {/* Main roads */}
        <g
          fill="none"
          stroke="#8fa6c9"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M510 210 615 246 700 318 738 400 830 440 1000 430" />
          <path d="M584 600 660 510 708 430 760 355 810 270 790 180 825 90" />
          <path d="M650 680 700 600 770 560 830 500 905 470 1000 490" />
          <path d="M610 75 690 135 760 150 830 130 900 165 1000 160" />
        </g>

        <g
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M510 210 615 246 700 318 738 400 830 440 1000 430" />
          <path d="M584 600 660 510 708 430 760 355 810 270 790 180 825 90" />
          <path d="M650 680 700 600 770 560 830 500 905 470 1000 490" />
          <path d="M610 75 690 135 760 150 830 130 900 165 1000 160" />
        </g>

        {/* Vehicle routes */}
        {visibleRoutes.map((vehicle) => (
          <path
            key={vehicle.vehicle}
            d={routePaths[vehicle.vehicle]}
            fill="none"
            stroke={routeStyles[vehicle.vehicle]}
            strokeWidth={showAllRoutes ? 6 : 7}
            strokeDasharray="13 11"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={showAllRoutes ? 0.9 : 1}
          />
        ))}

        {/* Map labels */}
        <g
          fontFamily="Arial, sans-serif"
          fill="#45515e"
          fontWeight="600"
        >
          <text x="690" y="212" fontSize="25">Wattala</text>
          <text x="812" y="298" fontSize="26">Ragama</text>
          <text x="703" y="414" fontSize="24">Colombo 08</text>
          <text
            x="657"
            y="537"
            fontSize="52"
            fill="#34404d"
            stroke="white"
            strokeWidth="5"
            paintOrder="stroke"
          >
            Colombo
          </text>
          <text x="745" y="598" fontSize="25">
            Sri Jayawardenepura Kotte
          </text>
          <text x="820" y="660" fontSize="22">Nugegoda</text>
        </g>

        {/* Road number labels */}
        <g fontFamily="Arial" fontSize="22" fontWeight="bold">
          <g transform="translate(780 355)">
            <rect width="55" height="34" rx="9" fill="#70a84c" stroke="white" strokeWidth="4" />
            <text x="10" y="24" fill="white">A1</text>
          </g>
          <g transform="translate(860 445)">
            <rect width="72" height="34" rx="9" fill="#70a84c" stroke="white" strokeWidth="4" />
            <text x="8" y="24" fill="white">AB10</text>
          </g>
          <g transform="translate(920 490)">
            <rect width="78" height="34" rx="9" fill="#70a84c" stroke="white" strokeWidth="4" />
            <text x="8" y="24" fill="white">B435</text>
          </g>
        </g>
      </svg>

      {/* Vehicle markers */}
      {vehicles.map((vehicle) => (
        <button
          key={vehicle.vehicle}
          onClick={() => onSelect(vehicle)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white p-1.5 text-white shadow-lg transition-transform hover:scale-110 ${
            selected.vehicle === vehicle.vehicle
              ? 'z-10 bg-[#087e61]'
              : 'bg-[#258c70]'
          }`}
          style={vehicle.point}
          aria-label={`Select ${vehicle.vehicle}`}
          title={vehicle.vehicle}
        >
          <CarFront size={18} />
        </button>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow">
        {showAllRoutes ? (
          vehicles.map((vehicle) => (
            <span key={vehicle.vehicle} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: routeStyles[vehicle.vehicle] }}
              />
              {vehicle.vehicle}
            </span>
          ))
        ) : (
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: routeStyles[selected.vehicle] }}
            />
            {selected.vehicle} Route
          </span>
        )}
      </div>

      {/* Center map button */}
      <button
        onClick={() => onSelect(selected)}
        className="absolute bottom-4 right-4 rounded-lg bg-white p-2 text-slate-600 shadow hover:text-[#078b68]"
        aria-label="Center map"
      >
        <Crosshair size={18} />
      </button>
    </div>
  );
}

// Information cell below the map
function InfoCell({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 px-2 py-3 sm:gap-2.5 sm:px-3 ${className}`}>
      <Icon size={19} className="shrink-0 text-[#168c6b]" />
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-slate-500">{label}</div>
        <div className="whitespace-nowrap text-[13px] font-semibold text-slate-800">
          {value}
        </div>
      </div>
    </div>
  );
}

// Vehicle card in the right panel
function VehicleCard({ vehicle, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3.5 text-left transition hover:border-[#159273] ${
        selected
          ? 'border-[#159273] bg-[#f0fcf6]'
          : 'border-[#dce5de] bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#174b3c]">{vehicle.vehicle}</span>
        <span className="h-5 border-l border-slate-300" />
        <span className="text-[11px] text-slate-600">{vehicle.trip}</span>
        <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle[vehicle.status]}`}>
          {vehicle.status}
        </span>
      </div>

      <div className="mt-2 px-1">
        <div className="text-xs font-medium text-slate-800">{vehicle.route}</div>

        <div className="mt-1 flex justify-between gap-2 text-[11px] text-slate-600">
          <span>
            <span className="text-slate-400">Driver:</span> {vehicle.driver}
          </span>
          <span className="shrink-0">
            <span className="text-slate-400">ETA:</span> {vehicle.eta}
          </span>
        </div>

        <div className="mt-1 flex justify-between text-[11px]">
          <span className="font-medium text-slate-700">Trip progress</span>
          <span>{vehicle.progress}%</span>
        </div>

        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#258c70]"
            style={{ width: `${vehicle.progress}%` }}
          />
        </div>

        <div className="mt-1.5 text-right text-[10px] text-slate-400">
          Last update: <span className="text-slate-700">{vehicle.update}</span>
        </div>
      </div>
    </button>
  );
}

// Main live tracking page
export default function LiveTracking() {
  const [selected, setSelected] = useState(vehicles[0]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All Status');

  // Controls whether all routes or only one route are displayed
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  // Search and filter active vehicles
  const filtered = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesQuery = `${vehicle.vehicle} ${vehicle.trip} ${vehicle.driver}`
          .toLowerCase()
          .includes(query.toLowerCase());

        return (
          matchesQuery &&
          (status === 'All Status' || vehicle.status === status)
        );
      }),
    [query, status]
  );

  return (
    <div className="min-h-full bg-[#f4f7f3] -m-8 p-6 sm:p-8">

      {/* Page heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Live Fleet Monitoring &amp; Tracking
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Monitor vehicle locations, planned routes, and real-time trip progress across all stores.
        </p>
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)]">

        {/* Map section */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          {/* Map heading and route toggle */}
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Live Map
            </h3>

            <button
              onClick={() => setShowAllRoutes((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                showAllRoutes
                  ? 'bg-[#173F35] text-white'
                  : 'border border-[#27866A] bg-white text-[#173F35] hover:bg-[#E8F5EC]'
              }`}
            >
              <Route size={15} />
              {showAllRoutes ? 'Show Selected Route' : 'Show All Routes'}
            </button>
          </div>

          <TrackingMap
            selected={selected}
            onSelect={setSelected}
            showAllRoutes={showAllRoutes}
          />

          {/* Selected vehicle information */}
          <div className="mt-3 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-[minmax(155px,1fr)_minmax(145px,1fr)_minmax(270px,1.8fr)] sm:divide-y-0">

            <div className="grid grid-cols-2 grid-rows-2 sm:row-span-2 sm:border-r sm:border-slate-200">
              <InfoCell icon={CarFront} label="Vehicle" value={selected.vehicle} className="border-b border-slate-100" />
              <InfoCell icon={Route} label="Trip ID" value={selected.trip} className="border-b border-l border-slate-100" />
              <InfoCell icon={UserRound} label="Driver" value={selected.driver} className="col-span-2" />
            </div>

            <InfoCell
              icon={Route}
              label="Trip Route"
              value={selected.route}
              className="sm:border-b sm:border-r sm:border-slate-200"
            />

            <div className="grid grid-cols-3 sm:border-b sm:border-slate-200">
              <InfoCell icon={CalendarClock} label="Trip Start" value={selected.start} />
              <InfoCell icon={Clock3} label="ETA" value={selected.eta} className="border-l border-slate-100" />
              <InfoCell icon={Package} label="Load" value={selected.load} className="border-l border-slate-100" />
            </div>

            <div className="grid grid-cols-2 sm:col-span-2 sm:col-start-2 sm:row-start-2">
              <InfoCell icon={Navigation} label="Last GPS update" value={selected.update} className="sm:border-r sm:border-slate-100" />
              <InfoCell icon={Crosshair} label="Location accuracy" value={selected.accuracy} />
            </div>
          </div>
        </section>

        {/* Active vehicles section */}
        <section className="flex max-h-[850px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Active Vehicles ({filtered.length})
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700">
              <Wifi size={14} /> Live
            </span>
          </div>

          {/* Search and status filter */}
          <div className="mb-4 flex gap-2">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-2.5">
              <Search size={16} className="shrink-0 text-slate-600" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by vehicle or trip ID..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-500"
              />
            </label>

            <label className="relative flex h-9 w-[118px] items-center">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-full w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-xs text-slate-700 outline-none focus:border-[#168c6b]"
              >
                <option>All Status</option>
                <option>In Progress</option>
                <option>Delayed</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-2 text-slate-500" />
            </label>
          </div>

          {/* Vehicle cards */}
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-2">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.vehicle}
                vehicle={vehicle}
                selected={selected.vehicle === vehicle.vehicle}
                onClick={() => setSelected(vehicle)}
              />
            ))}

            {filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                No active vehicles match your search.
              </div>
            )}
          </div>

          {/* GPS connection status */}
          <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Signal size={13} /> GPS connected
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
