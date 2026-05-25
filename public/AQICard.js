import React from 'react';

const AQI_LEVELS = [
  { label: 'Good', color: '#00e400', bg: 'rgba(0,228,64,0.15)', icon: '😊', advice: 'Air quality is satisfactory. Enjoy outdoor activities!' },
  { label: 'Fair', color: '#ffff00', bg: 'rgba(255,255,0,0.15)', icon: '🙂', advice: 'Air quality is acceptable. Sensitive people should limit prolonged outdoor exertion.' },
  { label: 'Moderate', color: '#ff7e00', bg: 'rgba(255,126,0,0.15)', icon: '😐', advice: 'Sensitive groups may experience health effects. Limit outdoor time.' },
  { label: 'Poor', color: '#ff0000', bg: 'rgba(255,0,0,0.15)', icon: '😷', advice: 'Everyone may experience health effects. Wear a mask outdoors!' },
  { label: 'Very Poor', color: '#8f3f97', bg: 'rgba(143,63,151,0.15)', icon: '🚫', advice: 'Health alert! Everyone should avoid outdoor activities.' },
];

export default function AQICard({ aqi, components, t }) {
  if (!aqi) return null;
  const level = AQI_LEVELS[aqi - 1] || AQI_LEVELS[0];

  return (
    <div className="aqi-card glass" style={{ borderLeft: `4px solid ${level.color}` }}>
      <div className="aqi-header">
        <h3>🌫️ Air Quality Index</h3>
        <div className="aqi-badge" style={{ background: level.bg, color: level.color }}>
          {level.icon} {level.label}
        </div>
      </div>

      <div className="aqi-meter">
        <div className="aqi-bar">
          <div className="aqi-fill" style={{ width: `${(aqi / 5) * 100}%`, background: level.color }} />
        </div>
        <div className="aqi-labels">
          {AQI_LEVELS.map((l, i) => (
            <span key={i} style={{ color: i + 1 === aqi ? l.color : 'inherit', fontWeight: i + 1 === aqi ? 800 : 400, fontSize: i + 1 === aqi ? '0.8rem' : '0.65rem' }}>{l.label}</span>
          ))}
        </div>
      </div>

      <p className="aqi-advice">{level.advice}</p>

      {components && (
        <div className="aqi-components">
          {[
            { label: 'PM2.5', value: components.pm2_5?.toFixed(1), unit: 'μg/m³' },
            { label: 'PM10', value: components.pm10?.toFixed(1), unit: 'μg/m³' },
            { label: 'O₃', value: components.o3?.toFixed(1), unit: 'μg/m³' },
            { label: 'NO₂', value: components.no2?.toFixed(1), unit: 'μg/m³' },
            { label: 'SO₂', value: components.so2?.toFixed(1), unit: 'μg/m³' },
            { label: 'CO', value: components.co?.toFixed(1), unit: 'μg/m³' },
          ].map((c, i) => (
            <div key={i} className="aqi-component-item">
              <span className="aqi-comp-label">{c.label}</span>
              <span className="aqi-comp-value">{c.value}</span>
              <span className="aqi-comp-unit">{c.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
