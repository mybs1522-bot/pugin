import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";

export function ThreeDPhotoCarouselDemo({ images }: { images?: string[] }) {
  return (
    <div className="w-full">
      <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span>🖼️</span> Past Render Gallery (3D Carousel)
          </h3>
          <span className="text-xs text-zinc-400">
            Drag horizontally to rotate
          </span>
        </div>
        <ThreeDPhotoCarousel images={images} />
      </div>
    </div>
  );
}
