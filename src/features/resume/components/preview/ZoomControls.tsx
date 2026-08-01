import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitWidth: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitWidth,
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-full px-3 py-1.5 shadow-xl text-slate-300">
      <button
        onClick={onZoomOut}
        disabled={zoom <= 50}
        className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors disabled:opacity-40"
        title="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <span className="text-xs font-mono font-semibold px-2 min-w-[45px] text-center text-indigo-300">
        {zoom}%
      </span>

      <button
        onClick={onZoomIn}
        disabled={zoom >= 150}
        className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors disabled:opacity-40"
        title="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-3.5 bg-slate-800 mx-1" />

      <button
        onClick={onReset}
        className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        title="Reset to 100%"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onFitWidth}
        className="p-1 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        title="Fit to Viewport"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
