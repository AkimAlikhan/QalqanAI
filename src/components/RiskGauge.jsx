import { useEffect, useRef } from 'react';
import './RiskGauge.css';

export default function RiskGauge({ score = 0, size = 200 }) {
    const canvasRef = useRef(null);
    const animatedScore = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 20;
        const startAngle = 0.75 * Math.PI;
        const endAngle = 2.25 * Math.PI;
        const totalAngle = endAngle - startAngle;

        let animFrame;
        const animate = () => {
            if (animatedScore.current < score) {
                animatedScore.current = Math.min(animatedScore.current + 1, score);
            }

            ctx.clearRect(0, 0, size, size);

            // Track
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Score arc
            const scoreAngle = startAngle + (animatedScore.current / 100) * totalAngle;
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            if (animatedScore.current >= 75) {
                gradient.addColorStop(0, '#ff4757');
                gradient.addColorStop(1, '#ff6b81');
            } else if (animatedScore.current >= 50) {
                gradient.addColorStop(0, '#ffa502');
                gradient.addColorStop(1, '#ffbe76');
            } else {
                gradient.addColorStop(0, '#2ed573');
                gradient.addColorStop(1, '#7bed9f');
            }

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Glow effect
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
            ctx.strokeStyle = animatedScore.current >= 75
                ? 'rgba(239, 68, 68, 0.25)'
                : animatedScore.current >= 50
                    ? 'rgba(249, 115, 22, 0.25)'
                    : 'rgba(34, 197, 94, 0.25)';
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.filter = 'blur(10px)';
            ctx.stroke();
            ctx.filter = 'none';

            // Score text
            ctx.fillStyle = '#ffffff';
            ctx.font = `800 ${size * 0.22}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(animatedScore.current), centerX, centerY - 8);

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `500 ${size * 0.07}px Inter, sans-serif`;
            ctx.fillText('RISK SCORE', centerX, centerY + size * 0.15);

            if (animatedScore.current < score) {
                animFrame = requestAnimationFrame(animate);
            }
        };

        animatedScore.current = 0;
        animate();

        return () => cancelAnimationFrame(animFrame);
    }, [score, size]);

    return (
        <div className="risk-gauge" style={{ width: size, height: size }}>
            <canvas ref={canvasRef} style={{ width: size, height: size }} />
        </div>
    );
}
