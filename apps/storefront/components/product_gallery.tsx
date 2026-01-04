"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setcurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setcurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-muted-foreground">
        No images
      </div>
    );
  }
  return (
    <div className="w-full space-y-4">
      {/* Main Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                <Image
                  src={src}
                  alt={`Product Image ${index + 1}`}
                  className="object-cover w-full h-full"
                  width={100000}
                  height={100000}
                  loading="eager"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {" "}
          {images.map((src, index) => (
            <Button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative flex-shrink-0 w-15 h-15 rounded-md overflow-hidden border-2 transition-all",
                current === index
                  ? "border-black"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                width={10000}
                height={10000}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
