import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-card">
        <div className="skeleton-line wide" />
        <div className="skeleton-line medium" />
        <div className="skeleton-circle" />
        <div className="skeleton-line narrow" />
        <div className="skeleton-line medium" />
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-box" />
          ))}
        </div>
      </div>
    </div>
  );
}
