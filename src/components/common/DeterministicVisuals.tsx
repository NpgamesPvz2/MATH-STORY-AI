import React from 'react';

export function getUnitDisplayIcon(unit: string = 'quả cam'): string {
  const u = unit.toLowerCase();
  if (u.includes('gà')) return '🐔';
  if (u.includes('trứng')) return '🥚';
  if (u.includes('cây')) return '🌳';
  if (u.includes('hoa')) return '🌸';
  if (u.includes('bi')) return '🔵';
  if (u.includes('táo')) return '🍎';
  if (u.includes('sách') || u.includes('vở')) return '📚';
  if (u.includes('kẹo')) return '🍬';
  if (u.includes('bút')) return '✏️';
  return '🍊';
}

// 1. Phép CỘNG: Mô hình trực quan thêm vào (Nhóm 1 + Nhóm 2 = Tổng)
export const AdditionModelVisual: React.FC<{
  num1: number;
  num2: number;
  result: number;
  unit: string;
}> = ({ num1, num2, result, unit }) => {
  const icon = getUnitDisplayIcon(unit);
  const sample1 = Math.min(num1, 15);
  const sample2 = Math.min(num2, 15);

  return (
    <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow">
            ➕
          </span>
          <h4 className="font-extrabold text-amber-950 text-sm">
            Mô Hình Phép Cộng (Thêm Vào & Tìm Tất Cả)
          </h4>
        </div>
        <span className="font-mono font-black text-amber-950 bg-amber-200 px-3 py-1 rounded-xl text-xs border border-amber-400">
          {num1} + {num2} = {result} ({unit})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
        {/* Group 1 */}
        <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-amber-900 block">
            Ban đầu: <strong className="text-sm font-black">{num1}</strong> {unit}
          </span>
          <div className="flex flex-wrap justify-center gap-1 max-h-24 overflow-hidden p-1">
            {Array.from({ length: sample1 }).map((_, i) => (
              <span key={i} className="text-base" title={`1 ${unit}`}>{icon}</span>
            ))}
          </div>
          {num1 > sample1 && (
            <span className="text-[10px] text-slate-500 block italic">(và các đơn vị tương tự)</span>
          )}
        </div>

        {/* Plus Symbol */}
        <div className="flex flex-col items-center justify-center font-black text-amber-600">
          <span className="text-2xl">➕</span>
          <span className="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold mt-1">
            Thêm vào {num2}
          </span>
        </div>

        {/* Group 2 */}
        <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-amber-900 block">
            Thêm: <strong className="text-sm font-black">{num2}</strong> {unit}
          </span>
          <div className="flex flex-wrap justify-center gap-1 max-h-24 overflow-hidden p-1">
            {Array.from({ length: sample2 }).map((_, i) => (
              <span key={i} className="text-base" title={`1 ${unit}`}>{icon}</span>
            ))}
          </div>
          {num2 > sample2 && (
            <span className="text-[10px] text-slate-500 block italic">(và các đơn vị tương tự)</span>
          )}
        </div>
      </div>

      {/* Result sum bar */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
        <span className="flex items-center gap-1">
          <span>✨</span>
          <span>Có tất cả:</span>
        </span>
        <span className="font-mono text-sm font-black">
          {num1} + {num2} = {result} {unit}
        </span>
      </div>
    </div>
  );
};

// 2. Phép TRỪ: Mô hình trực quan bớt đi / bán đi (Ban đầu - Bớt đi = Còn lại)
export const SubtractionModelVisual: React.FC<{
  num1: number;
  num2: number;
  result: number;
  unit: string;
}> = ({ num1, num2, result, unit }) => {
  const icon = getUnitDisplayIcon(unit);
  const big = Math.max(num1, num2);
  const small = Math.min(num1, num2);
  const diff = big - small;
  const sampleRemaining = Math.min(diff, 12);
  const sampleRemoved = Math.min(small, 10);

  return (
    <div className="bg-rose-50/95 border-2 border-rose-300 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-rose-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow">
            ➖
          </span>
          <h4 className="font-extrabold text-rose-950 text-sm">
            Mô Hình Phép Trừ (Bớt Đi / Đã Bán & Tìm Phần Còn Lại)
          </h4>
        </div>
        <span className="font-mono font-black text-rose-950 bg-rose-200 px-3 py-1 rounded-xl text-xs border border-rose-400">
          {big} - {small} = {diff} ({unit})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
        {/* Total initially */}
        <div className="bg-white p-3 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-rose-900 block">
            Lúc đầu có: <strong className="text-sm font-black">{big}</strong> {unit}
          </span>
          <div className="text-xs text-slate-500 font-medium">Toàn bộ số lượng ban đầu</div>
        </div>

        {/* Removed */}
        <div className="bg-rose-100/70 p-3 rounded-2xl border border-rose-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-rose-900 block">
            Đã bớt / đã bán: <strong className="text-sm font-black text-rose-700">-{small}</strong> {unit}
          </span>
          <div className="flex flex-wrap justify-center gap-1 p-1">
            {Array.from({ length: sampleRemoved }).map((_, i) => (
              <span key={i} className="text-base opacity-40 line-through grayscale" title={`Bớt 1 ${unit}`}>{icon}</span>
            ))}
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-900 block">
            Còn lại: <strong className="text-sm font-black text-emerald-700">{diff}</strong> {unit}
          </span>
          <div className="flex flex-wrap justify-center gap-1 p-1">
            {Array.from({ length: sampleRemaining }).map((_, i) => (
              <span key={i} className="text-base" title={`Còn lại 1 ${unit}`}>{icon}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
        <span>Kết luận phần còn lại:</span>
        <span className="font-mono text-sm font-black">
          {big} - {small} = {diff} {unit}
        </span>
      </div>
    </div>
  );
};

// 3. Phép NHÂN: Mô hình trực quan các hàng / nhóm đều nhau
export const MultiplicationModelVisual: React.FC<{
  num1: number;
  num2: number;
  result: number;
  unit: string;
  groupUnit?: string;
}> = ({ num1, num2, result, unit, groupUnit }) => {
  const icon = getUnitDisplayIcon(unit);
  const groups = Math.min(num1, 6);
  const itemsPerGroup = Math.min(num2, 8);
  const gName = groupUnit || 'hàng';

  return (
    <div className="bg-teal-50/95 border-2 border-teal-300 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-teal-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow">
            ✖️
          </span>
          <h4 className="font-extrabold text-teal-950 text-sm">
            Mô Hình Phép Nhân (Lấy Nhiều Lần Bằng Nhau)
          </h4>
        </div>
        <span className="font-mono font-black text-teal-950 bg-teal-200 px-3 py-1 rounded-xl text-xs border border-teal-400">
          {num1} × {num2} = {result} ({unit})
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-900 block">
          Có {num1} {gName}, mỗi {gName} có {num2} {unit}:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: groups }).map((_, gIdx) => (
            <div key={gIdx} className="bg-white p-2.5 rounded-2xl border border-teal-200 text-center space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full capitalize">
                {gName.includes('cây') ? 'Hàng' : gName} {gIdx + 1} ({num2} {unit})
              </span>
              <div className="flex flex-wrap justify-center gap-1 pt-1">
                {Array.from({ length: itemsPerGroup }).map((_, i) => (
                  <span key={i} className="text-base" title={`1 ${unit}`}>{icon}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-sky-600 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
        <span>Tổng số lượng {unit} tất cả:</span>
        <span className="font-mono text-sm font-black">
          {num1} × {num2} = {result} {unit}
        </span>
      </div>
    </div>
  );
};

// 4. Phép CHIA: Mô hình trực quan chia đều vào các phần bằng nhau
export const DivisionModelVisual: React.FC<{
  num1: number;
  num2: number;
  result: number;
  unit: string;
  groupUnit?: string;
}> = ({ num1, num2, result, unit, groupUnit }) => {
  const icon = getUnitDisplayIcon(unit);
  const parts = Math.min(Math.max(num2, 1), 6);
  const itemsPerPart = Math.min(result, 8);
  const gName = groupUnit || 'phần';

  return (
    <div className="bg-sky-50/95 border-2 border-sky-300 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow">
            ➗
          </span>
          <h4 className="font-extrabold text-sky-950 text-sm">
            Mô Hình Phép Chia (Chia Đều Vào Các Phần Bằng Nhau)
          </h4>
        </div>
        <span className="font-mono font-black text-sky-950 bg-sky-200 px-3 py-1 rounded-xl text-xs border border-sky-400">
          {num1} : {num2} = {result} ({unit})
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-sky-900 block">
          Có tất cả {num1} {unit}, chia đều vào {num2} {gName}:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: parts }).map((_, pIdx) => (
            <div key={pIdx} className="bg-white p-2.5 rounded-2xl border border-sky-200 text-center space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full capitalize">
                {gName.includes('cây') ? 'Hàng' : gName} {pIdx + 1}
              </span>
              <div className="flex flex-wrap justify-center gap-1 pt-1">
                {Array.from({ length: itemsPerPart }).map((_, i) => (
                  <span key={i} className="text-base" title={`1 ${unit}`}>{icon}</span>
                ))}
              </div>
              <span className="text-[10px] font-bold text-sky-700 block">
                {result} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
        <span>Mỗi {gName} có:</span>
        <span className="font-mono text-sm font-black">
          {num1} : {num2} = {result} {unit}
        </span>
      </div>
    </div>
  );
};

// 5. Component Tổng Hợp: Tự động chọn mô hình phù hợp với phép tính
export const OperationModelSelector: React.FC<{
  operation: string;
  num1: number;
  num2: number;
  result: number;
  unit: string;
  groupUnit?: string;
}> = ({ operation, num1, num2, result, unit, groupUnit }) => {
  const opUpper = (operation || '').toUpperCase();

  if (opUpper.includes('TRỪ') || opUpper === '-') {
    return <SubtractionModelVisual num1={num1} num2={num2} result={result} unit={unit} />;
  }
  if (opUpper.includes('NHÂN') || opUpper === '×' || opUpper === '*') {
    return <MultiplicationModelVisual num1={num1} num2={num2} result={result} unit={unit} groupUnit={groupUnit} />;
  }
  if (opUpper.includes('CHIA') || opUpper === ':') {
    return <DivisionModelVisual num1={num1} num2={num2} result={result} unit={unit} groupUnit={groupUnit} />;
  }
  return <AdditionModelVisual num1={num1} num2={num2} result={result} unit={unit} />;
};

// Exact Item Counter with Groups of 10 and Single Units (Classic Orange Counter)
export const OrangeCounterVisual: React.FC<{
  count: number;
  label?: string;
  unit?: string;
  icon?: string;
}> = ({ count, label, unit = 'quả cam', icon }) => {
  const tens = Math.floor(count / 10);
  const units = count % 10;
  const displayIcon = icon || getUnitDisplayIcon(unit);

  return (
    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm shadow">
          {count}
        </span>
        <h4 className="font-bold text-amber-900 text-base">{label || `Trực quan xác định: ${count} ${unit}`}</h4>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 w-full">
        {Array.from({ length: tens }).map((_, tIdx) => (
          <div key={`ten-${tIdx}`} className="bg-amber-100 border border-amber-400 rounded-xl p-2.5 flex flex-col items-center shadow-xs">
            <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full mb-1">
              1 Chục (10 {unit})
            </span>
            <div className="grid grid-cols-5 gap-1 bg-white/70 p-1.5 rounded-lg border border-amber-200">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-600 flex items-center justify-center shadow-xs text-[9px] text-white font-bold"
                  title={`1 ${unit}`}
                >
                  {displayIcon}
                </div>
              ))}
            </div>
          </div>
        ))}

        {units > 0 && (
          <div className="bg-orange-100 border border-orange-400 rounded-xl p-2.5 flex flex-col items-center shadow-xs">
            <span className="text-xs font-bold text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full mb-1">
              {units} Đơn vị rời
            </span>
            <div className="flex flex-wrap gap-1.5 bg-white/70 p-2 rounded-lg border border-orange-200 max-w-[140px] justify-center">
              {Array.from({ length: units }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-600 flex items-center justify-center shadow-xs text-[9px]"
                  title={`1 ${unit} rời`}
                >
                  {displayIcon}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-2.5 text-xs text-amber-700 text-center font-medium">
        Lớp trực quan xác định bằng thuật toán: {tens > 0 ? `${tens} chục` : ''} {units > 0 ? `và ${units} đơn vị` : ''} {unit} (chính xác 100%, không bị sai số đồ họa)
      </p>
    </div>
  );
};

// Base-10 Blocks (Thanh chục và khối đơn vị SGK Toán 2)
export const BaseTenBlocksVisual: React.FC<{ num1: number; num2: number; operation: string }> = ({
  num1,
  num2,
  operation,
}) => {
  const tens1 = Math.floor(num1 / 10);
  const units1 = num1 % 10;
  const tens2 = Math.floor(num2 / 10);
  const units2 = num2 % 10;

  return (
    <div className="bg-indigo-50/90 border-2 border-indigo-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-indigo-100 pb-2">
        <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
          <span className="p-1 rounded bg-indigo-600 text-white text-xs">Trực quan</span>
          Thanh Chục & Khối Đơn Vị (SGK GDPT 2018)
        </h4>
        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-mono font-bold">
          {num1} {operation === 'TRỪ' ? '-' : '+'} {num2}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number 1 */}
        <div className="bg-white p-3 rounded-xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 mb-2">Số thứ nhất: {num1} ({tens1} chục, {units1} đơn vị)</p>
          <div className="flex items-end gap-2">
            <div className="flex gap-1.5">
              {Array.from({ length: tens1 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-0.5 p-1 bg-blue-100 rounded border border-blue-400" title="Thanh 10">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} className="w-3.5 h-1.5 bg-blue-500 rounded-xs" />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 max-w-[80px] p-1 bg-sky-50 rounded border border-sky-300">
              {Array.from({ length: units1 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-sky-500 rounded-xs border border-sky-600" title="1 đơn vị" />
              ))}
            </div>
          </div>
        </div>

        {/* Number 2 */}
        <div className="bg-white p-3 rounded-xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 mb-2">Số thứ hai: {num2} ({tens2} chục, {units2} đơn vị)</p>
          <div className="flex items-end gap-2">
            <div className="flex gap-1.5">
              {Array.from({ length: tens2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-0.5 p-1 bg-emerald-100 rounded border border-emerald-400" title="Thanh 10">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} className="w-3.5 h-1.5 bg-emerald-500 rounded-xs" />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 max-w-[80px] p-1 bg-teal-50 rounded border border-teal-300">
              {Array.from({ length: units2 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-teal-500 rounded-xs border border-teal-600" title="1 đơn vị" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Analog Clock with deterministic hour and minute hands
export const ClockVisual: React.FC<{ hours: number; minutes: number }> = ({ hours, minutes }) => {
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="flex flex-col items-center p-3 bg-cyan-50 border border-cyan-200 rounded-2xl">
      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
        <circle cx="70" cy="70" r="64" fill="#ffffff" stroke="#0891b2" strokeWidth="6" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
          const angle = (num / 12) * 2 * Math.PI - Math.PI / 2;
          const x = 70 + 48 * Math.cos(angle);
          const y = 70 + 48 * Math.sin(angle) + 4;
          return (
            <text
              key={num}
              x={x}
              y={y}
              fontSize="12"
              fontWeight="bold"
              fill="#0f172a"
              textAnchor="middle"
            >
              {num}
            </text>
          );
        })}
        <line
          x1="70"
          y1="70"
          x2={70 + 30 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={70 - 30 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="70"
          x2={70 + 42 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={70 - 42 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="#0284c7"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="70" cy="70" r="4" fill="#0f172a" />
      </svg>
      <span className="mt-2 text-xs font-bold text-cyan-900 bg-cyan-100 px-3 py-1 rounded-full">
        Đồng hồ chỉ: {hours} giờ {minutes > 0 ? `${minutes} phút` : 'đúng'}
      </span>
    </div>
  );
};
