import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import nearName from '../assets/homePageImage/nearName.png';
import coin from '../assets/homePageImage/coin.png';
import spins from '../assets/homePageImage/spins.png';
import cherry from '../assets/slot/cherry.png';
import diamond from '../assets/slot/diamond.png';
import placeholder from '../assets/homePageImage/soundOn.png';
import poorImage from '../assets/giftsPageImage/poorImage.png';

import paymentSuccess from '../assets/giftsPageSounds/paymentSuccess.mp3';
import paymentReject from '../assets/giftsPageSounds/paymentReject.mp3';
import coinIcon from "../assets/homePageImage/coin.png";
import spinsIcon from "../assets/homePageImage/spins.png";
import giftIcon from "../assets/homePageImage/gift.png";

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: Math.random() * 100,
    backgroundColor: ['#ff69b4', '#ffd700', '#ff8c00', '#ff1493', '#00ffff'][Math.floor(Math.random() * 5)],
    animationDelay: `${Math.random() * 1.5}s`,
    animationDuration: `${1.5 + Math.random() * 1.5}s`,
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

function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const successAudioRef = useRef(new Audio(paymentSuccess));
  const rejectAudioRef = useRef(new Audio(paymentReject));

  useEffect(() => {
    successAudioRef.current.volume = 1;
    rejectAudioRef.current.volume = 1;
  }, []);

  const fetchData = async () => {
    try {
      const [profileResponse, giftsResponse] = await Promise.all([
        api.get('/user/profile/'),
        api.get('/gifts/'),
      ]);
      setBalance(profileResponse.data.balance);
      setTotalSpins(profileResponse.data.total_spins);
      setGifts(giftsResponse.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Не удалось загрузить подарки');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedGifts = useMemo(() => {
    const arr = [...gifts];
    if (sortBy === 'price_asc') return arr.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return arr.sort((a, b) => b.price - a.price);
    if (sortBy === 'spins_asc') return arr.sort((a, b) => a.required_spins - b.required_spins);
    if (sortBy === 'spins_desc') return arr.sort((a, b) => b.required_spins - a.required_spins);
    return arr;
  }, [gifts, sortBy]);

  const topExpensive = useMemo(() => {
    return [...gifts]
      .sort((a, b) => b.price - a.price)
      .slice(0, 3)
      .map((g) => g.id);
  }, [gifts]);

  const openConfirm = (gift, paymentType) => {
    if (paymentType === 'currency' && balance < gift.price) {
      rejectAudioRef.current.play().catch(() => {});
      setModal({ type: 'poor' });
      return;
    }
    if (paymentType === 'spins' && totalSpins < gift.required_spins) {
      rejectAudioRef.current.play().catch(() => {});
      setModal({ type: 'poor' });
      return;
    }
    setModal({ type: 'confirm', gift, paymentType });
  };

  const closeModal = () => setModal(null);

  const handlePurchase = async () => {
    if (!modal || modal.type !== 'confirm') return;
    const { gift, paymentType } = modal;
    setError('');
    try {
      const response = await api.post(`/gifts/${gift.id}/buy/`, { payment_type: paymentType });
      successAudioRef.current.play().catch(() => {});
      setShowConfetti(true);
      setModal({ type: 'success', message: 'Подарок передан хомяку' });
      fetchData();
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      rejectAudioRef.current.play().catch(() => {});
      closeModal();
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ошибка при покупке');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 text-xl">
        Загружаем...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100">
      {showConfetti && <Confetti />}

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
        <img src={coinIcon} alt="Монеты" className="absolute top-[900px] left-[1580px] w-24 h-24 opacity-40 animate-float-delay" />
        <img src={spinsIcon} alt="Спины" className="absolute top-[770px] left-[150px] w-24 h-24 opacity-40 animate-float" />
        <img src={cherry} alt="Вишня" className="absolute top-[400px] left-[1620px] w-20 h-20 opacity-40 animate-float" />
        <img src={giftIcon} alt="Подарок" className="absolute top-[550px] left-[1550px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={diamond} alt="Бриллиант" className="absolute top-[60px] left-[900px] w-16 h-16 opacity-40 animate-float" />
        <img src={nearName} alt="Бантик" className="absolute top-[150px] left-[1600px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={coinIcon} alt="Монеты" className="absolute top-[500px] left-[190px] w-16 h-16 opacity-40 animate-float" />
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
              <img src={coin} alt="Монеты" className="w-24 h-24" />
              <div>
                <div className="text-2xl font-bold text-pink-500">{balance}</div>
                <div className="text-pink-400">HelloCoin</div>
              </div>
            </div>
            <div className="text-center bg-white/50 rounded-2xl px-5 py-2 backdrop-blur-sm flex items-center gap-2">
              <img src={spins} alt="Спины" className="w-14 h-14" />
              <div>
                <div className="text-2xl font-bold text-pink-500">{totalSpins}</div>
                <div className="text-pink-400">Спины</div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-pink-500 text-center mb-4">Магазин подарков</h1>

        {/* Сортировка */}
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setSortBy('default')} className={`px-4 py-2 rounded-full text-sm font-semibold ${sortBy === 'default' ? 'bg-pink-500 text-white' : 'bg-white border-2 border-pink-300 text-pink-500'}`}>По умолчанию</button>
          <button onClick={() => setSortBy('price_asc')} className={`px-4 py-2 rounded-full text-sm font-semibold ${sortBy === 'price_asc' ? 'bg-pink-500 text-white' : 'bg-white border-2 border-pink-300 text-pink-500'}`}>Дешевле</button>
          <button onClick={() => setSortBy('price_desc')} className={`px-4 py-2 rounded-full text-sm font-semibold ${sortBy === 'price_desc' ? 'bg-pink-500 text-white' : 'bg-white border-2 border-pink-300 text-pink-500'}`}>Дороже</button>
          <button onClick={() => setSortBy('spins_asc')} className={`px-4 py-2 rounded-full text-sm font-semibold ${sortBy === 'spins_asc' ? 'bg-pink-500 text-white' : 'bg-white border-2 border-pink-300 text-pink-500'}`}>Меньше спинов</button>
          <button onClick={() => setSortBy('spins_desc')} className={`px-4 py-2 rounded-full text-sm font-semibold ${sortBy === 'spins_desc' ? 'bg-pink-500 text-white' : 'bg-white border-2 border-pink-300 text-pink-500'}`}>Больше спинов</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {sortedGifts.length === 0 ? (
          <p className="text-center text-pink-400 text-xl">Ваш админ пока не добавил подарки</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGifts.map((gift) => {
              const soldOut = gift.quantity === 0;
              const isTop = topExpensive.includes(gift.id) && gift.price > 0;
              return (
                <div
                  key={gift.id}
                  className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 flex flex-col animate-fade-in-up ${
                    soldOut ? 'opacity-100 grayscale' : ''
                  }`}
                >
                  {isTop && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ✨ Особый подарок
                    </div>
                  )}
                  {soldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                      <span className="text-3xl font-extrabold text-red-500 rotate-[-15deg] bg-white/80 px-4 py-2 rounded-xl">
                        Продано
                      </span>
                    </div>
                  )}
                  <div className="w-full h-40 flex items-center justify-center mb-4">
                    <img
                      src={gift.image_url || placeholder}
                      alt={gift.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-pink-500">{gift.name}</h2>
                  <p className="text-gray-600 text-sm mt-1 flex-1">{gift.description}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>Цена: <span className="font-semibold">{gift.price} HelloCoin</span></p>
                    <p>Спины для бесплатного: <span className="font-semibold">{gift.required_spins}</span></p>
                    <p>Осталось: <span className="font-semibold">{gift.quantity}</span></p>
                  </div>
                  {!soldOut && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => openConfirm(gift, 'currency')}
                        className="w-full py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
                      >
                        Купить за HelloCoin
                      </button>
                      <button
                        onClick={() => openConfirm(gift, 'spins')}
                        className="w-full py-2 rounded-xl bg-white border-2 border-pink-300 text-pink-500 font-semibold hover:bg-pink-50 transition"
                      >
                        Получить за спины
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl text-center">
            {modal.type === 'poor' ? (
              <>
                <img src={poorImage} alt="Нет денег" className="w-30 h-30 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-pink-500 mb-2">Депай, депай квартиру сука</h2>
                <button onClick={closeModal} className="px-6 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Депнуть хату</button>
              </>
            ) : modal.type === 'confirm' ? (
              <>
                <h2 className="text-2xl font-bold text-pink-500 mb-4">Подтверждение</h2>
                <p className="text-gray-700 mb-6">
                  {modal.paymentType === 'currency'
                    ? `Купить «${modal.gift.name}» за ${modal.gift.price} HelloCoin?`
                    : `Получить «${modal.gift.name}» за спины?`}
                </p>
                <div className="flex gap-4 justify-center">
                  <button onClick={handlePurchase} className="px-6 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Да</button>
                  <button onClick={closeModal} className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Отмена</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-pink-500 mb-4">Ты просто босс, просто начальник!</h2>
                <p className="text-gray-700 mb-6">{modal.message}</p>
                <button onClick={closeModal} className="px-6 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Депать дальше</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftsPage;
