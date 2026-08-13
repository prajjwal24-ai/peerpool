import { useEffect, useRef } from 'react';

export default function Galaxy() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create Star & Sparkle Particles
    const numStars = 150;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      sparkleSpeed: Math.random() * 0.03 + 0.01,
      color: Math.random() > 0.3 ? '#38bdf8' : '#818cf8', // Cyan & Indigo glow
    }));

    // Mouse Interaction
    let mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        // Twinkle / Sparkle Alpha Update
        star.alpha += star.sparkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.1) {
          star.sparkleSpeed = -star.sparkleSpeed;
        }

        // Slight drift movement
        star.y -= star.speed * 10;
        if (star.y < 0) star.y = height;

        // Draw Sparkle
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size * 4;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen -z-10 bg-slate-950 pointer-events-none"
    />
  );
}