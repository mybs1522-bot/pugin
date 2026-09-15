import React from 'react';
import { CadWindowSource } from '../types';
import { Monitor, X, Box, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface CadSelectorModalProps {
  open: boolean;
  onClose: () => void;
  sources: CadWindowSource[];
  onSelectSource: (source: CadWindowSource) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function CadSelectorModal({
  open,
  onClose,
  sources,
  onSelectSource,
  onRefresh,
  loading,
}: CadSelectorModalProps) {
  if (!open) return null;

  const cadSources = sources.filter((s) => s.isCadApp);
  const otherSources = sources.filter((s) => !s.isCadApp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select CAD Viewport to Capture</h3>
              <p className="text-xs text-zinc-400">
                Click any open 3D software window to capture its viewport directly into V6
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Detected 3D CAD Tools */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Detected 3D Software ({cadSources.length})
              </h4>
            </div>

            {cadSources.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cadSources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSource(s)}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-emerald-500/30 bg-zinc-950 p-2 text-left transition-all hover:border-emerald-500 hover:scale-[1.02] hover:shadow-lg focus:outline-none"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
                      <img
                        src={s.thumbnailDataUrl}
                        alt={s.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="absolute top-1.5 left-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                        CAD Active
                      </span>
                    </div>
                    <span className="mt-2 truncate text-xs font-bold text-zinc-200 group-hover:text-white">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                No active 3ds Max, Revit, Rhino, or Blender windows auto-detected. Launch your CAD tool or select from all open windows below.
              </div>
            )}
          </div>

          {/* Other Open Windows & Screens */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              All Screens &amp; Open Windows
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {otherSources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSource(s)}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 p-2 text-left transition-all hover:border-zinc-600 hover:bg-zinc-900 focus:outline-none"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
                    <img
                      src={s.thumbnailDataUrl}
                      alt={s.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2 truncate text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
