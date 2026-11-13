import { Package } from "lucide-react";

const GoodsHandoverTable = ({ items, onQuantityChange }) => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Package size={21} className="text-[#078A68]" />
        <h3 className="text-base font-semibold text-gray-900">
          Goods Handover
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-sm">
          <thead>
            <tr className="h-12 bg-[#F0F4F1] text-gray-700">
              <th className="w-[10%] px-4 text-center font-medium">#</th>
              <th className="w-[30%] px-4 text-left font-medium">Item</th>
              <th className="w-[20%] px-4 text-center font-medium">
                Request Qty
              </th>
              <th className="w-[20%] px-4 text-center font-medium">
                Actual Qty
              </th>
              <th className="w-[20%] px-4 text-center font-medium">
                Difference
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const difference = item.actual - item.requested;

              return (
                <tr
                  key={item.id || index}
                  className="h-[58px] border-b border-gray-200 text-gray-900"
                >
                  <td className="px-4 text-center font-medium">
                    {index + 1}
                  </td>

                  <td className="px-4 font-medium">
                    {item.name}
                  </td>

                  <td className="px-4 text-center">
                    {item.requested}
                  </td>

                  <td className="px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      value={item.actual}
                      onChange={(e) =>
                        onQuantityChange(
                          index,
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="h-9 w-24 rounded-lg border border-gray-300 bg-white px-2 text-center outline-none focus:border-[#078A68] focus:ring-2 focus:ring-[#078A68]/15"
                    />
                  </td>

                  <td className="px-4 text-center">
                    <span
                      className={`font-semibold ${
                        difference === 0
                          ? "text-green-700"
                          : difference < 0
                          ? "text-red-600"
                          : "text-blue-700"
                      }`}
                    >
                      {difference > 0 ? `+${difference}` : difference}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoodsHandoverTable;
