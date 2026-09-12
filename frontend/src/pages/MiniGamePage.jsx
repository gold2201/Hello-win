import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Изображения
import img20 from '../assets/minigamePage/20_img.png';
import img40 from '../assets/minigamePage/40_img.png';
import img60 from '../assets/minigamePage/60_img.png';
import img80 from '../assets/minigamePage/80_img.png';
import img100 from '../assets/minigamePage/100_img.png';

import coinIcon from '../assets/homePageImage/coin.png';
import spinsIcon from '../assets/homePageImage/spins.png';
import bookIcon from '../assets/homePageImage/book.png';
import cherry from '../assets/slot/cherry.png';
import diamond from '../assets/slot/diamond.png';
import coin from "../assets/homePageImage/coin.png";
import spins from "../assets/homePageImage/spins.png";
import gift from "../assets/homePageImage/gift.png";
import lemon from "../assets/slot/lemon.png";
import bell from "../assets/slot/bell.png";
import seven from "../assets/slot/seven.png";
import tasks from "../assets/homePageImage/tasks.png";
import nearName from '../assets/homePageImage/nearName.png';

// Звуки
import tapSound from '../assets/sounds/tap_sound.mp3';
import miniGameWinSound from '../assets/sounds/miniGameWin.mp3';

const TAP_IMAGES = [
  { count: 20, image: img20, size: 240, color: 'bg-green-400' },
  { count: 40, image: img40, size: 320, color: 'bg-green-700' },
  { count: 60, image: img60, size: 400, color: 'bg-yellow-400' },
  { count: 80, image: img80, size: 480, color: 'bg-orange-400' },
  { count: 100, image: img100, size: 560, color: 'bg-red-500' },
];

function MiniGamePage() {
  const [balance, setBalance] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [tapTexts, setTapTexts] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [rewardGiven, setRewardGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const tapAudioRef = useRef(new Audio(tapSound));
  const winAudioRef = useRef(new Audio(miniGameWinSound));

  useEffect(() => {
    tapAudioRef.current.volume = 0.8;
    winAudioRef.current.volume = 1;
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile/');
        setBalance(response.data.balance);
        setTotalSpins(response.data.total_spins);
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

  const currentStage = () => {
    if (tapCount > 80) return TAP_IMAGES[4];
    if (tapCount > 60) return TAP_IMAGES[3];
    if (tapCount > 40) return TAP_IMAGES[2];
    if (tapCount > 20) return TAP_IMAGES[1];
    return TAP_IMAGES[0];
  };

  const handleTap = async () => {
    if (gameFinished) return;

    tapAudioRef.current.play().catch(() => {});

    const newCount = tapCount + 1;
    setTapCount(newCount);

    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 300);

    const id = Date.now() + Math.random();
    const x = Math.random() * 60 + 20;
    const y = Math.random() * 40 + 20;
    setTapTexts((prev) => [...prev, { id, x, y, text: 'FISTING!' }]);
    setTimeout(() => {
      setTapTexts((prev) => prev.filter((item) => item.id !== id));
    }, 800);

    if (newCount >= 100) {
      setGameFinished(true);
      winAudioRef.current.play().catch(() => {});
      if (!rewardGiven) {
        try {
          await api.post('/user/minigame-reward/');
          const profileResponse = await api.get('/user/profile/');
          setBalance(profileResponse.data.balance);
          setRewardGiven(true);
        } catch (err) {
          setError('Награда не зачислена: эндпоинт отсутствует');
        }
      }
    }
  };

  const handleReset = () => {
    setTapCount(0);
    setGameFinished(false);
    setRewardGiven(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 text-xl">
        Загружаем...
      </div>
    );
  }

  const current = currentStage();
  const progressPercent = Math.min(100, (tapCount / 100) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {tapTexts.map((item) => (
        <span
          key={item.id}
          className="tap-text"
          style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: '28px' }}
        >
          {item.text}
        </span>
      ))}

      <div className="pointer-events-none absolute inset-0 select-none">
        <img src={coin} alt="Монеты" className="absolute top-[120px] left-[100px] w-24 h-24 opacity-40 animate-float" />
        <img src={spins} alt="Спины" className="absolute top-[240px] left-[1300px] w-20 h-20 opacity-40 animate-float-delay" />
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Шапка: кнопка слева, баланс/спины справа */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="px-8 py-3 rounded-full border-2 border-pink-400 text-pink-500 text-xl font-semibold hover:bg-pink-100 transition-all"
          >
            ← Назад
          </button>
          <div className="flex gap-6 items-center">
            <div className="text-center bg-white/50 rounded-2xl px-6 py-3 backdrop-blur-sm flex items-center gap-3">
              <img src={coinIcon} alt="Монеты" className="w-16 h-16" />
              <div>
                <div className="text-3xl font-bold text-pink-500">{balance}</div>
                <div className="text-lg text-pink-400">HelloCoin</div>
              </div>
            </div>
            <div className="text-center bg-white/50 rounded-2xl px-6 py-3 backdrop-blur-sm flex items-center gap-3">
              <img src={spinsIcon} alt="Спины" className="w-16 h-16" />
              <div>
                <div className="text-3xl font-bold text-pink-500">{totalSpins}</div>
                <div className="text-lg text-pink-400">Спинов</div>
              </div>
            </div>
          </div>
        </div>

        {/* Основная область: слева прогресс-бар, по центру игра */}
        <div className="flex items-start justify-between">
          {/* Вертикальный прогресс-бар */}
          <div className="h-[70vh] w-10 bg-pink-100 rounded-full overflow-hidden relative ml-8">
            <div
              className={`absolute bottom-0 left-0 w-full ${current.color} transition-all duration-300`}
              style={{ height: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Игровое поле */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-extrabold text-pink-500 text-center mb-6">Фистилка</h1>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            {!gameFinished ? (
              <>
                <p className="text-xl text-pink-400 mb-4">
                  Фистов: {tapCount} / 100
                </p>
                <button
                  onClick={handleTap}
                  className="focus:outline-none"
                  disabled={loading}
                >
                  <img
                    src={current.image}
                    alt="Тапалка"
                    style={{ width: current.size, height: current.size }}
                    className={`object-contain ${isJumping ? 'animate-jump-once' : ''}`}
                  />
                </button>
              </>
            ) : (
              <div className="text-center mt-8">
                <img src={img100} alt="Победа" className="w-85 h-85 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-pink-500 mb-4">Довольны?!</h2>
                <p className="text-2xl text-gray-700 mb-2">Вы нафистили на 100 HelloCoins!</p>
                <p className="text-lg text-gray-500 mb-6">Был отвищен 100 раз</p>
                <button
                  onClick={handleReset}
                  className="px-12 py-4 rounded-full bg-pink-500 text-white text-2xl font-bold hover:bg-pink-600 transition shadow-lg"
                >
                  Депать дальше
                </button>
              </div>
            )}
          </div>

          {/* Пустой блок для симметрии */}
          <div className="w-24"></div>
        </div>
      </div>
    </div>
  );
}

export default MiniGamePage;
