"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";

interface ScannerBackgroundProps {
  isDark?: boolean;
  themeMode?: "dark" | "light";
}

interface DotParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  isAccent: boolean;
}

export default function ScannerBackground({ isDark: isDarkProp, themeMode }: ScannerBackgroundProps) {
  const isDark = themeMode !== undefined ? themeMode === "dark" : (isDarkProp ?? true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates for gentle interactive proximity
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

    // Dark mode: luminous glowing micro-specks against deep space
    const darkColors = [
      "rgba(56, 189, 248,",  // Sky Blue 400 (#38bdf8)
      "rgba(14, 165, 233,",  // Sky Blue 500 (#0ea5e9)
      "rgba(99, 102, 241,",  // Indigo 500 (#6366f1)
      "rgba(129, 140, 248,", // Indigo 400 (#818cf8)
      "rgba(168, 85, 247,",  // Soft Violet (#a855f7)
      "rgba(224, 242, 254,", // Ice White
    ];

    // Light mode: delicate, airy pastel tints that blend cleanly and subtly into light backgrounds
    const lightColors = [
      "rgba(99, 102, 241,",  // Soft Indigo (#6366f1)
      "rgba(56, 189, 248,",  // Soft Sky Blue (#38bdf8)
      "rgba(148, 163, 184,", // Soft Slate (#94a3b8)
      "rgba(129, 140, 248,", // Soft Light Indigo (#818cf8)
      "rgba(168, 85, 247,",  // Gentle Lavender (#a855f7)
    ];

    const colorSet = isDark ? darkColors : lightColors;
    let particles: DotParticle[] = [];

    const initParticles = () => {
      const isMobile = width < 768;
      // Gentle, clean dot density
      const count = isMobile ? 65 : 125;

      particles = [];
      for (let i = 0; i < count; i++) {
        const color = colorSet[Math.floor(Math.random() * colorSet.length)];

        // Delicate micro-dots: majority 0.6px - 1.1px, small accent dots 1.2px - 1.6px
        const isAccent = Math.random() < 0.22;
        const radius = isAccent
          ? (isMobile ? 1.1 + Math.random() * 0.35 : 1.2 + Math.random() * 0.4)
          : (isMobile ? 0.6 + Math.random() * 0.35 : 0.7 + Math.random() * 0.4);

        // Very calm, gentle zero-gravity drift
        const speed = (0.07 + Math.random() * 0.15) * (isMobile ? 0.75 : 1);
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Base opacity: much softer in light mode to prevent "dirt speck" appearance
        const baseAlpha = isDark
          ? (isAccent ? 0.45 + Math.random() * 0.30 : 0.20 + Math.random() * 0.35)
          : (isAccent ? 0.22 + Math.random() * 0.14 : 0.10 + Math.random() * 0.16);

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          radius,
          color,
          baseAlpha,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.01 + Math.random() * 0.018,
          isAccent,
        });
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initParticles();
    };

    handleResize();
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(canvas);

    // Mouse tracking for subtle interactive proximity push
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Drift motion
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += p.phaseSpeed * dt;

        // Wrap around screen edges smoothly
        const pad = p.radius * 4;
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;

        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;

        // Mouse gentle repulsion
        let drawX = p.x;
        let drawY = p.y;
        if (mouse.active) {
          const mdx = drawX - mouse.x;
          const mdy = drawY - mouse.y;
          const dist = Math.hypot(mdx, mdy);
          const repelRadius = 100;

          if (dist < repelRadius && dist > 1) {
            const force = Math.pow(1 - dist / repelRadius, 2) * 12;
            drawX += (mdx / dist) * force;
            drawY += (mdy / dist) * force;
          }
        }

        // Soft breathing twinkle
        const pulse = 0.85 + 0.15 * Math.sin(p.phase);
        const alpha = Math.max(0.04, Math.min(0.85, p.baseAlpha * pulse));

        // Subtle soft micro-halo on accent dots in dark mode only
        if (isDark && p.isAccent) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha * 0.25})`;
          ctx.fill();
        }

        // Core clean crisp circle
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDark]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: isDark ? 0.95 : 0.75,
        }}
      />
    </Box>
  );
}
