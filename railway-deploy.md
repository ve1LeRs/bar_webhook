# 🚀 Развертывание на Railway

## 📋 **Быстрая настройка Railway:**

### 1. **Создайте аккаунт на Railway:**
- Перейдите на [railway.app](https://railway.app)
- Войдите через GitHub

### 2. **Создайте новый проект:**
- Нажмите "New Project"
- Выберите "Deploy from GitHub repo"
- Выберите ваш репозиторий

### 3. **Настройте переменные окружения:**
В разделе "Variables" добавьте:

```
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
FIREBASE_PROJECT_ID=ваш_project_id
FIREBASE_CLIENT_EMAIL=ваш_client_email
FIREBASE_PRIVATE_KEY=ваш_private_key
```

### 4. **Railway автоматически:**
- ✅ Определит что это Node.js проект
- ✅ Установит зависимости из package.json
- ✅ Запустит `npm start`
- ✅ Назначит публичный URL

### 5. **Получите URL:**
После развертывания Railway даст вам URL вида:
```
https://your-app-name.railway.app
```

### 6. **Установите webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app-name.railway.app/telegram-webhook"}'
```

## 🎯 **Готово!**
Ваш сервер будет работать 24/7 онлайн без ngrok!

---

## 🔧 **Альтернативные платформы:**

### **Render.com:**
1. Создайте аккаунт на render.com
2. "New Web Service" → подключите GitHub
3. Настройте переменные окружения
4. Получите URL вида: `https://your-app.onrender.com`

### **Heroku:**
1. Установите Heroku CLI
2. `heroku create your-app-name`
3. `heroku config:set TELEGRAM_BOT_TOKEN=...`
4. `git push heroku main`

---

## 📊 **Преимущества онлайн развертывания:**
- ✅ Работает 24/7
- ✅ Не нужен ngrok
- ✅ Стабильный URL
- ✅ Автоматические SSL сертификаты
- ✅ Масштабируемость
