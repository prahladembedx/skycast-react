import React from 'react';

const UV_LEVELS = [
  { max: 2, label: 'Low', color: '#4fc3f7', icon: '😎', advice: 'No protection needed. Safe to be outside!' },
  { max: 5, label: 'Moderate', color: '#ffeb3b', icon: '🧴', advice: 'Wear sunscreen SPF 30+. Seek shade near midday.' },
  { max: 7, label: 'High', color: '#ff9800', icon: '🕶️', advice: 'Reduce time in sun between 10AM-4PM. Use SPF 50+.' },
  { max: 10, label: 'Very High', color: '#f44336', icon: '⚠️', advice: 'Minimize sun exposure! Wear hat, sunglasses, sunscreen.' },
  { max: 20, label: 'Extreme', color: '#9c27b0', icon: '🚨', advice: 'Avoid sun exposure! Serious harm in minutes.' },
];

function getUVLevel(uvi) {
  return UV_LEVELS.find(l => uvi <= l.max) || UV_LEVELS[UV_LEVELS.length - 1];
}

// Calculate estimated UV based on weather conditions
export function estimateUV(weather) {
  const hour = new Date().getHours();
  const cond = weather.weather[0].main.toLowerCase();
  const clouds = weather.clouds?.all || 0;

  // Night time
  if (hour < 6 || hour > 19) return 0;

  // Base UV based on time of day (peak at noon)
  const timeScore = Math.sin(((hour - 6) / 13) * Math.PI);
  let baseUV = timeScore * 10;

  // Cloud reduction
  baseUV *= (1 - (clouds / 100) * 0.75);

  // Condition reduction
  if (cond.includes('rain') || cond.includes('drizzle')) baseUV *= 0.3;
  if (cond.includes('thunderstorm')) baseUV *= 0.1;
  if (cond.includes('snow')) baseUV *= 0.5;

  return Math.round(Math.max(0, Math.min(11, baseUV)));
}

export default function UVCard({ uvi }) {
  const level = getUVLevel(uvi);
  const percentage = Math.min((uvi / 11) * 100, 100);

  return (
    <div className="uv-card">
      <div className="uv-header">
        <span className="uv-icon">{level.icon}</span>
        <div>
          <h4>☀️ UV Index</h4>
          <span className="uv-label" style={{ color: level.color }}>{level.label}</span>
        </div>
        <span className="uv-value" style={{ color: level.color }}>{uvi}</span>
      </div>
      <div className="uv-bar-track">
        <div className="uv-gradient-bar" />
        <div className="uv-indicator" style={{ left: `${percentage}%` }} />
      </div>
      <p className="uv-advice">{level.advice}</p>
    </div>
  );
}
