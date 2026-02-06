import React from 'react'

export default function Header({ onLogout, userName }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">🌍</span>
          <span className="brand-text">AliveAgain</span>
        </div>

        <div className="nav-menu">
          <a href="#japan" className="nav-link">🇯🇵 Япония</a>
          <a href="#france" className="nav-link">🇫🇷 Франция</a>
          <a href="#italy" className="nav-link">🇮🇹 Италия</a>
          <a href="#united-kingdom" className="nav-link">🇬🇧 Британия</a>
        </div>

        <div className="nav-right">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-email">{userName?.split('@')[0] || 'User'}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            Выход
          </button>
        </div>
      </div>
    </nav>
  )
}
