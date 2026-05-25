import React from 'react';

export default function GlobeView({ lat, lon, cityName, weather }) {
  const condition = weather?.weather[0]?.main?.toLowerCase() || 'clear';

  const getGlobeColor = () => {
    if (condition.includes('rain') || condition.includes('drizzle')) return ['#1a3a5c', '#2d6a9f'];
    if (condition.includes('snow')) return ['#b0c4de', '#e8f0fe'];
    if (condition.includes('thunderstorm')) return ['#1a1a2e', '#4a0080'];
    if (condition.includes('cloud')) return ['#2c3e50', '#4a6fa5'];
    return ['#0f3460', '#1a6eb5'];
  };

  const [c1, c2] = getGlobeColor();

  // Normalize lat/lon to percentage position on globe
  const dotX = ((lon + 180) / 360) * 100;
  const dotY = ((90 - lat) / 180) * 100;

  return (
    <div className="globe-container">
      <div className="globe-wrapper">
        <div className="globe" style={{ background: `radial-gradient(circle at 35% 35%, ${c2}, ${c1})` }}>
          {/* Grid lines */}
          <div className="globe-grid">
            {[20, 40, 60, 80].map(p => (
              <div key={p} className="globe-line-h" style={{ top: `${p}%` }} />
            ))}
            {[20, 40, 60, 80].map(p => (
              <div key={p} className="globe-line-v" style={{ left: `${p}%` }} />
            ))}
          </div>

          {/* City dot */}
          <div className="globe-dot" style={{
            left: `${Math.min(Math.max(dotX, 5), 95)}%`,
            top: `${Math.min(Math.max(dotY, 5), 95)}%`,
          }}>
            <div className="globe-dot-pulse" />
          </div>

          {/* Atmosphere glow */}
          <div className="globe-atmosphere" />
        </div>

        {/* Rotating ring */}
        <div className="globe-ring" />
      </div>

      <div className="globe-info">
        <h3>📍 {cityName}</h3>
        <div className="globe-coords">
          <span>🌐 {lat?.toFixed(2)}°{lat >= 0 ? 'N' : 'S'}</span>
          <span>🌐 {lon?.toFixed(2)}°{lon >= 0 ? 'E' : 'W'}</span>
        </div>
        {weather && (
          <div className="globe-weather-mini">
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} alt="" />
            <span>{Math.round(weather.main.temp)}°C</span>
            <span style={{ opacity: 0.7, fontSize: '0.85rem', textTransform: 'capitalize' }}>{weather.weather[0].description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
