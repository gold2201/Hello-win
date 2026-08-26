import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col">
      {/* Плавающие эмодзи на фоне */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <span className="absolute top-20 left-10 text-3xl opacity-30 animate-float">🎰</span>
        <span className="absolute top-1/3 right-16 text-4xl opacity-30 animate-float-delay">🎁</span>
        <span className="absolute bottom-1/4 left-16 text-4xl opacity-20 animate-float">💖</span>
        <span className="absolute bottom-8 right-8 text-2xl opacity-30 animate-float-delay">✨</span>
        <span className="absolute top-2/3 left-1/2 text-3xl opacity-20 animate-float">🍒</span>
        <span className="absolute top-1/4 left-1/4 text-2xl opacity-20 animate-float">🎀</span>
        <span className="absolute top-3/4 right-1/4 text-2xl opacity-20 animate-float-delay">💎</span>
      </div>

      {/* Шапка */}
      <header className="relative z-10 flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎀</span>
          <span className="text-xl font-extrabold text-pink-500">Hello Win</span>
        </div>
        <nav className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full border-2 border-pink-400 text-pink-500 text-sm font-semibold hover:bg-pink-100 transition-all duration-300 hover:scale-105"
          >
            Войти
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 rounded-full bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 hover:scale-105 transition-all duration-300 shadow-md"
          >
            Регистрация
          </Link>
        </nav>
      </header>

      {/* Hero-секция */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-10 py-6 flex-1">
        <div className="text-6xl mb-3 animate-bounce-slow">🎰</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-500 mb-2">
          Сыграй в казино…<br />и выиграй не только монеты 💝
        </h1>
        <p className="text-lg md:text-xl text-pink-400 max-w-2xl mb-6">
          Выполняй задания, крути слот, получай подарки и приятные сюрпризы
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/profile"
            className="px-8 py-3 rounded-full bg-pink-500 text-white text-lg font-bold shadow-lg hover:bg-pink-600 hover:scale-105 transition-all duration-300 animate-pulse-soft"
          >
            Начать игру
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-white border-2 border-pink-300 text-pink-500 text-lg font-bold shadow-md hover:bg-pink-50 hover:scale-105 transition-all duration-300"
          >
            У меня уже есть аккаунт
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
            <div className="text-5xl mb-2">🎰</div>
            <h3 className="text-xl font-bold text-pink-500 mb-1">Играй</h3>
            <p className="text-base text-gray-600">
              Крути слот-машину и получай монеты за выигрышные комбинации.
            </p>
          </div>
          {/* Карточка 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="text-5xl mb-2">📋</div>
            <h3 className="text-xl font-bold text-pink-500 mb-1">Выполняй задания</h3>
            <p className="text-base text-gray-600">
              Обменивай заботу и внимание на дополнительную валюту.
            </p>
          </div>
          {/* Карточка 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="text-5xl mb-2">🎁</div>
            <h3 className="text-xl font-bold text-pink-500 mb-1">Забирай подарки</h3>
            <p className="text-base text-gray-600">
              Трать монеты или спины на призы, которые для тебя приготовили.
            </p>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="relative z-10 py-3 text-center text-pink-400 text-base">
        <p>Сделано с любовью и кодом 💻💖</p>
      </footer>
    </div>
  );
}

export default HomePage;
