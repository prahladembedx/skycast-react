import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';
import WeatherEffects from './components/WeatherEffects';
import SkeletonLoader from './components/SkeletonLoader';
import { translations } from './translations/translations';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY; // 🔑 

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('en');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favCities') || '[]'));
  const [activeTab, setActiveTab] = useState('today');
  const [listening, setListening] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const t = translations[lang];

  // Auto detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchByCoords(latitude, longitude);
      });
    }
  }, []);

  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      ]);
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      if (weatherData.cod === 200) {
        setWeather(weatherData);
        processForecasts(forecastData.list);
      }
    } catch { setError('Something went wrong!'); }
    setLoading(false);
  };

  const fetchWeather = async (searchCity = city) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError('');
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`)
      ]);
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      if (weatherData.cod !== 200) {
        setError(t.cityNotFound);
        setWeather(null);
        setForecast([]);
        setHourly([]);
      } else {
        setWeather(weatherData);
        processForecasts(forecastData.list);
      }
    } catch { setError('Something went wrong!'); }
    setLoading(false);
  };

  const processForecasts = (list) => {
    // 5-day daily
    const daily = list.filter((_, i) => i % 8 === 0).slice(0, 5);
    setForecast(daily);
    // 24-hour hourly
    setHourly(list.slice(0, 8));
  };

  // Voice Search
  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice search not supported in this browser!'); return; }
    const recognition = new SR();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.start();
    setListening(true);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      const cityName = spoken.replace(/weather in |weather of |mausam |ka mausam/gi, '').trim();
      setCity(cityName);
      fetchWeather(cityName);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  // Favorites
  const toggleFavorite = (cityName) => {
    const updated = favorites.includes(cityName)
      ? favorites.filter(c => c !== cityName)
      : [...favorites, cityName];
    setFavorites(updated);
    localStorage.setItem('favCities', JSON.stringify(updated));
  };

  // AI Suggestions
  const getAISuggestions = () => {
    if (!weather) return [];
    const temp = weather.main.temp;
    const cond = weather.weather[0].main.toLowerCase();
    const humidity = weather.main.humidity;
    const tips = [];
    if (cond.includes('rain') || cond.includes('drizzle')) tips.push({ icon: '☔', text: t.tips.umbrella });
    if (cond.includes('snow')) tips.push({ icon: '🧥', text: t.tips.warmClothes });
    if (cond.includes('clear') && temp > 35) tips.push({ icon: '🥤', text: t.tips.hydrate });
    if (cond.includes('clear') && temp > 30) tips.push({ icon: '🕶️', text: t.tips.sunscreen });
    if (cond.includes('thunderstorm')) tips.push({ icon: '🏠', text: t.tips.stayIndoors });
    if (humidity > 80) tips.push({ icon: '💨', text: t.tips.humid });
    if (temp < 10) tips.push({ icon: '🧣', text: t.tips.cold });
    if (cond.includes('clear') && temp >= 20 && temp <= 30) tips.push({ icon: '🏃', text: t.tips.outdoor });
    return tips.slice(0, 3);
  };

  const getBackground = () => {
    if (!weather) return darkMode
      ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
      : 'linear-gradient(135deg, #e8f4fd 0%, #d1e8f5 100%)';
    const main = weather.weather[0].main.toLowerCase();
    const gradients = {
      dark: {
        rain: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        drizzle: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        clear: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        clouds: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        snow: 'linear-gradient(135deg, #1a1a2e 0%, #2c3e6b 100%)',
        thunderstorm: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 100%)',
      },
      light: {
        rain: 'linear-gradient(135deg, #4a6fa5 0%, #7f8c8d 100%)',
        drizzle: 'linear-gradient(135deg, #4a6fa5 0%, #7f8c8d 100%)',
        clear: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        clouds: 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
        snow: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        thunderstorm: 'linear-gradient(135deg, #4b4b4b 0%, #2c2c2c 100%)',
      }
    };
    const theme = darkMode ? gradients.dark : gradients.light;
    for (const key of Object.keys(theme)) {
      if (main.includes(key)) return theme[key];
    }
    return darkMode
      ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
      : 'linear-gradient(135deg, #e8f4fd 0%, #d1e8f5 100%)';
  };

  const formatTime = (dt) => {
    return new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatHour = (dt) => {
    return new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getDayName = (dt) => {
    const days = lang === 'hi'
      ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dt * 1000).getDay()];
  };

  const chartData = hourly.map(h => ({
    time: formatHour(h.dt),
    temp: Math.round(h.main.temp),
    humidity: h.main.humidity,
    feels: Math.round(h.main.feels_like),
  }));

  const suggestions = getAISuggestions();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`} style={{ background: getBackground() }}>
      {weather && <WeatherEffects condition={weather.weather[0].main} />}

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">⛅ {t.appTitle}</h1>
        </div>
        <div className="header-controls">
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇺🇸 English'}
          </button>
          <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
          />
          <button className="voice-btn" onClick={startVoiceSearch} title="Voice Search">
            {listening ? '🔴' : '🎤'}
          </button>
          <button className="search-btn" onClick={() => fetchWeather()}>{t.search}</button>
        </div>
        {listening && <p className="listening-text">🎤 {t.listening}</p>}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="favorites-bar">
          <span className="fav-label">❤️ {t.favorites}:</span>
          {favorites.map(fav => (
            <button key={fav} className="fav-chip" onClick={() => { setCity(fav); fetchWeather(fav); }}>
              {fav}
              <span className="fav-remove" onClick={e => { e.stopPropagation(); toggleFavorite(fav); }}>✕</span>
            </button>
          ))}
        </div>
      )}

      {loading && <SkeletonLoader />}
      {error && <div className="error-msg">❌ {error}</div>}

      {weather && !loading && (
        <div className="content">
          {/* Main Weather Card */}
          <div className="weather-card glass">
            <div className="card-top">
              <div className="city-info">
                <h2>{weather.name}, {weather.sys.country}</h2>
                <p className="date">{new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button
                className={`fav-btn ${favorites.includes(weather.name) ? 'active' : ''}`}
                onClick={() => toggleFavorite(weather.name)}
                title={favorites.includes(weather.name) ? t.removeFav : t.addFav}
              >
                {favorites.includes(weather.name) ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="main-weather">
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} alt="icon" className="weather-icon-big" />
              <div className="temp-section">
                <span className="temp-main">{Math.round(weather.main.temp)}°C</span>
                <span className="weather-desc">{weather.weather[0].description}</span>
                <span className="feels-like">{t.feelsLike}: {Math.round(weather.main.feels_like)}°C</span>
                <div className="temp-range">
                  <span>↑ {Math.round(weather.main.temp_max)}°</span>
                  <span>↓ {Math.round(weather.main.temp_min)}°</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-icon">💧</span>
                <span className="detail-label">{t.humidity}</span>
                <div className="progress-bar"><div style={{ width: `${weather.main.humidity}%` }}></div></div>
                <span className="detail-value">{weather.main.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🌬️</span>
                <span className="detail-label">{t.wind}</span>
                <div className="progress-bar"><div style={{ width: `${Math.min(weather.wind.speed * 5, 100)}%` }}></div></div>
                <span className="detail-value">{weather.wind.speed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👁️</span>
                <span className="detail-label">{t.visibility}</span>
                <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🔵</span>
                <span className="detail-label">{t.pressure}</span>
                <span className="detail-value">{weather.main.pressure} hPa</span>
              </div>
            </div>

            {/* Sunrise Sunset */}
            <div className="sun-section">
              <div className="sun-item">
                <span className="sun-icon">🌅</span>
                <span className="sun-label">{t.sunrise}</span>
                <span className="sun-time">{formatTime(weather.sys.sunrise)}</span>
              </div>
              <div className="sun-arc">
                <div className="sun-track">
                  <div className="sun-ball" style={{
                    left: `${Math.min(Math.max(((Date.now() / 1000 - weather.sys.sunrise) / (weather.sys.sunset - weather.sys.sunrise)) * 100, 0), 100)}%`
                  }}>☀️</div>
                </div>
              </div>
              <div className="sun-item">
                <span className="sun-icon">🌇</span>
                <span className="sun-label">{t.sunset}</span>
                <span className="sun-time">{formatTime(weather.sys.sunset)}</span>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="ai-card glass">
              <h3>🧠 {t.aiSuggestions}</h3>
              <div className="tips-grid">
                {suggestions.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <span className="tip-icon">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs glass">
            {['today', 'forecast', 'charts', 'map'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'today' ? `⏱️ ${t.hourly}` : tab === 'forecast' ? `📅 ${t.forecast}` : tab === 'charts' ? `📈 ${t.charts}` : `🗺️ ${t.map}`}
              </button>
            ))}
          </div>

          {/* Hourly Forecast */}
          {activeTab === 'today' && (
            <div className="hourly-section glass">
              <div className="hourly-scroll">
                {hourly.map((h, i) => (
                  <div key={i} className="hourly-card">
                    <span className="hourly-time">{formatHour(h.dt)}</span>
                    <img src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`} alt="" />
                    <span className="hourly-temp">{Math.round(h.main.temp)}°C</span>
                    <span className="hourly-rain">💧{h.main.humidity}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5 Day Forecast */}
          {activeTab === 'forecast' && (
            <div className="forecast-section glass">
              {forecast.map((day, i) => (
                <div key={i} className="forecast-row">
                  <span className="forecast-day">{getDayName(day.dt)}</span>
                  <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="" />
                  <span className="forecast-desc">{day.weather[0].description}</span>
                  <div className="forecast-temps">
                    <span className="temp-high">↑{Math.round(day.main.temp_max)}°</span>
                    <span className="temp-low">↓{Math.round(day.main.temp_min)}°</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {activeTab === 'charts' && chartData.length > 0 && (
            <div className="charts-section glass">
              <h3>🌡️ {t.tempChart}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e94560" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: darkMode ? '#1a1a2e' : '#fff', border: 'none', borderRadius: '10px' }} />
                  <Area type="monotone" dataKey="temp" stroke="#e94560" fill="url(#tempGrad)" name="Temp °C" />
                </AreaChart>
              </ResponsiveContainer>

              <h3 style={{ marginTop: '20px' }}>💧 {t.humidityChart}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: darkMode ? '#1a1a2e' : '#fff', border: 'none', borderRadius: '10px' }} />
                  <Bar dataKey="humidity" fill="#4fc3f7" radius={[6, 6, 0, 0]} name="Humidity %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weather Map */}
          {activeTab === 'map' && (
            <div className="map-section glass">
              <h3>🗺️ {t.radarMap}</h3>
              <div className="map-container">
                <iframe
                  title="Weather Map"
                  src={`https://openweathermap.org/weathermap?basemap=map&cities=true&layer=precipitation&lat=${weather.coord.lat}&lon=${weather.coord.lon}&zoom=8`}
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '12px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>Made with ❤️ by prahladembedx | Powered by OpenWeatherMap</p>
      </footer>
    </div>
  );
}
