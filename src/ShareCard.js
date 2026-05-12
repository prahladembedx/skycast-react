import React, { useRef } from 'react';

export default function ShareCard({ weather, darkMode }) {
  const handleShare = async () => {
    const text = `📍 ${weather.name}, ${weather.sys.country}
🌡️ Temperature: ${Math.round(weather.main.temp)}°C
☁️ ${weather.weather[0].description}
💧 Humidity: ${weather.main.humidity}%
🌬️ Wind: ${weather.wind.speed} m/s

Checked via SkyCast 🌤️
https://prahladembedx.github.io/skycast-react/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SkyCast — ${weather.name} Weather`,
          text: text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback — copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Weather info copied to clipboard! 📋');
    }
  };

  return (
    <button className="share-btn" onClick={handleShare}>
      📤 Share Weather
    </button>
  );
}
