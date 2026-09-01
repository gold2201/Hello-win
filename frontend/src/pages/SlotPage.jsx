import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import mainSpinMusic from '../assets/sounds/mainSpinMusic.mp3';
import mainMusic from '../assets/sounds/mainMusic.mp3';
import spinMusic1 from '../assets/sounds/spinMusic1.mp3';
import spinMusic2 from '../assets/sounds/spinMusic2.mp3';
import spinMusic3 from '../assets/sounds/spinMusic3.mp3';
import spinMusic4 from '../assets/sounds/spinMusic4.mp3';
import spinMusic5 from '../assets/sounds/spinMusic5.mp3';
import spinMusic6 from '../assets/sounds/spinMusic6.mp3';
import spinMusic7 from '../assets/sounds/spinMusic7.mp3';

import cherry from '../assets/slot/cherry.png';
import lemon from '../assets/slot/lemon.png';
import bell from '../assets/slot/bell.png';
import diamond from '../assets/slot/diamond.png';
import seven from '../assets/slot/seven.png';

import tasksIcon from '../assets/homePageImage/tasks.png';
import giftIcon from '../assets/homePageImage/gift.png';
import bookIcon from '../assets/homePageImage/book.png';
import coinIcon from '../assets/homePageImage/coin.png';
import spinsIcon from '../assets/homePageImage/spins.png';
import soundOnIcon from '../assets/homePageImage/soundOn.png';
import soundOffIcon from '../assets/homePageImage/soundOff.png';
import nearName from '../assets/homePageImage/nearName.png';

const symbolToImage = {
  '🍒': cherry,
  '🍋': lemon,
  '🔔': bell,
  '💎': diamond,
  '7️': seven,
};

const SYMBOL_KEYS = Object.keys(symbolToImage);

function generateRandomMatrix() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)])
  );
}

function generateColumn() {
  return Array.from({ length: 4 }, () => SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)]);
}

function Confetti({ count = 30 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    backgroundColor: ['#ff69b4', '#ffd700', '#ff8c00', '#ff1493', '#00ffff'][Math.floor(Math.random() * 5)],
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${1.5 + Math.random() * 1.5}s`,
    transform: `scale(${Math.random() * 0.5 + 0.5})`,
    position: 'fixed',
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
            transform: style.transform,
          }}
        />
      ))}
    </>
  );
}

function SlotPage() {
  const [balance, setBalance] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [bet, setBet] = useState(5);
  const [columns, setColumns] = useState([
    generateColumn(),
    generateColumn(),
    generateColumn(),
    generateColumn(),
  ]);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState('');
  const [winAmount, setWinAmount] = useState(null);
  const [winningCells, setWinningCells] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [bigWin, setBigWin] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [lastWins, setLastWins] = useState([]);
  const navigate = useNavigate();
  const mainAudioRef = useRef(null);
  const spinSounds = [spinMusic1, spinMusic2, spinMusic3, spinMusic4, spinMusic5, spinMusic6, spinMusic7];

  // Фоновая музыка
  useEffect(() => {
    mainAudioRef.current = new Audio(mainMusic);
    mainAudioRef.current.volume = 0.3;
    mainAudioRef.current.loop = true;
    return () => {
      mainAudioRef.current.pause();
      mainAudioRef.current = null;
    };
  }, []);

  // Управление фоновой музыкой
  useEffect(() => {
    if (mainAudioRef.current) {
      if (soundOn) {
        mainAudioRef.current.play().catch(() => {});
      } else {
        mainAudioRef.current.pause();
      }
    }
  }, [soundOn]);

  const playRandomSpinSound = () => {
    if (!soundOn) return;
    const randomIndex = Math.floor(Math.random() * spinSounds.length);
    const audio = new Audio(spinSounds[randomIndex]);
    audio.volume = 1;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const fetchState = async () => {
      try {
        const [stateResponse, profileResponse, giftsResponse] = await Promise.all([
          api.get('/slot/state/'),
          api.get('/user/profile/'),
          api.get('/gifts/'),
        ]);
        setBalance(stateResponse.data.balance);
        setTotalSpins(stateResponse.data.total_spins);

        const wins = [...profileResponse.data.spin_history]
          .filter((spin) => spin.win_amount > 0)
          .sort((a, b) => b.win_amount - a.win_amount)
          .slice(0, 5);
        setLastWins(wins);

        setGifts(giftsResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else {
          setError('Не удалось загрузить состояние');
        }
      }
    };
    fetchState();
  }, [navigate]);

  const nextGift = gifts
    .filter((g) => g.is_active && g.required_spins > totalSpins)
    .sort((a, b) => a.required_spins - b.required_spins)[0];
  const progress = nextGift ? Math.min(100, (totalSpins / nextGift.required_spins) * 100) : 0;

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setError('');
    setWinAmount(null);
    setWinningCells(new Set());
    setShowConfetti(false);
    setBigWin(false);

    if (soundOn) {
      const mainSpinAudio = new Audio(mainSpinMusic);
      mainSpinAudio.volume = 0.9;
      mainSpinAudio.play().catch(() => {});
    }

    const intervals = [0, 1, 2, 3].map((colIdx) => {
      return setInterval(() => {
        setColumns((prev) => {
          const newCols = [...prev];
          newCols[colIdx] = generateColumn();
          return newCols;
        });
      }, 100);
    });

    try {
      const response = await api.post('/slot/spin/', { bet });

      setTimeout(() => {
        intervals.forEach(clearInterval);

        const finalMatrix = response.data.matrix;
        setColumns(finalMatrix);
        setBalance(response.data.balance);
        setTotalSpins(response.data.total_spins);
        setWinAmount(response.data.win_amount);

        const newWinningCells = new Set();
        let maxLength = 0;
        response.data.combinations.forEach((combo) => {
          maxLength = Math.max(maxLength, combo.length);
          if (combo.direction === 'horizontal') {
            for (let i = 0; i < combo.length; i++) {
              newWinningCells.add(combo.index * 4 + combo.start_index + i);
            }
          } else if (combo.direction === 'vertical') {
            for (let i = 0; i < combo.length; i++) {
              newWinningCells.add((combo.start_index + i) * 4 + combo.index);
            }
          }
        });
        setWinningCells(newWinningCells);

        if (response.data.win_amount > 0) {
          setShowConfetti(true);
          if (maxLength === 4) setBigWin(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }

        playRandomSpinSound();
        setSpinning(false);
      }, 3300);
    } catch (err) {
      intervals.forEach(clearInterval);
      setSpinning(false);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ошибка при вращении');
      }
    }
  };

  const flatMatrix = columns.flat();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {showConfetti && <Confetti count={40} />}

      {/* Гирлянда из изображений по краям */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 flex flex-col justify-around items-center opacity-50 select-none">
        <img src={nearName} alt="Бантик" className="w-16 h-16" />
        <img src={coinIcon} alt="Монеты" className="w-16 h-16" />
        <img src={cherry} alt="Вишня" className="w-16 h-16" />
        <img src={spinsIcon} alt="Спины" className="w-16 h-16" />
        <img src={giftIcon} alt="Подарок" className="w-16 h-16" />
        <img src={diamond} alt="Бриллиант" className="w-16 h-16" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 flex flex-col justify-around items-center opacity-50 select-none">
        <img src={giftIcon} alt="Подарок" className="w-16 h-16" />
        <img src={coinIcon} alt="Монеты" className="w-16 h-16" />
        <img src={diamond} alt="Бриллиант" className="w-16 h-16" />
        <img src={spinsIcon} alt="Спины" className="w-16 h-16" />
        <img src={cherry} alt="Вишня" className="w-16 h-16" />
        <img src={nearName} alt="Бантик" className="w-16 h-16" />
      </div>

      {/* Плавающие изображения */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <img src={spinsIcon} alt="Спины" className="absolute top-[120px] left-[200px] w-20 h-20 opacity-40 animate-float" />
        <img src={coinIcon} alt="Монеты" className="absolute top-[700px] left-[1600px] w-24 h-24 opacity-40 animate-float-delay" />
        <img src={spinsIcon} alt="Спины" className="absolute bottom-1/4 top-[770px] left-[290px] w-24 h-24 opacity-40 animate-float" />
        <img src={cherry} alt="Вишня" className="absolute top-[600px] left-[1400px] w-20 h-20 opacity-40 animate-float" />
        <img src={giftIcon} alt="Подарок" className="absolute top-[750px] left-[1300px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={diamond} alt="Бриллиант" className="absolute top-[60px] left-[900px] w-16 h-16 opacity-40 animate-float" />
        <img src={nearName} alt="Бантик" className="absolute top-[150px] left-[1300px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={coinIcon} alt="Монеты" className="absolute top-[500px] left-[1300px] w-16 h-16 opacity-40 animate-float" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-4">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/profile')}
            className="px-5 py-2 rounded-full border-2 border-pink-400 text-pink-500 font-semibold hover:bg-pink-100 transition-all text-lg"
          >
            ← Назад
          </button>
          <div className="flex gap-4">
            <div className="text-center bg-white/50 rounded-2xl px-5 py-2 backdrop-blur-sm flex items-center gap-2">
              <img src={coinIcon} alt="Монеты" className="w-24 h-24" />
              <div>
                <div className="text-3xl font-bold text-pink-500">{balance}</div>
                <div className="text-pink-400 text-base">HelloCoin</div>
              </div>
            </div>
            <div className="text-center bg-white/50 rounded-2xl px-5 py-2 backdrop-blur-sm flex items-center gap-2">
              <img src={spinsIcon} alt="Спины" className="w-16 h-16" />
              <div>
                <div className="text-3xl font-bold text-pink-500">{totalSpins}</div>
                <div className="text-pink-400 text-base">Спины</div>
              </div>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="bg-white/50 rounded-2xl px-4 py-2 backdrop-blur-sm"
              title={soundOn ? 'Выключить звук' : 'Включить звук'}
            >
              <img
                src={soundOn ? soundOnIcon : soundOffIcon}
                alt="Звук"
                className="w-20 h-20"
              />
            </button>
          </div>
        </div>

        {/* Анимированный заголовок */}
        <h1 className="text-center text-3xl font-extrabold text-pink-500 mb-3 animate-gradient-text">
          Испытай хомяков!
        </h1>

        {/* Прогресс-бар до подарка */}
        {nextGift && (
          <div className="bg-white/60 rounded-2xl p-4 mb-5 backdrop-blur-sm max-w-lg mx-auto">
            <div className="flex justify-between text-base text-pink-500 mb-2">
              <span>До подарка «{nextGift.name}»</span>
              <span>{totalSpins}/{nextGift.required_spins} спинов</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-3">
              <div
                className="bg-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Основная область: три колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr_1.2fr] gap-6 items-start">
          {/* Левая колонка: навигация и правила */}
          <div className="space-y-5">
            <Link
              to="/tasks"
              className="block bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <img src={tasksIcon} alt="Задания" className="w-20 h-20 mb-2" />
              <h3 className="text-xl font-bold text-pink-500">Закончился деп?</h3>
              <p className="text-base text-gray-600">Выполни задания и получи автододеп!</p>
            </Link>
            <Link
              to="/gifts"
              className="block bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <img src={giftIcon} alt="Подарки" className="w-20 h-20 mb-2" />
              <h3 className="text-xl font-bold text-pink-500">Накопил спины или HelloCoin?</h3>
              <p className="text-base text-gray-600">Забери свой подарок!</p>
            </Link>
            {/* Правила игры */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100">
              <button
                onClick={() => setShowRules(!showRules)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-xl font-bold text-pink-500 flex items-center gap-2">
                  <img src={bookIcon} alt="Книга" className="w-20 h-20" />
                  Правила хомячьего слота
                </span>
                <span className="text-pink-500 text-2xl">{showRules ? '−' : '+'}</span>
              </button>
              {showRules && (
                <div className="mt-3 text-base text-gray-600 space-y-2 leading-relaxed">
                  <p className="font-semibold text-pink-500">ДЕПАЙ! Собирай 2, 3 или 4 одинаковых хомяка в ряд или столбец.</p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <img src={cherry} alt="Вишня" className="w-10 h-10" />
                      : 2 — 0.05x, 3 — 0.4x, 4 — 1.5x
                    </p>
                    <p className="flex items-center gap-2">
                      <img src={lemon} alt="Лимон" className="w-10 h-10" />
                       : 2 — 0.10x, 3 — 0.8x, 4 — 2.0x
                    </p>
                    <p className="flex items-center gap-2">
                      <img src={bell} alt="Колокольчик" className="w-10 h-10" />
                       : 2 — 0.20x, 3 — 1.0x, 4 — 4.0x
                    </p>
                    <p className="flex items-center gap-2">
                      <img src={diamond} alt="Алмаз" className="w-10 h-10" />
                       : 2 — 0.30x, 3 — 1.2x, 4 — 8.0x
                    </p>
                    <p className="flex items-center gap-2">
                      <img src={seven} alt="Семёрка" className="w-10 h-10" />
                       : 2 — 0.50x, 3 — 2.0x, 4 — 15.0x
                    </p>
                  </div>
                  <p className="italic">Чем реже хомяк, тем жирнее хомяк!</p>
                </div>
              )}
            </div>
          </div>

          {/* Центральная колонка: слот и кнопки */}
          <div>
            <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-200 mb-5 ${bigWin ? 'animate-big-win' : ''}`}>
              <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
                {flatMatrix.length ? (
                  flatMatrix.map((symbol, idx) => {
                    const imageSrc = symbolToImage[symbol] || symbol;
                    return (
                      <div
                        key={idx}
                        className={`relative overflow-hidden flex items-center justify-center rounded-2xl aspect-square shadow-inner transition-all duration-300 ${
                          winningCells.has(idx)
                            ? 'bg-yellow-100 ring-4 ring-yellow-300'
                            : 'bg-pink-50'
                        }`}
                      >
                        <img
                          src={imageSrc}
                          alt={typeof symbol === 'string' ? symbol : 'symbol'}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-4 text-center text-pink-400">Загрузка...</div>
                )}
              </div>
              {winAmount !== null && (
                <div className="text-center mt-5 text-2xl font-bold text-pink-500 animate-fade-in-up flex items-center justify-center gap-2">
                  {winAmount > 0 ? (
                    <>
                      Выигрыш: {winAmount}
                      <img src={coinIcon} alt="Монеты" className="w-8 h-8" />
                    </>
                  ) : (
                    'Попробуй ещё раз!'
                  )}
                </div>
              )}
              {error && <div className="text-center mt-3 text-red-500 text-base">{error}</div>}
            </div>

            {/* Выбор ставки */}
            <div className="flex justify-center gap-3 mb-5">
              {[5, 10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setBet(value)}
                  disabled={spinning}
                  className={`px-6 py-2.5 rounded-full font-bold text-lg transition-all ${
                    bet === value
                      ? 'bg-pink-500 text-white shadow-lg scale-110'
                      : 'bg-white border-2 border-pink-300 text-pink-500 hover:bg-pink-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            {/* Кнопка крутить */}
            <div className="flex justify-center">
              <button
                onClick={handleSpin}
                disabled={spinning}
                className="px-12 py-4 rounded-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-all animate-pulse-soft inline-flex items-center justify-center gap-2"
              >
                <img src={spinsIcon} alt="Спины" className="w-12 h-12" />
                {spinning ? 'Крутим...' : 'Крутить'}
              </button>
            </div>
          </div>

          {/* Правая колонка: крупные выигрыши */}
          <div>
            {lastWins.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100">
                <h2 className="text-xl font-bold text-pink-500 mb-4">Топ заносов!</h2>
                <div className="space-y-3">
                  {lastWins.map((spin) => (
                    <div key={spin.id} className="flex justify-between items-center text-base">
                      <span className="text-gray-600">Ставка: {spin.bet}</span>
                      <span className="text-pink-500 font-semibold flex items-center gap-1">
                        +{spin.win_amount}
                        <img src={coinIcon} alt="Монеты" className="w-12 h-12" />
                      </span>
                      <span className="text-gray-400">
                        {new Date(spin.created_at).toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlotPage;
