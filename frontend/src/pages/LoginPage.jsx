import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('api/auth/login/', {
        username,
        password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/');
    } catch (err) {
      if (err.response) {
        setError('Неверный логин или пароль');
      } else {
        setError('Сетевая ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-200"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">💖</div>
          <h1 className="text-3xl font-bold text-pink-500">Hello Win</h1>
          <p className="text-pink-400 mt-1">Вход</p>
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
            placeholder="Введи ник"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-pink-600 font-medium mb-1">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/50 text-gray-800"
            placeholder="Введи пароль"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>

        <p className="text-center mt-4 text-pink-400">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-pink-500 font-semibold hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
