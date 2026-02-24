import { useEffect, useRef } from 'react';

export default function MilkyWay() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let scrollY = 0;

        // Generate star particles
        const STAR_COUNT = 600;
        const stars = [];

        for (let i = 0; i < STAR_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.35 + 0.05;
            const spiralFactor = Math.random() * 6;

            stars.push({
                // Position along spiral arms
                baseX: 0.5 + Math.cos(angle + spiralFactor * radius) * radius,
                baseY: 0.5 + Math.sin(angle + spiralFactor * radius) * radius * 0.4,
                size: Math.random() * 2 + 0.3,
                opacity: Math.random() * 0.6 + 0.1,
                speed: Math.random() * 0.3 + 0.1,
                phase: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 0.0003,
            });
        }

        // Add some brighter accent stars
        for (let i = 0; i < 40; i++) {
            stars.push({
                baseX: Math.random(),
                baseY: Math.random(),
                size: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.3 + 0.1,
                speed: Math.random() * 0.15 + 0.05,
                phase: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 0.0001,
            });
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
        };

        const handleScroll = () => {
            scrollY = window.scrollY;
        };

        const draw = (time) => {
            resize();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scrollOffset = scrollY * 0.15;
            const t = time * 0.001;

            for (const star of stars) {
                const twinkle = Math.sin(t * star.speed + star.phase) * 0.3 + 0.7;
                const alpha = star.opacity * twinkle;

                // Apply scroll-based parallax movement
                const parallaxY = scrollOffset * star.speed;
                const driftX = Math.sin(t * star.drift * 10 + star.phase) * 20;

                const x = star.baseX * canvas.width + driftX;
                const y = star.baseY * canvas.height - parallaxY;

                // Wrap around
                const wrappedY = ((y % canvas.height) + canvas.height) % canvas.height;

                ctx.beginPath();
                ctx.arc(x, wrappedY, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.25})`;
                ctx.fill();

                // Subtle glow on larger stars
                if (star.size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(x, wrappedY, star.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.03})`;
                    ctx.fill();
                }
            }

            // Draw milky way band — diagonal strip of concentrated dots
            const bandStars = 200;
            for (let i = 0; i < bandStars; i++) {
                const progress = i / bandStars;
                const bandX = progress * canvas.width;
                const bandY = (0.3 + progress * 0.4) * canvas.height - scrollOffset * 0.1;
                const scatter = (Math.sin(progress * 20 + t * 0.2) + 1) * 40 + Math.random() * 60;
                const offsetX = (Math.random() - 0.5) * scatter;
                const offsetY = (Math.random() - 0.5) * scatter * 0.5;

                const wrappedBandY = ((bandY + offsetY) % canvas.height + canvas.height) % canvas.height;

                ctx.beginPath();
                ctx.arc(bandX + offsetX, wrappedBandY, Math.random() * 1.2 + 0.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.08 + 0.02})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', handleScroll);
        animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.7,
            }}
        />
    );
}
