# Базовый образ Python 3.13
FROM python:3.13-slim

# Отключаем создание .pyc и буферизацию вывода
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Устанавливаем зависимости (сначала копируем только requirements, чтобы использовать кеш Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект (включая src, .env при необходимости, но .env лучше не копировать)
COPY . .

# Переходим в директорию с manage.py
WORKDIR /app/src

EXPOSE 8000

# Запуск dev-сервера (для production позже заменим на gunicorn)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
