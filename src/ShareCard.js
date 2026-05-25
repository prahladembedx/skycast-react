import React from 'react';
export default function ShareCard({ weather }) {
  const handleShare = async () => {
    const text = `📍 ${weather.name}, ${weather.sys.country}\n🌡️ ${Math.round(weather.main.temp)}°C | ${weather.weather[0].description}\n💧 Humidity: ${weather.main.humidity}% | 🌬️ Wind: ${weather.wind.speed} m/s\n\nChecked via SkyCast ⛅\nhttps://prahladembedx.github.io/skycast-react/`;
    if (navigator.share) {
      try { await navigator.share({ title: `SkyCast — ${weather.name}`, text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Weather info copied! 📋');
    }
  };
  return <button className="share-btn" onClick={handleShare}>📤 Share Weather</button>;
}
