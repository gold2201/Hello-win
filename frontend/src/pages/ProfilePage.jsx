import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile/');
        setProfile(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else {
          setError('Не удалось загрузить профиль');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 text-xl">
        Загружаем...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {/* Плавающие эмодзи */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <span className="absolute top-20 left-10 text-3xl opacity-20 animate-float">💰</span>
        <span className="absolute top-1/3 right-16 text-4xl opacity-20 animate-float-delay">🎰</span>
        <span className="absolute bottom-1/4 left-16 text-4xl opacity-20 animate-float">💖</span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Шапка профиля */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎀</span>
            <div>
              <h1 className="text-3xl font-extrabold text-pink-500">Привет, {profile.username}!</h1>
              <p className="text-pink-400">Добро пожаловать в Hello Win</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-full border-2 border-pink-400 text-pink-500 font-semibold hover:bg-pink-100 transition-all"
          >
            Выйти
          </button>
        </div>

        {/* Баланс и спины */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-pink-100">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-pink-500">{profile.balance}</div>
            <div className="text-pink-400">Монет</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-pink-100">
            <div className="text-4xl mb-2">🎰</div>
            <div className="text-3xl font-bold text-pink-500">{profile.total_spins}</div>
            <div className="text-pink-400">Спинов</div>
          </div>
        </div>

        {/* Кнопки навигации */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105">
            🎰 Играть
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105">
            🎁 Магазин подарков
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105">
            📋 Задания
          </button>
        </div>

        {/* История спинов */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">История спинов</h2>
          {profile.spin_history.length === 0 ? (
            <p className="text-pink-400">Пока нет ни одного спина</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-pink-400 border-b border-pink-100">
                    <th className="py-2">Ставка</th>
                    <th className="py-2">Выигрыш</th>
                    <th className="py-2">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.spin_history.map((spin) => (
                    <tr key={spin.id} className="border-b border-pink-50">
                      <td className="py-2 text-gray-700">{spin.bet}</td>
                      <td className="py-2 text-gray-700">{spin.win_amount}</td>
                      <td className="py-2 text-gray-700">
                        {new Date(spin.created_at).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
