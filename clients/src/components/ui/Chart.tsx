'use client';

import { useEffect, useRef } from 'react';

interface ChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type: 'bar' | 'line' | 'pie';
  title?: string;
  height?: number;
}

export default function Chart({ data, type, title, height = 200 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const chartHeight = canvas.height - 40; // Space for labels
    const padding = 20;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - padding * 2) / data.length - 10;

    if (type === 'bar') {
      // Draw bars
      data.forEach((item, index) => {
        const x = padding + index * ((width - padding * 2) / data.length);
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = canvas.height - 40 - barHeight;

        // Bar
        ctx.fillStyle = item.color || '#3B82F6';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, canvas.height - 10);
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
      });
    } else if (type === 'line') {
      // Draw line chart
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((item, index) => {
        const x = padding + index * ((width - padding * 2) / (data.length - 1));
        const y = canvas.height - 40 - (item.value / maxValue) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Point
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x, canvas.height - 10);
      });

      ctx.stroke();
    } else if (type === 'pie') {
      // Draw pie chart
      const centerX = width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      const total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = 0;

      data.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;

        ctx.fillStyle = item.color || '#3B82F6';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        currentAngle += sliceAngle;
      });
    }
  }, [data, type]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={height}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
} 