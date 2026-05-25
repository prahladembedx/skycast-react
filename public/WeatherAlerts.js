import React from 'react';

export function generateAlerts(weather) {
  if (!weather) return [];
  const alerts = [];
  const temp = weather.main.temp;
  const wind = weather.wind.speed;
  const humidity = weather.main.humidity;
  const cond = weather.weather[0].main.toLowerCase();
  const visibility = weather.visibility;

  if (cond.includes('thunderstorm')) alerts.push({ type: 'danger', icon: '⚡', title: 'Thunderstorm Warning', desc: 'Severe thunderstorm in your area. Stay indoors and away from windows.' });
  if (cond.includes('tornado')) alerts.push({ type: 'danger', icon: '🌪️', title: 'Tornado Warning', desc: 'Tornado detected nearby! Seek shelter immediately in a basement or interior room.' });
  if (temp >= 42) alerts.push({ type: 'danger', icon: '🔥', title: 'Extreme Heat Alert', desc: `Temperature is ${Math.round(temp)}°C. Risk of heatstroke. Stay indoors and hydrate!` });
  else if (temp >= 37) alerts.push({ type: 'warning', icon: '🌡️', title: 'Heat Advisory', desc: `High temperature of ${Math.round(temp)}°C. Avoid outdoor activities between 11AM-4PM.` });
  if (temp <= 0) alerts.push({ type: 'warning', icon: '🥶', title: 'Freezing Temperature', desc: `Temperature is ${Math.round(temp)}°C. Risk of frostbite. Wear warm clothing!` });
  if (wind >= 20) alerts.push({ type: 'danger', icon: '💨', title: 'High Wind Warning', desc: `Wind speed ${wind} m/s. Avoid driving and outdoor activities.` });
  else if (wind >= 12) alerts.push({ type: 'warning', icon: '🌬️', title: 'Wind Advisory', desc: `Strong winds at ${wind} m/s. Secure loose outdoor items.` });
  if (cond.includes('snow') && wind >= 8) alerts.push({ type: 'danger', icon: '❄️', title: 'Blizzard Warning', desc: 'Heavy snow with strong winds. Avoid travel!' });
  else if (cond.includes('snow')) alerts.push({ type: 'warning', icon: '🌨️', title: 'Snow Advisory', desc: 'Snowfall expected. Roads may be slippery. Drive carefully.' });
  if (visibility < 1000) alerts.push({ type: 'warning', icon: '🌫️', title: 'Dense Fog Advisory', desc: `Visibility only ${visibility}m. Drive slowly with fog lights.` });
  if (humidity >= 90 && temp >= 30) alerts.push({ type: 'info', icon: '💦', title: 'High Humidity Alert', desc: `Humidity at ${humidity}%. Feels very uncomfortable. Stay hydrated.` });

  return alerts;
}

export default function WeatherAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-card no-alerts">
        <span>✅</span>
        <p>No severe weather alerts for your area!</p>
      </div>
    );
  }

  const colors = {
    danger: { bg: 'rgba(244,67,54,0.15)', border: '#f44336', text: '#f44336' },
    warning: { bg: 'rgba(255,152,0,0.15)', border: '#ff9800', text: '#ff9800' },
    info: { bg: 'rgba(79,195,247,0.15)', border: '#4fc3f7', text: '#4fc3f7' },
  };

  return (
    <div className="alerts-list">
      {alerts.map((alert, i) => {
        const c = colors[alert.type];
        return (
          <div key={i} className="alert-item" style={{ background: c.bg, borderLeft: `4px solid ${c.border}` }}>
            <div className="alert-header">
              <span className="alert-icon">{alert.icon}</span>
              <span className="alert-title" style={{ color: c.text }}>{alert.title}</span>
            </div>
            <p className="alert-desc">{alert.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
