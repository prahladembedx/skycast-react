import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Generate climate stats from 5-day forecast + seasonal estimates
export function generateClimateStats(forecast, weather) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const currentTemp = weather?.main?.temp || 25;
  const lat = weather?.coord?.lat || 0;

  // Generate realistic monthly data based on current temp and latitude
  const isNorthern = lat >= 0;
  const seasonOffset = isNorthern ? 0 : 6;

  const monthlyData = months.map((month, i) => {
    const monthIndex = (i + seasonOffset) % 12;
    const seasonalVariation = Math.sin((monthIndex / 12) * Math.PI * 2) * 10;
    const temp = Math.round(currentTemp + seasonalVariation - 5);
    const rainfall = Math.round(50 + Math.sin((monthIndex / 12) * Math.PI * 2 + Math.PI) * 30 + Math.random() * 20);
    return { month, temp: Math.max(-10, temp), rainfall: Math.max(5, rainfall) };
  });

  return monthlyData;
}

export default function ClimateStats({ forecast, weather }) {
  if (!weather) return null;
  const data = generateClimateStats(forecast, weather);
  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="climate-card">
      <h3>📈 Monthly Climate Statistics</h3>
      <p className="climate-subtitle">Estimated annual pattern for {weather.name}</p>

      <h4 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>🌡️ Avg Temperature (°C)</h4>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '10px', fontSize: '0.85rem' }} />
          <Line type="monotone" dataKey="temp" stroke="#e94560" strokeWidth={2} dot={(props) => {
            const { cx, cy, index } = props;
            return index === currentMonthIdx
              ? <circle key={index} cx={cx} cy={cy} r={6} fill="#e94560" stroke="white" strokeWidth={2} />
              : <circle key={index} cx={cx} cy={cy} r={3} fill="#e94560" />;
          }} name="Temp °C" />
        </LineChart>
      </ResponsiveContainer>

      <h4 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>🌧️ Avg Rainfall (mm)</h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '10px', fontSize: '0.85rem' }} />
          <Bar dataKey="rainfall" name="Rainfall mm"
            fill="#4fc3f7"
            radius={[4, 4, 0, 0]}
            label={false}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="climate-note">* Data estimated based on current conditions & seasonal patterns</p>
    </div>
  );
}
