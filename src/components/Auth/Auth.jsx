import React, { useState } from 'react'
import api from '../../api/axiosConfig'
import './auth.css'

const Auth = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isLogin ? '/login' : '/register'
      const response = await api.post(endpoint, { email, password })
      if (isLogin) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userEmail', response.data.email)
        onAuth(response.data.email)
      } else {
        setIsLogin(true)
        setError('')
        setSuccess('Account created! Please sign in.')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="auth__header">
          <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p>{isLogin ? 'Sign in to access your tasks.' : 'Sign up to start managing your tasks.'}</p>
        </div>

        {success && <div className="auth__message auth__message--success">{success}</div>}
        {error && <div className="auth__message auth__message--error">{error}</div>}

        <div className="auth__field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="auth__field">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth__button" type="submit" disabled={loading}>
          {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign in' : 'Create account')}
        </button>

        <div className="auth__toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Auth
