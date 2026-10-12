"use client";

import { useEffect, useRef } from "react";

export function CampaignVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      muted
      loop
      playsInline
      preload="none"
      poster="/assets/utpton/video-publicidad-poster.jpg"
      className="!mx-auto !max-h-[70vh] !w-full !rounded-xl !bg-black"
      aria-label="Video promocional de La U del Futuro 2026 y UTPton"
    >
      <source src="/assets/utpton/video-publicidad.mp4" type="video/mp4" />
    </video>
  );
}
