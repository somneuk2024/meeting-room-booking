import React from 'react';

// Generates an authentic pseudo-deterministic 2D matrix based on input string
// with classic QR finder patterns in three corners and timing tracks
export const QRCodeSVG: React.FC<{
  value: string;
  size?: number;
  className?: string;
}> = ({ value, size = 120, className = '' }) => {
  const matrixSize = 25; // 25x25 grid
  const grid: boolean[][] = Array(matrixSize)
    .fill(null)
    .map(() => Array(matrixSize).fill(false));

  // Helper to draw QR finder pattern (7x7 box)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[r0 + r][c0 + c] = true;
        } else {
          grid[r0 + r][c0 + c] = false;
        }
      }
    }
  };

  // 1. Top-Left finder
  drawFinder(0, 0);
  // 2. Top-Right finder
  drawFinder(0, matrixSize - 7);
  // 3. Bottom-Left finder
  drawFinder(matrixSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Hash the value string to populate data bits
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  // Populate data modules deterministically
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finders or timing patterns
      const inTopLeftFinder = r < 8 && c < 8;
      const inTopRightFinder = r < 8 && c >= matrixSize - 8;
      const inBottomLeftFinder = r >= matrixSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inTiming) {
        const seed = (r * 31 + c * 17 + hash + value.length) % 1000;
        grid[r][c] = (seed % 3 === 0 || (r + c + (hash % 7)) % 2 === 0);
      }
    }
  }

  // Convert to SVG rects
  const rects: React.ReactElement[] = [];
  const cellSize = size / matrixSize;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (grid[r][c]) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize + 0.1}
            height={cellSize + 0.1}
            fill="#0f172a"
          />
        );
      }
    }
  }

  return (
    <div
      className={`inline-block p-2 bg-white rounded-lg border border-slate-200 shadow-xs ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {rects}
      </svg>
    </div>
  );
};
