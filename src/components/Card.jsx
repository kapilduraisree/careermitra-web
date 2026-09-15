import React from 'react'

export function Card({ children, className = '', onClick, style }) {
  return (
    <div
      className={`card ${className} ${onClick ? 'card-clickable' : ''}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}

export function Badge({ children, color = 'blue' }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

export function DemoBadge() {
  return <span className="badge badge-orange" style={{ fontSize: 10 }}>DEMO</span>
}

export function MatchScore({ score }) {
  const color = score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'
  return <span className={`badge badge-${color}`}>Match: {score}%</span>
}

export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}

export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

export function ProgressBar({ value, color = 'var(--primary)', height = 8 }) {
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: color, height }} />
    </div>
  )
}
