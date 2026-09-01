import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Изображения
import coin from '../assets/homePageImage/coin.png';
import spins from '../assets/homePageImage/spins.png';
import tasks from '../assets/homePageImage/tasks.png';
import gift from '../assets/homePageImage/gift.png';
import nearName from '../assets/homePageImage/nearName.png';
import diamond from "../assets/slot/diamond.png";
import cherry from "../assets/slot/cherry.png";
import lemon from "../assets/slot/lemon.png";
import bell from "../assets/slot/bell.png";
import seven from "../assets/slot/seven.png";
import bookIcon from "../assets/homePageImage/book.png";

// Звук отправки
import sendReqMusic from '../assets/sounds/sendReqMusic.mp3';

function MiniConfetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * 100,
    backgroundColor: ['#ff69b4', '#ffd700', '#ff8c00', '#ff1493', '#00ffff'][Math.floor(Math.random() * 5)],
    animationDelay: `${Math.random() * 0.5}s`,
    animationDuration: `${0.8 + Math.random() * 0.8}s`,
  }));

  return (
    <>
      {pieces.map((style, idx) => (
        <div
          key={idx}
          className="confetti"
          style={{
            left: `${style.left}%`,
            background: style.backgroundColor,
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
          }}
        />
      ))}
    </>
  );
}

function TaskClientPage() {
  const [tasksList, setTasksList] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const sendSoundRef = useRef(new Audio(sendReqMusic));

  useEffect(() => {
    sendSoundRef.current.volume = 0.8;
  }, []);

  const fetchData = async () => {
    try {
      const [profileResponse, tasksResponse, requestsResponse] = await Promise.all([
        api.get('/user/profile/'),
        api.get('/tasks/'),
        api.get('/tasks/my-requests/'),
      ]);
      setBalance(profileResponse.data.balance);
      setTotalSpins(profileResponse.data.total_spins);
      setTasksList(tasksResponse.data);
      setUserRequests(requestsResponse.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Не удалось загрузить данные');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedByReward = useMemo(() => {
    return [...tasksList].sort((a, b) => b.reward - a.reward);
  }, [tasksList]);

  const topIds = useMemo(() => {
    return sortedByReward.slice(0, 2).map((t) => t.id);
  }, [sortedByReward]);

  const popularId = useMemo(() => {
    return sortedByReward.length > 2 ? sortedByReward[2].id : null;
  }, [sortedByReward]);

  const pendingTaskIds = useMemo(() => {
    return new Set(
      userRequests
        .filter((req) => req.status === 'pending')
        .map((req) => req.task)
    );
  }, [userRequests]);

  const handleSubmitTask = async (taskId) => {
    setError('');
    sendSoundRef.current.play().catch(() => {});
    setModal({ type: 'sending' });

    try {
      await api.post('/tasks/request/', { task_id: taskId });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      fetchData();
    } catch (err) {
      setModal(null);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ошибка при отправке запроса');
      }
    }
  };

  const closeModal = () => setModal(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 text-xl">
        Загружаем...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {showConfetti && <MiniConfetti />}

      {/* Плавающие картинки */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="px-5 py-2 rounded-full border-2 border-pink-400 text-pink-500 font-semibold hover:bg-pink-100 transition-all"
          >
            ← Назад
          </button>
          <div className="flex gap-6 items-center">
            <div className="text-center bg-white/50 rounded-2xl px-5 py-2 backdrop-blur-sm flex items-center gap-2">
              <img src={coin} alt="Монеты" className="w-12 h-12" />
              <div>
                <div className="text-2xl font-bold text-pink-500">{balance}</div>
                <div className="text-pink-400">HelloCoin</div>
              </div>
            </div>
            <div className="text-center bg-white/50 rounded-2xl px-5 py-2 backdrop-blur-sm flex items-center gap-2">
              <img src={spins} alt="Спины" className="w-12 h-12" />
              <div>
                <div className="text-2xl font-bold text-pink-500">{totalSpins}</div>
                <div className="text-pink-400">Спины</div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-pink-500 text-center mb-6">Задания</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {tasksList.length === 0 ? (
          <p className="text-center text-pink-400 text-xl">Ваш админ пока не добавил задания</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksList.map((task) => {
              const isPending = pendingTaskIds.has(task.id);
              const isTop = topIds.includes(task.id);
              const isPopular = popularId === task.id;
              return (
                <div
                  key={task.id}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 flex flex-col animate-fade-in-up"
                >
                  {isTop && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      В топе
                    </div>
                  )}
                  {isPopular && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Популярно
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-pink-500">{task.title}</h2>
                  <p className="text-gray-600 text-sm mt-2 flex-1">{task.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-pink-500 font-semibold flex items-center gap-1">
                      Додеп: {task.reward}
                      <img src={coin} alt="Монеты" className="w-8 h-8" />
                    </span>
                    {isPending ? (
                      <span className="px-5 py-2 rounded-xl bg-gray-300 text-gray-600 font-semibold cursor-not-allowed">
                        Ожидает подтверждения
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSubmitTask(task.id)}
                        className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
                      >
                        Выполнить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl text-center">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">Запрос отправлен</h2>
            <p className="text-gray-700 mb-6">Ваш админ проверяет сладость...</p>
            <button
              onClick={closeModal}
              className="px-6 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskClientPage;
