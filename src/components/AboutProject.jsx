import React from 'react'

export default function AboutProject() {
  const features = [
    {
      icon: '🌍',
      title: 'Глобальные путешествия',
      description: 'Исследуйте самые красивые и интересные места нашей планеты, не выходя из дома'
    },
    {
      icon: '🥽',
      title: 'VR Технология',
      description: 'Полная погруженность в виртуальный мир с использованием передовых технологий'
    },
    {
      icon: '👥',
      title: 'Сообщество',
      description: 'Общайтесь с друзьями со всего мира и делитесь своими впечатлениями'
    },
    {
      icon: '🎓',
      title: 'Обучение',
      description: 'Узнавайте интересные факты об истории, культуре и географии стран'
    }
  ]



  return (
    <section className="about-project">
      <div className="about-container">
        {/* Header */}
        <div className="about-header">
          <div className="header-badge">О нашем проекте</div>
          <h2>AliveAgain</h2>
          <p className="about-subtitle">Путешествия без границ, возможности без ограничений</p>
        </div>

        {/* Main Content */}
        <div className="about-main">
          {/* Left Section */}
          <div className="about-left">
            <div className="about-card">
              <h3>Наша миссия</h3>
              <p className="mission-text">
                <strong>AliveAgain</strong> - это глобальный проект, разработанный для детей с ограниченной мобильностью. Мы верим, что каждый ребенок должен иметь возможность путешествовать по миру, раскрывать его красоту и богатство культурного наследия.
              </p>
              <p className="mission-text">
                С помощью передовых технологий виртуальной реальности мы создали платформу, которая позволяет пользователям совершать честные, захватывающие путешествия, общаться с единомышленниками и расширять свои горизонты.
              </p>
            </div>

          </div>

          {/* Right Section - Features Grid */}
          <div className="about-right">
            <div className="features-grid">
              {features.map((feature, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
