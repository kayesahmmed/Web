import { useEffect, useRef } from "react";

const FRAME_COUNT = 208;
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;

function frameUrl(index: number) {
  let base = import.meta.env.BASE_URL || "/";
  if (base === "./" || base === "") {
    base = window.location.pathname.includes("/Web") ? "/Web/" : "/";
  }
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}scroll-frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ScrollFrameSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const drawFrameRef = useRef<(() => void) | undefined>(undefined);
  const reducedMotionRef = useRef(false);
  const lastDrawnFrameRef = useRef(-1);
  const needsResizeRedrawRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const resizeCanvas = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.left = "0px";
      canvas.style.top = "0px";
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = true;
      needsResizeRedrawRef.current = true;
      drawFrameRef.current?.();
    };

    const drawSingleFrame = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const frameIndex = clamp(
        Math.round(currentFrameRef.current),
        0,
        FRAME_COUNT - 1,
      );

      // PERFORMANCE FIX: Only redraw if the frame index actually changed or canvas resized
      if (frameIndex === lastDrawnFrameRef.current && !needsResizeRedrawRef.current) {
        return;
      }

      // Find the closest loaded frame (fallback to older frames if current isn't loaded)
      let imageToDraw = frameImagesRef.current[frameIndex];
      let drewFallback = false;
      
      if (!imageToDraw || !imageToDraw.complete) {
         // try finding previous loaded frame to avoid blank flashes
         for(let i = frameIndex - 1; i >= 0; i--) {
            if (frameImagesRef.current[i]?.complete) {
               imageToDraw = frameImagesRef.current[i];
               drewFallback = true;
               break;
            }
         }
      }

      // If STILL no image, try finding any loaded frame (like frame 0)
      if (!imageToDraw || !imageToDraw.complete) {
         for(let i = 0; i < FRAME_COUNT; i++) {
            if (frameImagesRef.current[i]?.complete) {
               imageToDraw = frameImagesRef.current[i];
               drewFallback = true;
               break;
            }
         }
      }

      if (imageToDraw?.complete && imageToDraw.naturalWidth > 0) {
        context.clearRect(0, 0, viewportWidth, viewportHeight);

        const imgWidth = imageToDraw.naturalWidth || FRAME_WIDTH;
        const imgHeight = imageToDraw.naturalHeight || FRAME_HEIGHT;

        const scale = Math.max(
          viewportWidth / imgWidth,
          viewportHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        const x = (viewportWidth - width) / 2;
        const y = (viewportHeight - height) / 2;

        context.imageSmoothingEnabled = true;
        context.drawImage(imageToDraw, x, y, width, height);

        if (!drewFallback) {
          lastDrawnFrameRef.current = frameIndex;
          needsResizeRedrawRef.current = false;
        } else {
          // We drew a fallback, force a redraw next time
          lastDrawnFrameRef.current = -1;
        }
      } else {
        // We failed to draw anything valid, must retry
        lastDrawnFrameRef.current = -1;
      }
    };

    const drawFrame = () => {
      drawSingleFrame();
    };

    drawFrameRef.current = drawFrame;

    const updateTargetFrame = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const scrollRange = Math.max(docHeight - window.innerHeight, 1);
      
      // Calculate scroll progress with a 99% modifier so the last frame is reached 
      // just before hitting the exact bottom pixel, fixing mobile address bar issues.
      const scrollProgress = clamp(window.scrollY / (scrollRange * 0.99), 0, 1);
      
      targetFrameRef.current = reducedMotionRef.current
        ? 0
        : scrollProgress * (FRAME_COUNT - 1);
    };

    const animate = () => {
      const difference = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current +=
        reducedMotionRef.current ? difference : difference * 0.35; // Snappier easing

      if (Math.abs(difference) > 0.001 || lastDrawnFrameRef.current === -1) {
        drawFrame();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      updateTargetFrame();
    };

    resizeCanvas();
    updateTargetFrame();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("scroll", updateTargetFrame, { passive: true });
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    const loadAllFrames = async () => {
      const loadFrame = (index: number) => {
        return new Promise<void>((resolve) => {
          if (!isMounted) return resolve();
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            frameImagesRef.current[index] = image;
            if (Math.round(currentFrameRef.current) === index || lastDrawnFrameRef.current === -1) {
              drawFrame();
            }
            resolve();
          };
          image.onerror = () => {
            console.warn(`Failed to load frame ${index}`);
            resolve();
          };
          image.src = frameUrl(index);
        });
      };

      // Load frame 0 first to show it immediately
      await loadFrame(0);

      // Load remaining frames in small batches to prevent network/CPU saturation (lag)
      const batchSize = 4;
      for (let i = 1; i < FRAME_COUNT; i += batchSize) {
        if (!isMounted) return;
        const promises = [];
        for (let j = 0; j < batchSize && i + j < FRAME_COUNT; j++) {
          promises.push(loadFrame(i + j));
        }
        await Promise.all(promises);
      }
    };

    loadAllFrames();

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", updateTargetFrame);
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      drawFrameRef.current = undefined;
      frameImagesRef.current = [];
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 1,
          filter: "none",
        }}
      />
    </div>
  );
}