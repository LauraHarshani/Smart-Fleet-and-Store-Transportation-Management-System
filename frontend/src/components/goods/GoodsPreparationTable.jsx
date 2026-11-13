import { Package } from "lucide-react";

const GoodsPreparationTable = ({ items }) => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Package size={21} className="text-[#078A68]" />
        <h3 className="text-base font-semibold text-gray-900">
          Goods Preparation
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-sm">
          <thead>
            <tr className="h-12 bg-[#F0F4F1] text-gray-700">
              <th className="w-[10%] px-4 text-center font-medium">#</th>
              <th className="w-[30%] px-4 text-left font-medium">Item</th>
              <th className="w-[20%] px-4 text-center font-medium">
                Inventory
              </th>
              <th className="w-[20%] px-4 text-center font-medium">
                Request Qty
              </th>
              <th className="w-[20%] px-4 text-center font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const isReady = item.inventory >= item.requested;

              return (
                <tr
                  key={item.id || index}
                  className="h-[50px] border-b border-gray-200 text-gray-900"
                >
                  <td className="px-4 text-center font-medium">
                    {index + 1}
                  </td>

                  <td className="px-4 font-medium">
                    {item.name}
                  </td>

                  <td className="px-4 text-center">
                    {item.inventory}
                  </td>

                  <td className="px-4 text-center">
                    {item.requested}
                  </td>

                  <td className="px-4 text-center">
                    <span
                      className={`inline-flex min-w-[94px] justify-center rounded-full px-3 py-1 text-xs font-medium ${
                        isReady
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isReady ? "Ready" : "Not Ready"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* {items.some((item) => item.inventory < item.requested) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">
          Some items do not have sufficient inventory. Please review the
          quantities before confirming preparation.
        </p>
      )} */}
    </div>
  );
};

export default GoodsPreparationTable;
