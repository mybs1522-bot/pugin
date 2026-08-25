"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface GalleryPhoto {
  id: string | number;
  image: string;
  title?: string;
}

const defaultPhotos: GalleryPhoto[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    title: "Living Room Villa",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop",
    title: "Modern Interior",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    title: "Forest House",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
    title: "Scandinavian Kitchen",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
    title: "Architecture Facade",
  },
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectPhoto?: (photo: GalleryPhoto) => void;
}

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  folderName = "Project Renders",
  dragHintText = "Drag photo down or click to close",
  className,
  isOpen,
  onOpenChange,
  onSelectPhoto,
}: InteractiveFolderGalleryProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);

  const isFolderOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setIsFolderOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    setInternalIsOpen(open);
  };

  const displayPhotos = photos && photos.length > 0 ? photos : defaultPhotos;

  return (
    <div className={`relative ${className || ""}`}>
      <div className="relative flex flex-col items-center justify-center">
        <div className="pointer-events-none relative z-0 flex h-[150px] w-[280px] justify-center">
          {/* Back Folder Pocket */}
          <motion.div
            className="absolute bottom-2 h-32 w-56 drop-shadow-2xl"
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              scale: isFolderOpen ? 0.9 : 1,
            }}
          >
            <div className="absolute top-0 left-0 h-6 w-20 rounded-t-xl border-t border-r border-l border-white/15 bg-gradient-to-t from-[#1e1e1e] to-[#2a2a2a]" />
            <div className="absolute top-5 right-0 bottom-0 left-0 rounded-tr-xl rounded-b-xl border border-white/15 bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]" />
            <div className="pointer-events-none absolute top-7 right-2 bottom-2 left-2 rounded-lg bg-black/90 shadow-inner" />
          </motion.div>

          {/* Render Photo Cards Stack */}
          <div className="absolute bottom-3 z-10 flex justify-center">
            {displayPhotos.slice(-6).map((photo, i, arr) => {
              const count = arr.length;
              const mid = (count - 1) / 2;
              const offset = i - mid;

              const stackY = hoverFolder ? offset * -6 - 20 : offset * -2.5;
              const stackX = hoverFolder ? offset * 18 : offset * 2;
              const stackRotate = hoverFolder ? offset * 5 : offset * 2;
              const stackScale = 1 - Math.abs(offset) * 0.04;

              const openY = -110;
              const openX = offset * 95;
              const openRotate = 0;
              const openScale = 1.05;

              return (
                <motion.div
                  key={photo.id}
                  drag={isFolderOpen}
                  dragSnapToOrigin={true}
                  onDragEnd={(e, info) => {
                    if (info.offset.y > 60 && isFolderOpen) {
                      setIsFolderOpen(false);
                      setHoverFolder(false);
                    }
                  }}
                  onClick={() => {
                    if (isFolderOpen && onSelectPhoto) {
                      onSelectPhoto(photo);
                    }
                  }}
                  className={`absolute bottom-0 h-44 w-32 origin-bottom overflow-hidden rounded-xl border border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                    isFolderOpen
                      ? "pointer-events-auto cursor-grab active:cursor-grabbing"
                      : "pointer-events-none"
                  }`}
                  animate={
                    !isFolderOpen
                      ? {
                          y: stackY,
                          x: stackX,
                          rotate: stackRotate,
                          scale: stackScale,
                          zIndex: i + 10,
                        }
                      : {
                          y: openY,
                          x: openX,
                          rotate: openRotate,
                          scale: openScale,
                          zIndex: 50 + i,
                        }
                  }
                  whileHover={
                    isFolderOpen ? { scale: openScale + 0.08, zIndex: 100 } : {}
                  }
                  whileDrag={
                    isFolderOpen
                      ? { scale: openScale + 0.12, rotate: 5, zIndex: 150 }
                      : {}
                  }
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <img
                    src={photo.image}
                    alt={photo.title || "Gallery item"}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                  {isFolderOpen && photo.title && (
                    <div className="absolute inset-x-0 bottom-0 truncate bg-black/80 p-1 text-center text-[9px] font-bold text-zinc-300 backdrop-blur-md">
                      {photo.title}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Front Folder Lip / Tab */}
          <motion.div
            className="pointer-events-auto absolute bottom-0 z-20 h-24 w-56 cursor-pointer drop-shadow-[0_-15px_30px_rgba(0,0,0,0.8)]"
            style={{ transformOrigin: "bottom" }}
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              rotateX: hoverFolder ? -25 : 0,
              y: hoverFolder ? 6 : 0,
              pointerEvents: isFolderOpen ? "none" : "auto",
            }}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onClick={() => setIsFolderOpen(true)}
          >
            <div className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-[#2a2a2a] to-[#111] pb-3.5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
              <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/90 px-3.5 py-1.5 shadow-inner backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                <span className="text-[11px] font-bold tracking-wide text-white">
                  {folderName} ({displayPhotos.length})
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Drag down / close hint when open */}
        {isFolderOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto absolute -bottom-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-black/90 px-3.5 py-1 text-[10px] font-semibold text-zinc-300 shadow-2xl backdrop-blur-md"
            onClick={() => setIsFolderOpen(false)}
          >
            <span>{dragHintText}</span>
            <span className="text-xs text-white">✕</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export { InteractiveFolderGallery as Component };
