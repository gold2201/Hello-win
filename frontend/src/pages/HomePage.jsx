import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-200 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-4">🎀</div>
        <h1 className="text-5xl font-bold text-pink-500 mb-3">Hello Win</h1>
        <p className="text-xl text-pink-400 mb-8">
          Добро пожаловать в казино-сюрприз! Играй, выполняй задания, получай подарки.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl font-semibold transition shadow-md"
          >
            Войти
          </Link>
          <Link
            to="/register"
            className="bg-white hover:bg-pink-50 text-pink-500 border border-pink-300 px-8 py-3 rounded-2xl font-semibold transition shadow-md"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
