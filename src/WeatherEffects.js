import React, { useMemo } from 'react';

export default function WeatherEffects({ condition }) {
  if (!condition) return null;
  const cond = condition.toLowerCase();
  if (cond.includes('rain') || cond.includes('drizzle')) return <RainEffect />;
  if (cond.includes('snow')) return <SnowEffect />;
  if (cond.includes('thunderstorm')) return <ThunderEffect />;
  if (cond.includes('cloud')) return <CloudEffect />;
  if (cond.includes('clear')) return <SunEffect />;
  return null;
}

function RainEffect() {
  const drops = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 2}s`, duration: `${0.6 + Math.random() * 0.8}s`, opacity: 0.3 + Math.random() * 0.4, height: `${10 + Math.random() * 15}px` })), []);
  return (
    <div style={fx}>
      {drops.map(d => <div key={d.id} style={{ position: 'absolute', left: d.left, top: '-20px', width: '2px', height: d.height, background: 'linear-gradient(to bottom, transparent, rgba(174,214,241,0.7))', borderRadius: '2px', opacity: d.opacity, animation: `rain ${d.duration} ${d.delay} linear infinite` }} />)}
    </div>
  );
}

function SnowEffect() {
  const flakes = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 5}s`, duration: `${3 + Math.random() * 4}s`, size: `${8 + Math.random() * 14}px`, opacity: 0.5 + Math.random() * 0.4 })), []);
  return (
    <div style={fx}>
      {flakes.map(f => <div key={f.id} style={{ position: 'absolute', left: f.left, top: '-20px', fontSize: f.size, opacity: f.opacity, color: 'white', animation: `snow ${f.duration} ${f.delay} linear infinite` }}>❄</div>)}
    </div>
  );
}

function ThunderEffect() {
  const drops = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 1.5}s`, duration: `${0.3 + Math.random() * 0.4}s` })), []);
  return (
    <div style={fx}>
      {drops.map(d => <div key={d.id} style={{ position: 'absolute', left: d.left, top: '-20px', width: '2px', height: '20px', background: 'linear-gradient(to bottom, transparent, rgba(100,149,237,0.8))', animation: `rain ${d.duration} ${d.delay} linear infinite` }} />)}
      <div style={{ position: 'absolute', inset: 0, animation: 'lightning 4s ease infinite' }} />
    </div>
  );
}

function CloudEffect() {
  return (
    <div style={fx}>
      {[{ top: '5%', size: '90px', dur: '30s', delay: '0s' }, { top: '12%', size: '60px', dur: '45s', delay: '-12s' }, { top: '3%', size: '110px', dur: '55s', delay: '-25s' }].map((c, i) => (
        <div key={i} style={{ position: 'absolute', top: c.top, fontSize: c.size, opacity: 0.07, animation: `floatCloud ${c.dur} ${c.delay} linear infinite`, color: 'white' }}>☁</div>
      ))}
    </div>
  );
}

function SunEffect() {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, size: `${3 + Math.random() * 5}px`, delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s` })), []);
  return (
    <div style={fx}>
      {particles.map(p => <div key={p.id} style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, background: 'rgba(255,220,100,0.4)', borderRadius: '50%', animation: `dotPulse ${p.duration} ${p.delay} ease-in-out infinite` }} />)}
    </div>
  );
}

const fx = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' };
