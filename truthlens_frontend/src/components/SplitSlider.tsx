import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface SplitSliderProps {
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
  heightClass?: string;
}

export const SplitSlider: React.FC<SplitSliderProps> = ({
  leftImage,
  rightImage,
  leftLabel = "Original Evidence",
  rightLabel = "Forensic Comparison",
  heightClass = "h-[450px]"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/60 bg-navy-900 shadow-2xl select-none">
      
      {/* Top Labels */}
      <div className="absolute top-3 inset-x-3 z-30 flex justify-between pointer-events-none">
        <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-slate-900/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-sm shadow">
          ◀ {leftLabel}
        </span>
        <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-slate-900/80 text-violet-400 border border-violet-500/30 backdrop-blur-sm shadow">
          {rightLabel} ▶
        </span>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} cursor-col-resize overflow-hidden`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Right Image (Background) */}
        <img
          src={rightImage}
          alt={rightLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Left Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={leftImage}
            alt={leftLabel}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-navy-950 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <ChevronsLeftRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Interactive Helper Text */}
      <div className="py-2 px-4 bg-navy-950/90 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex items-center justify-center space-x-2">
        <ChevronsLeftRight className="w-3.5 h-3.5 text-cyan-400" />
        <span>Click and drag slider or tap to compare split layers ({Math.round(sliderPosition)}%)</span>
      </div>

    </div>
  );
};
