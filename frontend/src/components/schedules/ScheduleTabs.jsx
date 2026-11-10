import { Truck, Store } from "lucide-react";

const ScheduleTabs = ({ activeTab, onChange }) => {
  const tabs = [
    {
      id: "vehicles",
      label: "Vehicle Schedule",
      icon: Truck,
    },
    {
      id: "stores",
      label: "Store Slots",
      icon: Store,
    },
  ];

  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-[#27866A] bg-white">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex h-10 items-center gap-2 px-4 text-sm font-medium transition ${
              active
                ? "bg-[#078B66] text-white"
                : "bg-[#E8F2EC] text-[#078B66] hover:bg-[#DCEBDD]"
            }`}
          >
            <Icon size={19} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ScheduleTabs;
