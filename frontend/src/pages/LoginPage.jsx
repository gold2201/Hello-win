import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

// Импорт изображений
import nearName from '../assets/homePageImage/nearName.png';
import coin from '../assets/homePageImage/coin.png';
import spins from '../assets/homePageImage/spins.png';
import tasks from '../assets/homePageImage/tasks.png';
import gift from '../assets/homePageImage/gift.png';
import cherry from '../assets/slot/cherry.png';
import diamond from '../assets/slot/diamond.png';
import showPasswordIcon from '../assets/authPage/showPassword.png';
import hidePasswordIcon from '../assets/authPage/hidePassword.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('auth/login/', {
        username,
        password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/profile');
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100 flex items-center justify-center p-4">
      {/* Плавающие картинки */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <img src={coin} alt="Монеты" className="absolute top-[120px] left-[100px] w-24 h-24 opacity-40 animate-float" />
        <img src={spins} alt="Спины" className="absolute top-[240px] left-[350px] w-20 h-20 opacity-40 animate-float-delay" />
        <img src={tasks} alt="Задания" className="absolute top-[500px] left-[250px] w-16 h-16 opacity-40 animate-float" />
        <img src={gift} alt="Подарок" className="absolute top-[800px] left-[300px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={cherry} alt="Вишня" className="absolute top-[120px] left-[1400px] w-16 h-16 opacity-40 animate-float" />
        <img src={diamond} alt="Бриллиант" className="absolute top-[280px] left-[1700px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={nearName} alt="Бантик" className="absolute top-[480px] left-[1550px] w-16 h-16 opacity-40 animate-float" />
        <img src={coin} alt="Монеты" className="absolute top-[800px] left-[1600px] w-24 h-24 opacity-40 animate-float-delay" />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-200 ${error ? 'animate-shake' : 'animate-fade-in-up'}`}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={nearName} alt="Логотип" className="w-10 h-10" />
            <h1 className="text-3xl font-extrabold text-pink-500">Hello Win</h1>
          </div>
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
            placeholder="Главное чтобы не Кирилл Комок"
            required
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="block text-pink-600 font-medium mb-1">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/50 text-gray-800 pr-12"
              placeholder="Хомяк следит за паролем"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <img
                src={showPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                className="w-10 h-10"
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg animate-pulse-soft"
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
