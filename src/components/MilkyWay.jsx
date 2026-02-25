import { useEffect, useRef, useCallback } from 'react';

const STAR_COUNT = 280;
const ACCENT_COUNT = 35;
const BAND_POINTS = 60;

export default function MilkyWay() {
    const canvasRef = useRef(null);
    const starsRef = useRef([]);
    const frameRef = useRef(0);

    const init = useCallback(() => {
        const stars = [];

        for (let i = 0; i < STAR_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.4 + 0.05;
            const spiralFactor = Math.random() * 6;

            stars.push({
                baseX: 0.5 + Math.cos(angle + spiralFactor * radius) * radius,
                baseY: 0.5 + Math.sin(angle + spiralFactor * radius) * radius * 0.4,
                size: Math.random() * 1.8 + 0.2,
                opacity: Math.random() * 0.5 + 0.05,
                speed: Math.random() * 0.3 + 0.1,
                phase: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 0.0003,
                baseAngle: angle, // for rotation
                baseRadius: radius,
            });
        }

        // Brighter accent stars
        for (let i = 0; i < ACCENT_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3 + 0.1;
            stars.push({
                baseX: 0.5 + Math.cos(angle) * radius,
                baseY: 0.5 + Math.sin(angle) * radius * 0.35,
                size: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.4 + 0.3,
                speed: Math.random() * 0.2 + 0.15,
                phase: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 0.0002,
                isAccent: true,
                baseAngle: angle,
                baseRadius: radius,
            });
        }

        starsRef.current = stars;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        init();

        let time = 0;
        const draw = () => {
            time += 0.008;
            const scrollY = window.scrollY || 0;
            const scrollOffset = scrollY * 0.15;
            // Rotation angle based on scroll — galaxy spins as user scrolls
            const scrollRotation = scrollY * 0.0004;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Milky way band with rotation
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < BAND_POINTS; i++) {
                const progress = i / BAND_POINTS;
                const baseAngle = progress * Math.PI * 2;
                const rotatedAngle = baseAngle + scrollRotation;

                const offsetX = Math.sin(progress * Math.PI * 3 + time * 0.3) * 30;
                const offsetY = Math.cos(progress * Math.PI * 2 + time * 0.2) * 15;

                // Spiral band shape with rotation
                const bandRadius = 0.15 + progress * 0.25;
                const bandX = (0.5 + Math.cos(rotatedAngle) * bandRadius) * canvas.width + offsetX;
                const bandY = (0.5 + Math.sin(rotatedAngle) * bandRadius * 0.35) * canvas.height + offsetY - scrollOffset * 0.08;

                const wrappedBandY = ((bandY % canvas.height) + canvas.height) % canvas.height;

                const gradient = ctx.createRadialGradient(bandX, wrappedBandY, 0, bandX, wrappedBandY, 60 + Math.sin(time + i) * 20);
                gradient.addColorStop(0, `rgba(180, 200, 255, ${0.015 + Math.sin(time + progress * 6) * 0.008})`);
                gradient.addColorStop(1, 'rgba(180, 200, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.fillRect(bandX - 80, wrappedBandY - 80, 160, 160);
            }

            ctx.restore();

            // Stars with rotation
            for (const star of starsRef.current) {
                const twinkle = Math.sin(time * star.speed * 4 + star.phase) * 0.3 + 0.7;
                const driftX = Math.sin(time * star.drift * 100 + star.phase) * 20;

                // Apply scroll-based rotation to each star
                const rotatedAngle = star.baseAngle + scrollRotation;
                const rx = 0.5 + Math.cos(rotatedAngle + Math.sin(time * 0.1) * 0.02) * star.baseRadius;
                const ry = 0.5 + Math.sin(rotatedAngle + Math.sin(time * 0.1) * 0.02) * star.baseRadius * 0.4;

                const parallaxY = scrollOffset * star.speed;
                const x = rx * canvas.width + driftX;
                const y = ry * canvas.height - parallaxY;

                const wrappedY = ((y % canvas.height) + canvas.height) % canvas.height;

                const alpha = star.opacity * twinkle;

                if (star.isAccent) {
                    // Accent star glow
                    const glow = ctx.createRadialGradient(x, wrappedY, 0, x, wrappedY, star.size * 3);
                    glow.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.6})`);
                    glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(x - star.size * 3, wrappedY - star.size * 3, star.size * 6, star.size * 6);
                }

                ctx.beginPath();
                ctx.arc(x, wrappedY, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
                ctx.fill();
            }

            frameRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [init]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.6,
            }}
        />
    );
}
