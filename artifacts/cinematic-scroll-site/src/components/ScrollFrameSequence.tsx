import { useEffect, useRef } from "react";

const FRAME_COUNT = 79;
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;

function frameUrl(index: number) {
  const baseUrl = import.meta.env.BASE_URL || "./";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
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

  useEffect(() => {
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
      context.imageSmoothingQuality = "high";
      drawFrameRef.current?.();
    };

    const drawSingleFrame = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      context.clearRect(0, 0, viewportWidth, viewportHeight);

      const frameIndex = clamp(
        Math.round(currentFrameRef.current),
        0,
        FRAME_COUNT - 1,
      );
      const image =
        frameImagesRef.current[frameIndex] || frameImagesRef.current[0];

      if (image?.complete && image.naturalWidth > 0) {
        const imgWidth = image.naturalWidth || FRAME_WIDTH;
        const imgHeight = image.naturalHeight || FRAME_HEIGHT;

        const scale = Math.min(
          viewportWidth / imgWidth,
          viewportHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        const x = (viewportWidth - width) / 2;
        const y = (viewportHeight - height) / 2;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, x, y, width, height);
      }
    };

    const drawFrame = () => {
      drawSingleFrame();
    };

    drawFrameRef.current = drawFrame;

    const updateTargetFrame = () => {
      const scrollRange = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const scrollProgress = clamp(window.scrollY / scrollRange, 0, 1);
      targetFrameRef.current = reducedMotionRef.current
        ? 0
        : scrollProgress * (FRAME_COUNT - 1);
    };

    const animate = () => {
      const difference = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current +=
        reducedMotionRef.current ? difference : difference * 0.16;

      if (Math.abs(difference) > 0.01) {
        drawFrame();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      updateTargetFrame();
    };

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          frameImagesRef.current[index] = image;
          if (index === 0) drawFrame();
          resolve();
        };
        image.onerror = () => resolve();
        image.src = frameUrl(index);
      });

    resizeCanvas();
    updateTargetFrame();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("scroll", updateTargetFrame, { passive: true });
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    void loadFrame(0).then(() => {
      for (let index = 1; index < FRAME_COUNT; index += 1) {
        void loadFrame(index);
      }
    });

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        objectFit: "cover",
        opacity: 1,
        filter: "none",
      }}
    />
  );
}