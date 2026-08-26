import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('auth/register/', {
        username,
        password,
        password_confirm: passwordConfirm,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/profile');
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const messages = Object.entries(data)
            .map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
              return `${key}: ${value}`;
            })
            .join('; ');
          setError(messages);
        } else {
          setError('Ошибка регистрации');
        }
      } else {
        setError('Сетевая ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100 flex items-center justify-center p-4">
      {/* Плавающие эмодзи */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <span className="absolute top-20 right-20 text-4xl opacity-30 animate-float">🎁</span>
        <span className="absolute top-1/3 left-24 text-5xl opacity-30 animate-float-delay">💝</span>
        <span className="absolute bottom-1/4 right-32 text-4xl opacity-20 animate-float">✨</span>
        <span className="absolute bottom-20 left-20 text-3xl opacity-30 animate-float-delay">🎀</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-200 ${error ? 'animate-shake' : 'animate-fade-in-up'}`}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-2 animate-bounce-slow">🎀</div>
          <h1 className="text-3xl font-extrabold text-pink-500">Hello Win</h1>
          <p className="text-pink-400 mt-1">Регистрация</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-pink-600 font-medium mb-1">Никнейм</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/50 text-gray-800"
            placeholder="Придумай ник"
            required
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="block text-pink-600 font-medium mb-1">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/50 text-gray-800 pr-12"
              placeholder="Минимум 8 символов"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-pink-600 font-medium mb-1">Подтверждение пароля</label>
          <div className="relative">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/50 text-gray-800 pr-12"
              placeholder="Повтори пароль"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
            >
              {showPasswordConfirm ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg animate-pulse-soft"
        >
          {loading ? 'Создаём...' : 'Зарегистрироваться'}
        </button>

        <p className="text-center mt-4 text-pink-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-pink-500 font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
