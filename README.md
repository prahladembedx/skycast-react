# ⛅ Weather App

A feature-rich, modern weather application built with **React.js** that provides real-time weather data, forecasts, interactive charts, voice search, and much more — all wrapped in a stunning glassmorphism UI with animated weather effects.

---

## 🌐 Live Demo
👉 [SkyCast - Live](https://prahladembedx.github.io/skycast-react/)
---

## ✨ Features

### 🔍 Core
- 📍 **Auto Location Detection** — Opens with your city's weather automatically
- 🔎 **City Search** — Search any city worldwide
- 🌡️ **Current Weather** — Temperature, feels like, min/max, description
- 💧 **Humidity & Wind** — Visual progress bars
- 👁️ **Visibility & Pressure** — Detailed atmospheric data

### 📅 Forecasts
- ⏱️ **Hourly Forecast** — Next 24 hours with horizontal scroll cards
- 📅 **5-Day Forecast** — Daily high/low with weather icons

### 📈 Charts
- 🌡️ **Temperature Chart** — Area chart for next 24 hours
- 💧 **Humidity Chart** — Bar chart for next 24 hours
- Powered by **Recharts** library

### 🎨 UI & Animations
- 🌧️ **Rain Animation** — Falling raindrops effect
- ❄️ **Snow Animation** — Floating snowflakes
- ⚡ **Thunderstorm Animation** — Lightning flash effect
- ☁️ **Cloud Animation** — Moving clouds
- ✨ **Sunny Particles** — Golden glowing particles
- 🌅 **Sunrise & Sunset** — Animated sun position tracker
- 🌈 **Dynamic Background** — Changes based on weather condition
- 💎 **Glassmorphism UI** — Modern frosted glass design

### 🤖 Smart Features
- 🧠 **AI Weather Suggestions** — Smart tips like "Carry umbrella", "Stay hydrated"
- 🎤 **Voice Search** — Speak city name to search (English & Hindi)
- ❤️ **Favorite Cities** — Save and quickly access your cities
- ⚡ **Skeleton Loading UI** — Smooth animated placeholders while loading

### 🌐 More
- 🌐 **Hindi / English Toggle** — Full bilingual support
- 🌙 **Dark / Light Mode** — Auto-smooth theme switching
- 🗺️ **Weather Radar Map** — Live precipitation map
- 📱 **PWA Ready** — Installable as a mobile app
- 📱 **Fully Responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React.js** | Frontend framework |
| **OpenWeatherMap API** | Real-time weather data |
| **Recharts** | Temperature & humidity charts |
| **Web Speech API** | Voice search |
| **CSS3 Animations** | Weather effects |
| **localStorage** | Saving favorite cities |
| **Geolocation API** | Auto location detection |

---

## 📁 Project Structure

```
weather-app/
├── public/
│   ├── index.html
│   └── manifest.json          # PWA config
├── src/
│   ├── App.js                 # Main component
│   ├── App.css                # All styles
│   ├── index.js               # Entry point
│   ├── components/
│   │   ├── WeatherEffects.js  # Rain/Snow/Thunder animations
│   │   └── SkeletonLoader.js  # Loading skeleton UI
│   └── translations/
│       └── translations.js    # English & Hindi text
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or above
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org))

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

**2. Install dependencies**
```bash
npm install
npm install recharts
```

**3. Add your API key**

Open `src/App.js` and replace on line 6:
```javascript
const API_KEY = "your_api_key_here";
```

**4. Run the app**
```bash
npm start
```

App will open at `http://localhost:3000` 🎉

---

## 📸 Screenshots

![Home Screen](public/Screenshot1.png)
![Sunny Particles](public/Screenshot2.png)
![Charts](public/Screenshot3.png)
![Map](public/Screenshot4.png)

---

## 🌍 API Used

- [OpenWeatherMap Current Weather API](https://openweathermap.org/current)
- [OpenWeatherMap Forecast API](https://openweathermap.org/forecast5)
- [OpenWeatherMap Weather Maps](https://openweathermap.org/api/weathermaps)

---

## 🔮 Future Plans

- [ ] Push Notifications for severe weather alerts
- [ ] Weather history graph
- [ ] Share weather card on social media
- [ ] More language support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m "Add AmazingFeature"`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by **prahladembedx**

⭐ Star this repo if you found it helpful!

</div>
