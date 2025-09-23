# Asafiev Bar - Webhook Server

Webhook сервер для обработки статусов заказов через Telegram бота.

## 🚀 Быстрый старт

### **Для онлайн развертывания (рекомендуется):**
```powershell
# 1. Подготовка к развертыванию
.\setup-render-deploy.ps1

# 2. Следуйте инструкциям в RENDER_DEPLOY_GUIDE.md

# 3. Настройка webhook
.\setup-online-webhook.ps1
```

### **Для локальной разработки:**

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `env.example` в `.env` и заполните:

```bash
cp env.example .env
```

Отредактируйте `.env`:
```bash
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
```

### 3. Настройка Firebase

#### Для локальной разработки:
1. Скачайте `service-account-key.json` из Firebase Console
2. Поместите файл в корень проекта

#### Для продакшн:
Раскомментируйте и заполните переменные в `.env`:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

### 4. Запуск сервера

```bash
# Режим разработки
npm run dev

# Продакшн
npm start
```

### 5. Настройка webhook в Telegram

#### **Автоматическая настройка (рекомендуется):**

```powershell
# Для онлайн сервера (Render, Railway, etc.)
.\setup-online-webhook.ps1

# Для локальной разработки с ngrok
.\setup-ngrok-webhook.ps1
```

#### **Ручная настройка:**

```bash
# Для локальной разработки (с ngrok)
ngrok http 3000
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/telegram-webhook"}'

# Для онлайн сервера
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.onrender.com/telegram-webhook"}'
```

## 📋 API Endpoints

### `GET /health`
Проверка состояния сервера

### `GET /test-firebase`
Тест подключения к Firebase

### `POST /telegram-webhook`
Основной endpoint для получения webhook'ов от Telegram

## 🔧 Настройка

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | ✅ |
| `TELEGRAM_CHAT_ID` | ID чата для уведомлений | ✅ |
| `PORT` | Порт сервера | ❌ (по умолчанию 3000) |
| `FIREBASE_PROJECT_ID` | ID проекта Firebase | ✅ (для продакшн) |
| `FIREBASE_CLIENT_EMAIL` | Email сервисного аккаунта | ✅ (для продакшн) |
| `FIREBASE_PRIVATE_KEY` | Приватный ключ | ✅ (для продакшн) |

### Структура проекта

```
├── server.js              # Основной файл сервера
├── package.json           # Зависимости и скрипты
├── env.example           # Пример переменных окружения
├── .env                  # Ваши переменные окружения (создать)
├── service-account-key.json # Ключ Firebase (для локальной разработки)
└── README.md             # Этот файл
```

## 🧪 Тестирование

### Проверка webhook

```bash
# Проверка информации о webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# Отправка тестового сообщения с кнопкой
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "YOUR_CHAT_ID",
       "text": "🧪 Тест webhook",
       "reply_markup": {
         "inline_keyboard": [[
           {"text": "Тест", "callback_data": "test_123"}
         ]]
       }
     }'
```

### Локальное тестирование

```bash
# Запуск в режиме разработки
npm run dev

# В другом терминале
curl -X POST "http://localhost:3000/telegram-webhook" \
     -H "Content-Type: application/json" \
     -d '{
       "callback_query": {
         "id": "test_123",
         "data": "confirm_order_123",
         "message": {"message_id": 1}
       }
     }'
```

## 🚀 Развертывание

### 🆓 **Бесплатные варианты (рекомендуется):**

#### **Render.com** (Лучший выбор)
- ✅ **Полностью бесплатно** (750 часов/месяц)
- ✅ Автоматическое развертывание из GitHub
- ✅ SSL сертификаты включены
- ✅ Простая настройка переменных окружения

**Быстрая настройка:**
1. Создайте аккаунт на [render.com](https://render.com)
2. Подключите GitHub репозиторий
3. Создайте "Web Service"
4. Добавьте переменные окружения
5. Получите URL вида: `https://your-app.onrender.com`

📖 **Подробная инструкция:** [RENDER_DEPLOY_GUIDE.md](RENDER_DEPLOY_GUIDE.md)

#### **Railway.app**
- ✅ **Бесплатно** (500 часов/месяц)
- ✅ Очень простой интерфейс
- ✅ Автоматическое определение Node.js

#### **Vercel** (для API endpoints)
- ✅ **Бесплатно** с ограничениями
- ✅ Отлично для serverless функций

### 💰 **Платные варианты:**

#### **Heroku**
```bash
# Создание приложения
heroku create your-app-name

# Настройка переменных окружения
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_CHAT_ID=your_chat_id
heroku config:set FIREBASE_PROJECT_ID=your_project_id
heroku config:set FIREBASE_CLIENT_EMAIL=your_email
heroku config:set FIREBASE_PRIVATE_KEY="your_private_key"

# Развертывание
git push heroku main
```

## 📊 Мониторинг

### Логи

```bash
# Heroku
heroku logs --tail

# Vercel
vercel logs

# Локально
npm run dev
```

### Проверка состояния

```bash
# Проверка здоровья сервера
curl http://localhost:3000/health

# Тест Firebase
curl http://localhost:3000/test-firebase
```

## 🛠️ Отладка

### Частые проблемы

1. **Firebase не инициализирован**
   - Проверьте наличие `service-account-key.json` или переменных окружения
   - Убедитесь в правильности ключей

2. **Webhook не работает**
   - Проверьте URL webhook'а
   - Убедитесь, что сервер доступен извне
   - Проверьте логи сервера

3. **Telegram не отвечает**
   - Проверьте правильность токена бота
   - Убедитесь, что бот добавлен в чат

### Логи

Сервер выводит подробные логи:
- 📨 Получение webhook'ов
- 🔘 Обработка callback'ов
- ✅ Успешные обновления
- ❌ Ошибки

## 📝 Лицензия

MIT License
