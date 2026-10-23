import React, { useMemo } from 'react';
import { TallyRow } from '../types/tally';
import { Plus, Trash2 } from 'lucide-react';

interface TallyTableProps {
  rows: TallyRow[];
  onUpdateRow: (index: number, updated: Partial<TallyRow>) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  isReadOnly?: boolean;
  selectedRowIndex?: number | null;
  onSelectRow?: (index: number) => void;
}

export const TallyTable: React.FC<TallyTableProps> = ({
  rows,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  isReadOnly = false,
  selectedRowIndex,
  onSelectRow,
}) => {
  // Compute row totals and cumulative sums across 3 holds
  const computedData = useMemo(() => {
    let runningTotal = 0;
    let hold1Total = 0;
    let hold2Total = 0;
    let hold3Total = 0;

    const rowCalculations = rows.map((row) => {
      const h1 = Number(row.hold1) || 0;
      const h2 = Number(row.hold2) || 0;
      const h3 = Number(row.hold3) || 0;

      const rowSum = h1 + h2 + h3;
      const hasData = Boolean(
        row.truckNo?.trim() ||
        row.voucher?.trim() ||
        row.platform?.trim() ||
        row.hour?.trim() ||
        h1 > 0 ||
        h2 > 0 ||
        h3 > 0
      );

      if (rowSum > 0) {
        runningTotal += rowSum;
      }

      hold1Total += h1;
      hold2Total += h2;
      hold3Total += h3;

      return {
        rowSum,
        cumulative: rowSum > 0 || hasData ? runningTotal : null,
        hasData,
      };
    });

    return {
      rowCalculations,
      hold1Total,
      hold2Total,
      hold3Total,
      grandTotal: runningTotal,
    };
  }, [rows]);

  const handleCellChange = (
    index: number,
    field: keyof TallyRow,
    value: string
  ) => {
    if (['hold1', 'hold2', 'hold3'].includes(field)) {
      const numValue = value === '' ? null : Math.max(0, parseInt(value, 10) || 0);
      onUpdateRow(index, { [field]: numValue });
    } else {
      onUpdateRow(index, { [field]: value });
    }
  };

  return (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse border-2 border-black text-xs font-sans table-fixed min-w-[850px] print:min-w-0">
        <colgroup>
          {/* N° */}
          <col className="w-[36px] print:w-[30px]" />
          {/* ARRIVE Date */}
          <col className="w-[82px] print:w-[72px]" />
          {/* ARRIVE Hour */}
          <col className="w-[66px] print:w-[54px]" />
          {/* N° CAMION */}
          <col className="w-[140px] print:w-[125px]" />
          {/* N° PLATFORM */}
          <col className="w-[90px] print:w-[78px]" />
          {/* N° BON */}
          <col className="w-[100px] print:w-[86px]" />
          {/* HOLD 1 */}
          <col className="w-[84px] print:w-[72px]" />
          {/* HOLD 2 */}
          <col className="w-[84px] print:w-[72px]" />
          {/* HOLD 3 */}
          <col className="w-[84px] print:w-[72px]" />
          {/* CUMUL SACS TOTAL BAGS */}
          <col className="w-[105px] print:w-[92px]" />
          {/* Action column (hidden on print) */}
          {!isReadOnly && <col className="w-[38px] no-print" />}
        </colgroup>

        <thead>
          {/* HEADER ROW 1 */}
          <tr className="bg-[#f5b300] print:bg-[#f5b300] text-black font-extrabold text-center uppercase tracking-tight leading-tight border-b border-black">
            {/* N° */}
            <th
              rowSpan={2}
              className="border-r border-b-2 border-black p-1 text-[11px] align-middle"
            >
              N°
            </th>

            {/* ARRIVE au PORT */}
            <th
              colSpan={2}
              className="border-r border-b border-black py-1 px-1 text-[11px] align-middle"
            >
              ARRIVE au PORT
              <div className="text-[9.5px] font-bold normal-case text-slate-900 tracking-normal">
                (ARRIVE AT THE PORT)
              </div>
            </th>

            {/* N° CAMION (TRUCK) */}
            <th
              rowSpan={2}
              className="border-r border-b-2 border-black py-1 px-1 text-[11px] align-middle"
            >
              N° CAMION
              <div className="text-[9.5px] font-bold normal-case text-slate-900 tracking-normal">
                (TRUCK)
              </div>
            </th>

            {/* N° PLATFORM */}
            <th
              rowSpan={2}
              className="border-r border-b-2 border-black py-1 px-1 text-[11px] align-middle"
            >
              N° PLATFORM
            </th>

            {/* N° BON (VOUCHER) */}
            <th
              rowSpan={2}
              className="border-r border-b-2 border-black py-1 px-1 text-[11px] align-middle"
            >
              N° BON
              <div className="text-[9.5px] font-bold normal-case text-slate-900 tracking-normal">
                (VOUCHER)
              </div>
            </th>

            {/* CALLES DESTINES POUR SAC (HOLDS DESTINATE FOR BAGS) - Now 3 holds */}
            <th
              colSpan={3}
              className="border-r border-b border-black py-1 px-1 text-[11px] align-middle"
            >
              CALLES DESTINES POUR SAC
              <div className="text-[9.5px] font-bold normal-case text-slate-900 tracking-normal">
                (HOLDS DESTINATE FOR BAGS)
              </div>
            </th>

            {/* CUMUL SACS TOTAL BAGS */}
            <th
              rowSpan={2}
              className="border-r border-b-2 border-black py-1 px-1 text-[11px] align-middle"
            >
              CUMUL SACS
              <div className="text-[10px] font-black uppercase text-black">
                TOTAL BAGS
              </div>
            </th>

            {/* Non-print action header */}
            {!isReadOnly && (
              <th
                rowSpan={2}
                className="no-print p-0.5 border-b-2 border-black text-center align-middle"
                title="Actions"
              >
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>

          {/* HEADER ROW 2 (SUB-COLUMNS) */}
          <tr className="bg-[#f5b300] print:bg-[#f5b300] text-black font-extrabold text-center uppercase tracking-tight text-[10px] border-b-2 border-black">
            {/* Under ARRIVE au PORT */}
            <th className="border-r border-b-2 border-black py-1 px-0.5">Date</th>
            <th className="border-r border-b-2 border-black py-1 px-0.5">Hour</th>

            {/* Under CALLES DESTINES (Holds 1, 2, 3) */}
            <th className="border-r border-b-2 border-black py-1 px-0.5">HOLD N° 1</th>
            <th className="border-r border-b-2 border-black py-1 px-0.5">HOLD N° 2</th>
            <th className="border-r border-b-2 border-black py-1 px-0.5">HOLD N° 3</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const rowNumber = index + 1;
            const calc = computedData.rowCalculations[index];
            const isSelected = selectedRowIndex === index;
            const hasData = calc?.hasData;

            return (
              <tr
                key={row.id || index}
                onClick={() => onSelectRow?.(index)}
                className={`border-b border-black text-black group transition-colors ${
                  isSelected
                    ? 'bg-amber-100/70 ring-1 ring-amber-500'
                    : hasData
                    ? 'bg-white hover:bg-slate-50'
                    : 'bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* N° Column with Agent modification badge */}
                <td className="border-r border-black py-1 text-center font-bold text-[11px] select-none text-slate-900 bg-slate-50/50">
                  <div>{rowNumber}</div>
                  {row.lastModifiedBy && (
                    <div
                      className="no-print text-[8px] font-sans font-extrabold text-blue-900 bg-blue-100 px-0.5 py-0.2 rounded mt-0.5 truncate max-w-[34px] mx-auto border border-blue-200"
                      title={`Ligne modifiée par : ${row.lastModifiedBy} ${row.lastModifiedAt ? `à ${row.lastModifiedAt}` : ''}`}
                    >
                      {row.lastModifiedBy.split(' ').pop()}
                    </div>
                  )}
                </td>

                {/* Date */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers">
                      {row.date}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.date}
                      onChange={(e) =>
                        handleCellChange(index, 'date', e.target.value)
                      }
                      placeholder="JJ/MM/AAAA"
                      className="w-full h-full py-1 px-1 text-center font-mono-numbers bg-transparent focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500 text-[11.5px]"
                    />
                  )}
                </td>

                {/* Hour */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers">
                      {row.hour}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.hour}
                      onChange={(e) =>
                        handleCellChange(index, 'hour', e.target.value)
                      }
                      placeholder="HH:MM"
                      className="w-full h-full py-1 px-1 text-center font-mono-numbers bg-transparent focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500 text-[11.5px]"
                    />
                  )}
                </td>

                {/* N° CAMION (TRUCK) - EXACT MATRICULES FROM THE PHOTO */}
                <td className="border-r border-black p-0 bg-amber-50/20">
                  {isReadOnly ? (
                    <div className="py-1 px-1.5 text-center font-mono-numbers font-extrabold text-[12px] text-slate-900">
                      {row.truckNo}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.truckNo}
                      onChange={(e) =>
                        handleCellChange(index, 'truckNo', e.target.value)
                      }
                      placeholder="Ex: 61516 A 55"
                      className="w-full h-full py-1 px-1.5 text-center uppercase font-mono-numbers font-black text-[12px] text-slate-950 bg-transparent focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 tracking-wide"
                    />
                  )}
                </td>

                {/* N° PLATFORM */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers">
                      {row.platform}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.platform}
                      onChange={(e) =>
                        handleCellChange(index, 'platform', e.target.value)
                      }
                      placeholder="P-01"
                      className="w-full h-full py-1 px-1 text-center uppercase font-mono-numbers bg-transparent focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500 text-[11.5px]"
                    />
                  )}
                </td>

                {/* N° BON (VOUCHER) */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers">
                      {row.voucher}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.voucher}
                      onChange={(e) =>
                        handleCellChange(index, 'voucher', e.target.value)
                      }
                      placeholder="BON-..."
                      className="w-full h-full py-1 px-1 text-center uppercase font-mono-numbers bg-transparent focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500 text-[11.5px]"
                    />
                  )}
                </td>

                {/* HOLD N° 1 */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers font-bold text-blue-900">
                      {row.hold1 ?? ''}
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={row.hold1 ?? ''}
                      onChange={(e) =>
                        handleCellChange(index, 'hold1', e.target.value)
                      }
                      className="w-full h-full py-1 px-1 text-center font-mono-numbers font-bold text-blue-950 bg-transparent focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]"
                    />
                  )}
                </td>

                {/* HOLD N° 2 */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers font-bold text-emerald-900">
                      {row.hold2 ?? ''}
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={row.hold2 ?? ''}
                      onChange={(e) =>
                        handleCellChange(index, 'hold2', e.target.value)
                      }
                      className="w-full h-full py-1 px-1 text-center font-mono-numbers font-bold text-emerald-950 bg-transparent focus:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[12px]"
                    />
                  )}
                </td>

                {/* HOLD N° 3 */}
                <td className="border-r border-black p-0">
                  {isReadOnly ? (
                    <div className="py-1 px-1 text-center font-mono-numbers font-bold text-purple-900">
                      {row.hold3 ?? ''}
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={row.hold3 ?? ''}
                      onChange={(e) =>
                        handleCellChange(index, 'hold3', e.target.value)
                      }
                      className="w-full h-full py-1 px-1 text-center font-mono-numbers font-bold text-purple-950 bg-transparent focus:bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-500 text-[12px]"
                    />
                  )}
                </td>

                {/* CUMUL SACS TOTAL BAGS */}
                <td className="border-r border-black py-1 px-1 text-center font-black font-mono-numbers text-[12px] bg-amber-50/40 text-black">
                  {calc?.cumulative !== null && calc?.cumulative !== undefined && calc.cumulative > 0
                    ? calc.cumulative.toLocaleString()
                    : ''}
                </td>

                {/* Row Action (no-print) */}
                {!isReadOnly && (
                  <td className="no-print py-0 px-1 text-center align-middle">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRow(index);
                      }}
                      title={`Effacer la ligne ${rowNumber}`}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>

        {/* FOOTER ROW: EXACT "TOTAL DE LA JOURNEE" GOLDEN ROW WITH 3 HOLDS */}
        <tfoot>
          <tr className="bg-[#f5b300] print:bg-[#f5b300] border-t-2 border-b-2 border-black text-black font-extrabold text-[12px]">
            {/* TOTAL DE LA JOURNEE spanning 6 columns */}
            <td
              colSpan={6}
              className="border-r border-black py-2 px-2 text-center uppercase tracking-wider text-[13px] font-black"
            >
              TOTAL DE LA JOURNEE
            </td>

            {/* Total Hold 1 */}
            <td className="border-r border-black py-2 px-1 text-center font-mono-numbers font-black text-[13px] text-blue-950">
              {computedData.hold1Total > 0
                ? computedData.hold1Total.toLocaleString()
                : '0'}
            </td>

            {/* Total Hold 2 */}
            <td className="border-r border-black py-2 px-1 text-center font-mono-numbers font-black text-[13px] text-emerald-950">
              {computedData.hold2Total > 0
                ? computedData.hold2Total.toLocaleString()
                : '0'}
            </td>

            {/* Total Hold 3 */}
            <td className="border-r border-black py-2 px-1 text-center font-mono-numbers font-black text-[13px] text-purple-950">
              {computedData.hold3Total > 0
                ? computedData.hold3Total.toLocaleString()
                : '0'}
            </td>

            {/* GRAND TOTAL BAGS */}
            <td className="border-r border-black py-2 px-1 text-center font-mono-numbers font-black text-[14px] bg-[#e6a800]">
              {computedData.grandTotal > 0
                ? computedData.grandTotal.toLocaleString()
                : '0'}
            </td>

            {!isReadOnly && <td className="no-print bg-[#f5b300]"></td>}
          </tr>
        </tfoot>
      </table>

      {/* Add Row Button (non-print) */}
      {!isReadOnly && (
        <div className="no-print mt-2 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 hover:text-black bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Ajouter une ligne ({rows.length} lignes actuelles)</span>
          </button>
          <span className="text-[11px] text-slate-500 italic">
            Rotation active des matricules : 61516 A 55 · 65333 A 55 · 56061 A 55 (1 Big Bag = 1,200 T).
          </span>
        </div>
      )}
    </div>
  );
};
