import { Link } from 'react-router-dom';

// Импорт изображений
import nearName from '../assets/homePageImage/nearName.png';
import coin from '../assets/homePageImage/coin.png';
import spins from '../assets/homePageImage/spins.png';
import tasks from '../assets/homePageImage/tasks.png';
import gift from '../assets/homePageImage/gift.png';

import diamond from '../assets/slot/diamond.png';
import cherry from "../assets/slot/cherry.png";




function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col">
      {/* Плавающие картинки */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <img src={coin} alt="Монеты" className="absolute top-[120px] left-[100px] w-24 h-24 opacity-40 animate-float" />
        <img src={spins} alt="Спины" className="absolute top-[240px] left-[350px] w-20 h-20 opacity-40 animate-float-delay" />
        <img src={tasks} alt="Задания" className="absolute top-[500px] left-[250px] w-16 h-16 opacity-40 animate-float" />
        <img src={gift} alt="Подарок" className="absolute top-[800px] left-[200px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={cherry} alt="Вишня" className="absolute top-[120px] left-[1400px] w-16 h-16 opacity-40 animate-float" />
        <img src={diamond} alt="Бриллиант" className="absolute top-[280px] left-[1700px] w-16 h-16 opacity-40 animate-float-delay" />
        <img src={nearName} alt="Бантик" className="absolute top-[480px] left-[1550px] w-16 h-16 opacity-40 animate-float" />
        <img src={coin} alt="Монеты" className="absolute top-[800px] left-[1600px] w-24 h-24 opacity-40 animate-float-delay" />
      </div>

      {/* Шапка */}
      <header className="relative z-10 flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-2">
          <img src={nearName} alt="Логотип" className="w-16 h-16" />
          <span className="text-3xl font-extrabold text-pink-500">Hello Win</span>
        </div>
        <nav className="flex gap-3">
          <Link
            to="/login"
            className="px-7 py-2.5 rounded-full border-2 border-pink-400 text-pink-500 text-lg font-semibold hover:bg-pink-100 transition-all duration-300 hover:scale-105"
          >
            Войти
          </Link>
          <Link
            to="/register"
            className="px-7 py-2.5 rounded-full bg-pink-500 text-white text-lg font-semibold hover:bg-pink-600 hover:scale-105 transition-all duration-300 shadow-md"
          >
            Регистрация
          </Link>
        </nav>
      </header>

      {/* Hero-секция */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-10 py-6 flex-1">
        <img src={spins} alt="Слот-машина" className="w-24 h-24 mb-3 animate-bounce-slow" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-500 mb-2">
          Депни в казино…<br />и выиграй еще больше додепа
          <img src={coin} alt="Монеты" className="w-24 h-24 inline-block" />
        </h1>
        <p className="text-lg md:text-xl text-pink-400 max-w-2xl mb-6">
          Депай в задания, депай в слот, додепай в подарки и получай мегадодепы
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/profile"
            className="px-8 py-3 rounded-full bg-pink-500 text-white text-lg font-bold shadow-lg hover:bg-pink-600 hover:scale-105 transition-all duration-300 animate-pulse-soft"
          >
            Начать депать
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-white border-2 border-pink-300 text-pink-500 text-lg font-bold shadow-md hover:bg-pink-50 hover:scale-105 transition-all duration-300"
          >
            У меня уже есть куда депнуть
          </Link>
        </div>
      </section>

      {/* Как это работает */}
      <section className="relative z-10 px-10 pb-6">
        <h2 className="text-3xl font-bold text-pink-500 text-center mb-4">
          Как это работает
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Карточка 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <img src={spins} alt="Играть" className="w-20 h-20 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-pink-500 mb-1">Депай</h3>
            <p className="text-base text-gray-600">
              Депай в слот-машину и получай HelloCoin за выигрышных хомяков.
            </p>
          </div>
          {/* Карточка 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <img src={tasks} alt="Задания" className="w-20 h-20 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-pink-500 mb-1">Делай додеп</h3>
            <p className="text-base text-gray-600">
              Выполняй задания и получай автоматический додеп на баланс.
            </p>
          </div>
          {/* Карточка 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <img src={gift} alt="Подарки" className="w-20 h-20 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-pink-500 mb-1">Устал депать?</h3>
            <p className="text-base text-gray-600">
              Трать HelloCoin или спины на призы, которые для тебя приготовили.
            </p>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="relative z-10 py-3 text-center text-pink-400 text-base">
        <p>Сделано с любовью, кодом и множеством додепов</p>
      </footer>
    </div>
  );
}

export default HomePage;
