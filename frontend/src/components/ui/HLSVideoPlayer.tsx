"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  className?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  captionsSrc?: string;
  captionsLang?: string;
}

export function HLSVideoPlayer({ src, className, onTimeUpdate, captionsSrc, captionsLang }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHLS = src.includes(".m3u8");

    if (isHLS) {
      // HLS stream — needs hls.js on Chrome/Firefox
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          // Destroy previous instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Ready to play
          });

          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              console.error("HLS fatal error:", data);
            }
          });

          hlsRef.current = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari supports HLS natively
          video.src = src;
        }
      });
    } else {
      // Regular mp4/webm — native video element
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className={className}
      onTimeUpdate={e => {
        const v = e.currentTarget;
        if (onTimeUpdate && v.duration > 0) {
          onTimeUpdate(v.currentTime, v.duration);
        }
      }}
      playsInline
    >
      {captionsSrc && (
        <track
          kind="captions"
          src={captionsSrc}
          srcLang={captionsLang || "en"}
          label="Auto-generated"
          default
        />
      )}
    </video>
  );
}
