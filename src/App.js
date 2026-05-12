import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';
import WeatherEffects from './components/WeatherEffects';
import SkeletonLoader from './components/SkeletonLoader';
import ShareCard from './components/ShareCard';
import { translations } from './translations/translations';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

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
  const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [activeTab, setActiveTab] = useState('today');
  const [listening, setListening] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const t = translations[lang];
  const langOptions = [
    { code: 'en', label: '🇺🇸 EN' },
    { code: 'hi', label: '🇮🇳 HI' },
    { code: 'mr', label: '🇮🇳 MR' },
    { code: 'ta', label: '🇮🇳 TA' },
  ];

  // Auto detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      });
    }
  }, []);

  const fetchByCoords = async (lat, lon) => {
    setLoading(true); setError('');
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      ]);
      const wData = await wRes.json();
      const fData = await fRes.json();
      if (wData.cod === 200) { setWeather(wData); processForecasts(fData.list); }
    } catch { setError('Something went wrong!'); }
    setLoading(false);
  };

  const fetchWeather = async (searchCity = city) => {
    if (!searchCity.trim()) return;
    setLoading(true); setError('');
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`)
      ]);
      const wData = await wRes.json();
      const fData = await fRes.json();
      if (wData.cod !== 200) {
        setError(t.cityNotFound); setWeather(null); setForecast([]); setHourly([]);
      } else {
        setWeather(wData);
        processForecasts(fData.list);
        // Save to search history
        const newEntry = { city: wData.name, temp: Math.round(wData.main.temp), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = [newEntry, ...searchHistory.filter(h => h.city !== wData.name)].slice(0, 6);
        setSearchHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        // Send push notification if enabled
        if (notifEnabled && Notification.permission === 'granted') {
          new Notification(`SkyCast — ${wData.name}`, {
            body: `🌡️ ${Math.round(wData.main.temp)}°C | ${wData.weather[0].description}`,
            icon: `https://openweathermap.org/img/wn/${wData.weather[0].icon}.png`
          });
        }
      }
    } catch { setError('Something went wrong!'); }
    setLoading(false);
  };

  const processForecasts = (list) => {
    setForecast(list.filter((_, i) => i % 8 === 0).slice(0, 5));
    setHourly(list.slice(0, 8));
  };

  // Push Notifications
  const toggleNotifications = async () => {
    if (!('Notification' in window)) { alert('Notifications not supported!'); return; }
    if (Notification.permission === 'granted') {
      setNotifEnabled(!notifEnabled);
      if (!notifEnabled) alert(t.notifEnabled);
    } else {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') { setNotifEnabled(true); alert(t.notifEnabled); }
      else { alert(t.notifDenied); }
    }
  };

  // Voice Search
  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice search not supported!'); return; }
    const recognition = new SR();
    recognition.lang = lang === 'hi' || lang === 'mr' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-US';
    recognition.start(); setListening(true);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      const cityName = spoken.replace(/weather in |weather of |mausam |ka mausam/gi, '').trim();
      setCity(cityName); fetchWeather(cityName); setListening(false);
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
    if (cond.includes('clear') && temp > 30) tips.push({ icon: '🧴', text: t.tips.sunscreen });
    if (cond.includes('thunderstorm')) tips.push({ icon: '🏠', text: t.tips.stayIndoors });
    if (humidity > 80) tips.push({ icon: '💨', text: t.tips.humid });
    if (temp < 10) tips.push({ icon: '🧣', text: t.tips.cold });
    if (cond.includes('clear') && temp >= 20 && temp <= 30) tips.push({ icon: '🏃', text: t.tips.outdoor });
    return tips.slice(0, 3);
  };

  const getBackground = () => {
    if (!weather) return darkMode ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' : 'linear-gradient(135deg, #e8f4fd 0%, #d1e8f5 100%)';
    const main = weather.weather[0].main.toLowerCase();
    const gradients = {
      dark: { rain: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', drizzle: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', clear: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', clouds: 'linear-gradient(135deg, #232526, #414345)', snow: 'linear-gradient(135deg, #1a1a2e, #2c3e6b)', thunderstorm: 'linear-gradient(135deg, #0d0d0d, #1a0a2e)' },
      light: { rain: 'linear-gradient(135deg, #4a6fa5, #7f8c8d)', drizzle: 'linear-gradient(135deg, #4a6fa5, #7f8c8d)', clear: 'linear-gradient(135deg, #f7971e, #ffd200)', clouds: 'linear-gradient(135deg, #bdc3c7, #95a5a6)', snow: 'linear-gradient(135deg, #e0eafc, #cfdef3)', thunderstorm: 'linear-gradient(135deg, #4b4b4b, #2c2c2c)' }
    };
    const theme = darkMode ? gradients.dark : gradients.light;
    for (const key of Object.keys(theme)) { if (main.includes(key)) return theme[key]; }
    return darkMode ? 'linear-gradient(135deg, #0d1117, #161b22)' : 'linear-gradient(135deg, #e8f4fd, #d1e8f5)';
  };

  const formatTime = (dt) => new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatHour = (dt) => new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const getDayName = (dt) => {
    const days = { hi: ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'], mr: ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'], ta: ['ஞாயி','திங்','செவ்','புத','வியா','வெள்','சனி'], en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] };
    return (days[lang] || days.en)[new Date(dt * 1000).getDay()];
  };

  const chartData = hourly.map(h => ({ time: formatHour(h.dt), temp: Math.round(h.main.temp), humidity: h.main.humidity }));
  const historyChartData = searchHistory.map(h => ({ city: h.city, temp: h.temp }));
  const suggestions = getAISuggestions();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`} style={{ background: getBackground() }}>
      {weather && <WeatherEffects condition={weather.weather[0].main} />}

      {/* Header */}
      <header className="header">
        <h1 className="app-title">⛅ SkyCast</h1>
        <div className="header-controls">
          {/* Language Selector */}
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
            {langOptions.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button className="notif-btn" onClick={toggleNotifications} title={t.notifications}>
            {notifEnabled ? '🔔' : '🔕'}
          </button>
          <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <input type="text" placeholder={t.searchPlaceholder} value={city}
            onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchWeather()} />
          <button className="voice-btn" onClick={startVoiceSearch}>{listening ? '🔴' : '🎤'}</button>
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
              {fav}<span className="fav-remove" onClick={e => { e.stopPropagation(); toggleFavorite(fav); }}>✕</span>
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
                <p className="date">{new Date().toLocaleDateString(lang === 'hi' || lang === 'mr' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="card-top-actions">
                <button className={`fav-btn ${favorites.includes(weather.name) ? 'active' : ''}`} onClick={() => toggleFavorite(weather.name)}>
                  {favorites.includes(weather.name) ? '❤️' : '🤍'}
                </button>
              </div>
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
              {[
                { icon: '💧', label: t.humidity, value: `${weather.main.humidity}%`, bar: weather.main.humidity },
                { icon: '🌬️', label: t.wind, value: `${weather.wind.speed} m/s`, bar: Math.min(weather.wind.speed * 5, 100) },
                { icon: '👁️', label: t.visibility, value: `${(weather.visibility / 1000).toFixed(1)} km` },
                { icon: '🔵', label: t.pressure, value: `${weather.main.pressure} hPa` },
              ].map((d, i) => (
                <div key={i} className="detail-item">
                  <span className="detail-icon">{d.icon}</span>
                  <span className="detail-label">{d.label}</span>
                  {d.bar !== undefined && <div className="progress-bar"><div style={{ width: `${d.bar}%` }}></div></div>}
                  <span className="detail-value">{d.value}</span>
                </div>
              ))}
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
                  <div className="sun-ball" style={{ left: `${Math.min(Math.max(((Date.now() / 1000 - weather.sys.sunrise) / (weather.sys.sunset - weather.sys.sunrise)) * 100, 0), 100)}%` }}>☀️</div>
                </div>
              </div>
              <div className="sun-item">
                <span className="sun-icon">🌇</span>
                <span className="sun-label">{t.sunset}</span>
                <span className="sun-time">{formatTime(weather.sys.sunset)}</span>
              </div>
            </div>

            {/* Share Button */}
            <ShareCard weather={weather} darkMode={darkMode} />
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="ai-card glass">
              <h3>🧠 {t.aiSuggestions}</h3>
              <div className="tips-grid">
                {suggestions.map((tip, i) => (
                  <div key={i} className="tip-item"><span className="tip-icon">{tip.icon}</span><span>{tip.text}</span></div>
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

          {/* Hourly */}
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
          {activeTab === 'charts' && (
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
                  <XAxis dataKey="time" tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                  <YAxis tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: darkMode ? '#1a1a2e' : '#fff', border: 'none', borderRadius: '10px' }} />
                  <Area type="monotone" dataKey="temp" stroke="#e94560" fill="url(#tempGrad)" name="Temp °C" />
                </AreaChart>
              </ResponsiveContainer>

              <h3 style={{ marginTop: '20px' }}>💧 {t.humidityChart}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                  <YAxis tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: darkMode ? '#1a1a2e' : '#fff', border: 'none', borderRadius: '10px' }} />
                  <Bar dataKey="humidity" fill="#4fc3f7" radius={[6, 6, 0, 0]} name="Humidity %" />
                </BarChart>
              </ResponsiveContainer>

              {/* History Chart */}
              {historyChartData.length > 1 && (
                <>
                  <h3 style={{ marginTop: '20px' }}>🏙️ {t.historyChart}</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={historyChartData}>
                      <XAxis dataKey="city" tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                      <YAxis tick={{ fill: darkMode ? '#aaa' : '#555', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: darkMode ? '#1a1a2e' : '#fff', border: 'none', borderRadius: '10px' }} />
                      <Bar dataKey="temp" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Temp °C" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          )}

          {/* Map */}
          {activeTab === 'map' && (
            <div className="map-section glass">
              <h3>🗺️ {t.radarMap}</h3>
              <div className="map-container">
                <iframe title="Weather Map"
                  src={`https://openweathermap.org/weathermap?basemap=map&cities=true&layer=precipitation&lat=${weather.coord.lat}&lon=${weather.coord.lon}&zoom=8`}
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '12px' }} />
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
