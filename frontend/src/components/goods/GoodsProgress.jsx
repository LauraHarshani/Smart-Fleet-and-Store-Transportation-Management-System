import { Check } from "lucide-react";

const sendingStages = [
  { id: 1, label: "Goods Prepared" },
  { id: 2, label: "Goods Handed Over" },
  { id: 3, label: "Received" },
];

const receivingStages = [
  { id: 1, label: "Goods Prepared" },
  { id: 2, label: "In Transit" },
  { id: 3, label: "Received" },
];

const GoodsProgress = ({ currentStage, isReceiving = false }) => {
  const stages = isReceiving ? receivingStages : sendingStages;

  return (
    <div className="mx-auto mb-10 flex w-full max-w-[700px] items-start">
      {stages.map((stage, index) => {
        const completed = stage.id < currentStage;
        const active = stage.id === currentStage;

        return (
          <div
            key={stage.id}
            className="relative flex flex-1 flex-col items-center"
          >
            {index !== 0 && (
              <div
                className={`absolute right-1/2 top-[11px] h-[2px] w-full ${
                  completed || active ? "bg-[#078A68]" : "bg-gray-300"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                completed || active
                  ? "border-[#078A68] bg-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {(completed || active) && (
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#078A68]">
                  {completed && (
                    <Check size={10} className="text-white" strokeWidth={3} />
                  )}
                </div>
              )}
            </div>

            <span
              className={`mt-3 whitespace-nowrap text-center text-sm ${
                completed || active
                  ? "font-medium text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GoodsProgress;
