"use client";

import React, { useMemo, useRef } from "react";

const PX_PER_FOOT = 10; // scale

function toPx(feet) {
  return Math.round(feet * PX_PER_FOOT);
}

export default function FloorPlan() {
  // Building dims derived from spec
  const hallLengthFt = 24;
  const hallWidthFt = 12;
  const roomLengthFt = 12; // along building length
  const roomWidthFt = 11; // building width per side
  const buildingLengthFt = 24; // same as hall length
  const buildingWidthFt = roomWidthFt + hallWidthFt + roomWidthFt; // 11 + 12 + 11 = 34

  // Staircase footprint inside a hall corner
  const stairSizeFt = 6; // square 6ft x 6ft inside hall corner

  const paddingPx = 60; // margin for dimension lines

  const svgWidth = toPx(buildingWidthFt) + paddingPx * 2;
  const svgHeight = toPx(buildingLengthFt) + paddingPx * 2 + 40;

  const exportSvgRef = useRef(null);

  const positions = useMemo(() => {
    const originX = paddingPx;
    const originY = paddingPx;

    const outer = {
      x: originX,
      y: originY,
      w: toPx(buildingWidthFt),
      h: toPx(buildingLengthFt),
    };

    const leftRoom1 = { x: originX, y: originY, w: toPx(roomWidthFt), h: toPx(roomLengthFt) };
    const leftRoom2 = { x: originX, y: originY + toPx(roomLengthFt), w: toPx(roomWidthFt), h: toPx(roomLengthFt) };

    const rightBaseX = originX + toPx(roomWidthFt + hallWidthFt);
    const rightRoom1 = { x: rightBaseX, y: originY, w: toPx(roomWidthFt), h: toPx(roomLengthFt) };
    const rightRoom2 = { x: rightBaseX, y: originY + toPx(roomLengthFt), w: toPx(roomWidthFt), h: toPx(roomLengthFt) };

    const hall = { x: originX + toPx(roomWidthFt), y: originY, w: toPx(hallWidthFt), h: toPx(hallLengthFt) };

    const stair = { x: hall.x + 4, y: hall.y + 4, w: toPx(stairSizeFt), h: toPx(stairSizeFt) };

    return { outer, leftRoom1, leftRoom2, rightRoom1, rightRoom2, hall, stair, originX, originY };
  }, []);

  function downloadSVG() {
    const svg = exportSvgRef.current;
    if (!svg) return;
    const cloned = svg.cloneNode(true);
    cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([cloned.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ground-floor-plan.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPNG() {
    const svg = exportSvgRef.current;
    if (!svg) return;
    const cloned = svg.cloneNode(true);
    cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgData = new XMLSerializer().serializeToString(cloned);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    await new Promise((resolve) => {
      img.onload = () => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.src = url;
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ground-floor-plan.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png", 1);

    URL.revokeObjectURL(url);
  }

  function DimLine({ x1, y1, x2, y2, label }) {
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth={1} markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize={12} fill="#333" fontWeight={600}>
          {label}
        </text>
      </g>
    );
  }

  const { outer, leftRoom1, leftRoom2, rightRoom1, rightRoom2, hall, stair, originX, originY } = positions;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ padding: '6px 10px', background: '#f2f2f2', borderRadius: 8 }}>
          Scale: 1 ft = {PX_PER_FOOT}px
        </span>
        <button onClick={downloadSVG} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Download SVG</button>
        <button onClick={downloadPNG} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Download PNG</button>
      </div>

      <svg ref={exportSvgRef} width={svgWidth} height={svgHeight} style={{ border: '1px solid #e5e5e5', background: '#fff' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
          </marker>
          <pattern id="stairHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#aaa" strokeWidth="2" />
          </pattern>
        </defs>

        {/* Outer walls */}
        <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} fill="#fafafa" stroke="#111" strokeWidth={2} />

        {/* Internal walls */}
        {/* Left rooms */}
        <rect x={leftRoom1.x} y={leftRoom1.y} width={leftRoom1.w} height={leftRoom1.h} fill="#fff" stroke="#555" strokeWidth={1.5} />
        <rect x={leftRoom2.x} y={leftRoom2.y} width={leftRoom2.w} height={leftRoom2.h} fill="#fff" stroke="#555" strokeWidth={1.5} />

        {/* Right rooms */}
        <rect x={rightRoom1.x} y={rightRoom1.y} width={rightRoom1.w} height={rightRoom1.h} fill="#fff" stroke="#555" strokeWidth={1.5} />
        <rect x={rightRoom2.x} y={rightRoom2.y} width={rightRoom2.w} height={rightRoom2.h} fill="#fff" stroke="#555" strokeWidth={1.5} />

        {/* Hall */}
        <rect x={hall.x} y={hall.y} width={hall.w} height={hall.h} fill="#fff" stroke="#555" strokeWidth={1.5} />

        {/* Stair in hall corner */}
        <rect x={stair.x} y={stair.y} width={stair.w} height={stair.h} fill="url(#stairHatch)" stroke="#333" strokeWidth={1.2} />

        {/* Labels */}
        <g fill="#111" fontSize={13} fontWeight={600}>
          <text x={hall.x + hall.w / 2} y={hall.y + hall.h / 2} textAnchor="middle">Hall 24' ? 12'</text>
          <text x={leftRoom1.x + leftRoom1.w / 2} y={leftRoom1.y + leftRoom1.h / 2} textAnchor="middle">???? 12' ? 11'</text>
          <text x={leftRoom2.x + leftRoom2.w / 2} y={leftRoom2.y + leftRoom2.h / 2} textAnchor="middle">???? 12' ? 11'</text>
          <text x={rightRoom1.x + rightRoom1.w / 2} y={rightRoom1.y + rightRoom1.h / 2} textAnchor="middle">???? 12' ? 11'</text>
          <text x={rightRoom2.x + rightRoom2.w / 2} y={rightRoom2.y + rightRoom2.h / 2} textAnchor="middle">???? 12' ? 11'</text>
          <text x={stair.x + stair.w / 2} y={stair.y + stair.h / 2} textAnchor="middle" fontSize={12}>?????</text>
        </g>

        {/* Dimension lines - outer */}
        <DimLine x1={outer.x} y1={outer.y + outer.h + 24} x2={outer.x + outer.w} y2={outer.y + outer.h + 24} label={`??? ??????: ${buildingWidthFt} ft`} />
        <DimLine x1={outer.x - 24} y1={outer.y} x2={outer.x - 24} y2={outer.y + outer.h} label={`??? ??????: ${buildingLengthFt} ft`} />

        {/* Internal dims */}
        <DimLine x1={hall.x} y1={outer.y - 20} x2={hall.x + hall.w} y2={outer.y - 20} label={`??? ??????: ${hallWidthFt} ft`} />
        <DimLine x1={leftRoom1.x} y1={outer.y - 40} x2={leftRoom1.x + leftRoom1.w} y2={outer.y - 40} label={`???? ??????: ${roomWidthFt} ft`} />
        <DimLine x1={rightRoom1.x} y1={outer.y - 40} x2={rightRoom1.x + rightRoom1.w} y2={outer.y - 40} label={`???? ??????: ${roomWidthFt} ft`} />
        <DimLine x1={outer.x + outer.w + 24} y1={leftRoom1.y} x2={outer.x + outer.w + 24} y2={leftRoom1.y + leftRoom1.h} label={`12 ft`} />
        <DimLine x1={outer.x + outer.w + 24} y1={leftRoom2.y} x2={outer.x + outer.w + 24} y2={leftRoom2.y + leftRoom2.h} label={`12 ft`} />
        <DimLine x1={outer.x + outer.w + 48} y1={hall.y} x2={outer.x + outer.w + 48} y2={hall.y + hall.h} label={`??? 24 ft`} />

        {/* Height info */}
        <text x={outer.x + outer.w - 4} y={outer.y + outer.h + 40} textAnchor="end" fontSize={12} fill="#333">????? / Storey Height: 11.6 ft</text>
      </svg>

      <p style={{ marginTop: 12, color: '#666' }}>
        Note: Diagram is schematic; walls shown as lines; doors/windows not placed.
      </p>
    </div>
  );
}
