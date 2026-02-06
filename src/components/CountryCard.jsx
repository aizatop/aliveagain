import React from 'react'

export default function CountryCard({ country, isExpanded, onToggle, onVideoClick }) {
  return (
    <div
      className={`country-card ${isExpanded ? 'expanded' : ''}`}
      onClick={() => onToggle()}
    >
      <div className="card-image-wrapper">
        <img
          src={country.image}
          alt={country.name}
          className="country-image"
        />
        <div className="overlay"></div>
        <a
          href={country.video}
          target="_blank"
          rel="noopener noreferrer"
          className="play-button"
          onClick={(e) => {
            e.stopPropagation()
            onVideoClick(country.name)
          }}
          title="Смотреть видео"
        >
          <span>▶</span>
        </a>
      </div>

      <div className="country-content">
        <h2 className="country-name">{country.name}</h2>
        
        {!isExpanded && (
          <p className="description-preview">{country.description.substring(0, 100)}...</p>
        )}

        {isExpanded && (
          <>
            <p className="description">{country.description}</p>
            
            <div className="attractions-section">
              <h3>✨ Главные достопримечательности:</h3>
              <ul className="attractions-list">
                {country.attractions.map((attraction, idx) => (
                  <li key={idx} className="attraction-item">
                    <span className="attraction-text">{attraction}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href={country.video}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-video-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onVideoClick(country.name)
                }}
              >
                🎥 Смотреть видео
              </a>
            </div>
          </>
        )}

        {!isExpanded && (
          <div className="card-footer">
            <span className="expand-hint">Нажмите, чтобы подробнее →</span>
          </div>
        )}
      </div>
    </div>
  )
}
