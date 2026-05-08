import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = "YOUR_API_KEY";

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Auto detect location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        if (data.cod === 200) {
          setWeather(data);
          fetchForecastByCoords(latitude, longitude);
        }
      });
    }
  }, []);

  const fetchForecastByCoords = async (lat, lon) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    const daily = data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
    setForecast(daily);
  };

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) {
        setError('City not found! Please try again.');
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(data);
        fetchForecastByCoords(data.coord.lat, data.coord.lon);
      }
    } catch (err) {
      setError('Something went wrong!');
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchWeather();
  };

  const getBackground = () => {
    if (!weather) return darkMode ? '#1a1a2e' : '#87CEEB';
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes('rain') || main.includes('drizzle'))
      return darkMode ? 'linear-gradient(135deg, #1a1a2e, #2c3e50)' : 'linear-gradient(135deg, #4a6fa5, #7f8c8d)';
    if (main.includes('cloud'))
      return darkMode ? 'linear-gradient(135deg, #2c3e50, #3d4f6e)' : 'linear-gradient(135deg, #bdc3c7, #95a5a6)';
    if (main.includes('snow'))
      return darkMode ? 'linear-gradient(135deg, #2c3e50, #4a6291)' : 'linear-gradient(135deg, #e0eafc, #cfdef3)';
    if (main.includes('clear'))
      return darkMode ? 'linear-gradient(135deg, #1a1a2e, #0f3460)' : 'linear-gradient(135deg, #f7971e, #ffd200)';
    return darkMode ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #89f7fe, #66a6ff)';
  };

  const getDays = (dt) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dt * 1000).getDay()];
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`} style={{ background: getBackground() }}>

      {/* Dark/Light Toggle */}
      <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1>🌤️ Weather App</h1>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="icon"
          />
          <p className="temp">{Math.round(weather.main.temp)}°C</p>
          <p className="desc">{weather.weather[0].description}</p>

          {/* Details */}
          <div className="details">
            <div>
              <span>💧 Humidity</span>
              <div className="progress-bar">
                <div style={{ width: `${weather.main.humidity}%` }}></div>
              </div>
              <span>{weather.main.humidity}%</span>
            </div>
            <div>
              <span>🌬️ Wind</span>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(weather.wind.speed * 5, 100)}%` }}></div>
              </div>
              <span>{weather.wind.speed} m/s</span>
            </div>
            <div>
              <span>🌡️ Feels Like</span>
              <span className="value">{Math.round(weather.main.feels_like)}°C</span>
            </div>
            <div>
              <span>👁️ Visibility</span>
              <span className="value">{weather.visibility / 1000} km</span>
            </div>
          </div>

          {/* 5 Day Forecast */}
          {forecast.length > 0 && (
            <div className="forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {forecast.map((day, i) => (
                  <div key={i} className="forecast-card">
                    <p>{getDays(day.dt)}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt="icon"
                    />
                    <p>{Math.round(day.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;