
import React from 'react';

// Define the types for the shapes
type Shape = {
  id: number;
  type: 'circle' | 'square' | 'triangle';
  size: number;
  left: string;
  duration: string;
  delay: string;
  color: string; // e.g., 'rgba(255, 255, 255, 0.5)'
};

const shapes: Shape[] = [
  { id: 1, type: 'circle', size: 60, left: '10%', duration: '15s', delay: '0s', color: 'rgba(236, 72, 153, 0.5)' },
  { id: 2, type: 'square', size: 40, left: '20%', duration: '12s', delay: '2s', color: 'rgba(59, 130, 246, 0.5)' },
  { id: 3, type: 'triangle', size: 50, left: '25%', duration: '18s', delay: '5s', color: 'rgba(245, 158, 11, 0.5)' },
  { id: 4, type: 'circle', size: 30, left: '40%', duration: '16s', delay: '1s', color: 'rgba(139, 92, 246, 0.5)' },
  { id: 5, type: 'square', size: 20, left: '55%', duration: '11s', delay: '4s', color: 'rgba(16, 185, 129, 0.5)' },
  { id: 6, type: 'triangle', size: 70, left: '70%', duration: '20s', delay: '7s', color: 'rgba(239, 68, 68, 0.5)' },
  { id: 7, type: 'circle', size: 45, left: '85%', duration: '14s', delay: '3s', color: 'rgba(99, 102, 241, 0.5)' },
  { id: 8, type: 'square', size: 35, left: '5%', duration: '19s', delay: '8s', color: 'rgba(236, 72, 153, 0.5)' },
  { id: 9, type: 'triangle', size: 55, left: '90%', duration: '13s', delay: '6s', color: 'rgba(59, 130, 246, 0.5)' },
];

const GeometricBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {shapes.map((shape) => {
        const style: React.CSSProperties = {
          left: shape.left,
          width: `${shape.size}px`,
          height: `${shape.size}px`,
          animationDuration: shape.duration,
          animationDelay: shape.delay,
          backgroundColor: shape.color,
        };

        let shapeClass = 'shape';
        if (shape.type === 'circle') {
          shapeClass += ` rounded-full`;
        } else if (shape.type === 'triangle') {
          style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        return (
          <div
            key={shape.id}
            className={shapeClass}
            style={style}
          />
        );
      })}
    </div>
  );
};

export default GeometricBackground;
