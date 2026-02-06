import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, getCurrentUser } from '../services/supabase'
import '../styles/auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    country: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await getCurrentUser()
    if (user) {
      navigate('/home')
    }
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Заполните все поля')
      }

      const result = await signIn(loginData.email, loginData.password)

      if (result.success) {
        setSuccess('✅ Вход успешен! Перенаправление...')
        setTimeout(() => navigate('/home'), 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      let errorMessage = err.message
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль'
      }
      setError(`❌ ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { username, email, password, passwordConfirm } = registerData

      if (!username || !email || !password || !passwordConfirm) {
        throw new Error('Заполните все обязательные поля')
      }

      if (username.length < 3) {
        throw new Error('Имя пользователя должно быть минимум 3 символа')
      }

      if (!email.includes('@')) {
        throw new Error('Введите корректный email')
      }

      if (password.length < 8) {
        throw new Error('Пароль должен быть минимум 8 символов')
      }

      if (password !== passwordConfirm) {
        throw new Error('Пароли не совпадают')
      }

      const result = await signUp(email, password, username)

      if (result.success) {
        setSuccess('✅ Аккаунт создан! Проверьте email для подтверждения.')
        setTimeout(() => setIsLogin(true), 3000)
        setRegisterData({ username: '', email: '', password: '', passwordConfirm: '', country: '' })
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      let errorMessage = err.message
      if (errorMessage.includes('already registered')) {
        errorMessage = 'Этот email уже зарегистрирован'
      }
      setError(`❌ ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">AliveAgain</h1>
          <p className="auth-tagline">Путешествуй по миру виртуально</p>
        </div>

        {isLogin ? (
          <div className="auth-form active">
            <h2>Вход в систему</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Пароль</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Вход...' : 'Войти'}
              </button>
            </form>

            <div className="form-footer">
              <p>Нет аккаунта?{' '}
                <a href="#" onClick={() => {
                  setIsLogin(false)
                  setError('')
                  setSuccess('')
                }}>
                  Зарегистрироваться
                </a>
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        ) : (
          <div className="auth-form active">
            <h2>Создать аккаунт</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="register-username">Имя пользователя</label>
                <input
                  type="text"
                  id="register-username"
                  name="username"
                  placeholder="Ваше имя"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="your@email.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Пароль</label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  placeholder="Минимум 8 символов"
                  minLength="8"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password-confirm">Подтвердите пароль</label>
                <input
                  type="password"
                  id="register-password-confirm"
                  name="passwordConfirm"
                  placeholder="Повторите пароль"
                  minLength="8"
                  value={registerData.passwordConfirm}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-country">Страна (опционально)</label>
                <input
                  type="text"
                  id="register-country"
                  name="country"
                  placeholder="Ваша страна"
                  value={registerData.country}
                  onChange={handleRegisterChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="form-footer">
              <p>Уже есть аккаунт?{' '}
                <a href="#" onClick={() => {
                  setIsLogin(true)
                  setError('')
                  setSuccess('')
                }}>
                  Войти
                </a>
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        )}
      </div>

      <div className="auth-info">
        <div className="info-item">
          <span className="info-icon">🌍</span>
          <h3>Виртуальные путешествия</h3>
          <p>Посещай любые страны мира без ограничений</p>
        </div>
        <div className="info-item">
          <span className="info-icon">👥</span>
          <h3>Социальная сеть</h3>
          <p>Общайся с друзьями со всего мира</p>
        </div>
        <div className="info-item">
          <span className="info-icon">🥽</span>
          <h3>VR Опыт</h3>
          <p>Полная иммерсия в виртуальную реальность</p>
        </div>
      </div>
    </div>
  )
}
