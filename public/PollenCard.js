import React from 'react';

function estimatePollen(weather) {
  const month = new Date().getMonth();
  const cond = weather.weather[0].main.toLowerCase();
  const temp = weather.main.temp;
  const wind = weather.wind.speed;
  const humidity = weather.main.humidity;

  // Base pollen by season
  let base = 0;
  if (month >= 2 && month <= 4) base = 8;       // Spring (Mar-May) - HIGH
  else if (month >= 5 && month <= 7) base = 6;   // Summer (Jun-Aug) - MODERATE
  else if (month >= 8 && month <= 9) base = 5;   // Autumn (Sep-Oct) - MODERATE
  else base = 1;                                  // Winter - LOW

  // Rain reduces pollen
  if (cond.includes('rain') || cond.includes('drizzle')) base = Math.max(1, base - 4);
  if (cond.includes('thunderstorm')) base = Math.max(1, base - 5);

  // Wind increases pollen spread
  if (wind > 5) base = Math.min(10, base + 1);
  if (wind > 10) base = Math.min(10, base + 1);

  // High humidity reduces pollen
  if (humidity > 80) base = Math.max(1, base - 2);

  // Hot weather increases pollen
  if (temp > 25) base = Math.min(10, base + 1);

  return Math.round(base);
}

const POLLEN_LEVELS = [
  { max: 2, label: 'Low', color: '#4fc3f7', icon: '🌿', advice: 'Great day for allergy sufferers!' },
  { max: 5, label: 'Moderate', color: '#ffeb3b', icon: '🌸', advice: 'Allergy sufferers may experience mild symptoms.' },
  { max: 7, label: 'High', color: '#ff9800', icon: '🌺', advice: 'Keep windows closed. Take antihistamines if needed.' },
  { max: 10, label: 'Very High', color: '#f44336', icon: '🤧', advice: 'Stay indoors! Wear a mask if you must go outside.' },
];

export default function PollenCard({ weather }) {
  if (!weather) return null;
  const score = estimatePollen(weather);
  const level = POLLEN_LEVELS.find(l => score <= l.max) || POLLEN_LEVELS[POLLEN_LEVELS.length - 1];

  const types = ['Tree', 'Grass', 'Weed'];
  const month = new Date().getMonth();
  const treeScore = month >= 2 && month <= 4 ? Math.min(10, score + 1) : Math.max(1, score - 2);
  const grassScore = month >= 4 && month <= 7 ? Math.min(10, score + 1) : Math.max(1, score - 2);
  const weedScore = month >= 7 && month <= 9 ? Math.min(10, score + 1) : Math.max(1, score - 3);
  const scores = [treeScore, grassScore, weedScore];

  return (
    <div className="pollen-card">
      <div className="pollen-header">
        <span>{level.icon}</span>
        <div>
          <h4>🌱 Pollen Index</h4>
          <span style={{ color: level.color, fontSize: '0.85rem', fontWeight: 700 }}>{level.label} — {score}/10</span>
        </div>
      </div>
      <div className="pollen-types">
        {types.map((type, i) => (
          <div key={i} className="pollen-type-item">
            <span className="pollen-type-name">{type}</span>
            <div className="pollen-type-bar">
              <div style={{ width: `${scores[i] * 10}%`, background: level.color, height: '100%', borderRadius: '4px', transition: 'width 1s ease' }} />
            </div>
            <span className="pollen-type-score" style={{ color: level.color }}>{scores[i]}</span>
          </div>
        ))}
      </div>
      <p className="pollen-advice">{level.advice}</p>
      <p className="pollen-note">* Estimated based on season & weather conditions</p>
    </div>
  );
}
