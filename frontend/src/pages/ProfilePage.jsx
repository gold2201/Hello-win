import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

// Импорт изображений
import nearName from '../assets/homePageImage/nearName.png';
import coin from '../assets/homePageImage/coin.png';
import spins from '../assets/homePageImage/spins.png';
import tasks from '../assets/homePageImage/tasks.png';
import gift from '../assets/homePageImage/gift.png';
import cherry from '../assets/slot/cherry.png';
import lemon from '../assets/slot/lemon.png';
import bell from '../assets/slot/bell.png';
import diamond from '../assets/slot/diamond.png';
import seven from '../assets/slot/seven.png';
import bookIcon from '../assets/homePageImage/book.png';


function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile/');
        const sortedHistory = [...response.data.spin_history].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProfile({ ...response.data, spin_history: sortedHistory });
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

  const totalPages = Math.ceil(profile.spin_history.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSpins = profile.spin_history.slice(startIndex, startIndex + pageSize);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      <div className="pointer-events-none absolute inset-0 select-none">
        <img src={coin} alt="Монеты" className="absolute top-[120px] left-[100px] w-24 h-24 opacity-40 animate-float" />
        <img src={spins} alt="Спины" className="absolute top-[240px] left-[300px] w-20 h-20 opacity-40 animate-float-delay" />
        <img src={diamond} alt="Бриллиант" className="absolute top-[400px] left-[180px] w-20 h-20 opacity-40 animate-float" />
        <img src={gift} alt="Подарок" className="absolute top-[580px] left-[350px] w-20 h-20 opacity-40 animate-float-delay" />
        <img src={cherry} alt="Вишня" className="absolute top-[700px] left-[120px] w-16 h-16 opacity-40 animate-float" />
        <img src={lemon} alt="Лимон" className="absolute top-[850px] left-[300px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={bell} alt="Колокольчик" className="absolute top-[120px] left-[1700px] w-16 h-16 opacity-40 animate-float" />
        <img src={seven} alt="Семёрка" className="absolute top-[270px] left-[1600px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={nearName} alt="Бантик" className="absolute top-[500px] left-[1500px] w-16 h-16 opacity-40 animate-float" />
        <img src={tasks} alt="Задания" className="absolute top-[700px] left-[1650px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={bookIcon} alt="Книга" className="absolute top-[850px] left-[1400px] w-16 h-16 opacity-40 animate-float" />
        <img src={gift} alt="Подарок" className="absolute top-[900px] left-[1600px] w-16 h-16 opacity-40 animate-float-delay" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Шапка профиля */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={nearName} alt="Логотип" className="w-14 h-14" />
            <div>
              <h1 className="text-3xl font-extrabold text-pink-500">Привет, {profile.username}!</h1>
              <p className="text-pink-400">Начинаем наше лудоприключение в Hello Win</p>
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
            <img src={coin} alt="Монеты" className="w-24 h-24 mx-auto mb-2" />
            <div className="text-3xl font-bold text-pink-500">{profile.balance}</div>
            <div className="text-pink-400">HelloCoin</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-pink-100">
            <img src={spins} alt="Спины" className="w-24 h-24 mx-auto mb-2" />
            <div className="text-3xl font-bold text-pink-500">{profile.total_spins}</div>
            <div className="text-pink-400">Спинов</div>
          </div>
        </div>

        {/* Кнопки навигации */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/slot"
            className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105 text-center flex flex-col items-center gap-2"
          >
            <img src={spins} alt="Играть" className="w-12 h-12" />
            Депать
          </Link>
          <Link
            to="/gifts"
            className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105 text-center flex flex-col items-center gap-2"
          >
            <img src={gift} alt="Подарки" className="w-12 h-12" />
            Магазин подарков
          </Link>
          <Link
            to="/tasks"
            className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-105 text-center flex flex-col items-center gap-2"
          >
            <img src={tasks} alt="Задания" className="w-12 h-12" />
            Бесплатные додепы
          </Link>
        </div>

        {/* История спинов с пагинацией */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">История спинов</h2>
          {profile.spin_history.length === 0 ? (
            <p className="text-pink-400">Пока нет ни одного спина</p>
          ) : (
            <>
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
                    {currentSpins.map((spin) => (
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
              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-full border border-pink-300 text-pink-500 disabled:opacity-50 hover:bg-pink-50 transition"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-full font-semibold transition ${
                        currentPage === page
                          ? 'bg-pink-500 text-white'
                          : 'border border-pink-300 text-pink-500 hover:bg-pink-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-full border border-pink-300 text-pink-500 disabled:opacity-50 hover:bg-pink-50 transition"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
