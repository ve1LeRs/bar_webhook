# 🆓 Бесплатное развертывание на Render.com

## 🎯 **Почему Render.com?**
- ✅ **Полностью бесплатно** (750 часов/месяц)
- ✅ Автоматическое развертывание из GitHub
- ✅ SSL сертификаты включены
- ✅ Переменные окружения
- ✅ Автоматические обновления при push в GitHub

---

## 📋 **Пошаговая инструкция:**

### **Шаг 1: Подготовка GitHub репозитория**

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ваш-username/bar-webhook.git
   git push -u origin main
   ```

2. **Убедитесь, что у вас есть файлы:**
   - ✅ `package.json`
   - ✅ `server.js`
   - ✅ `.env.example` (без реальных токенов!)

### **Шаг 2: Создание аккаунта на Render**

1. Перейдите на [render.com](https://render.com)
2. Нажмите "Get Started for Free"
3. Войдите через GitHub

### **Шаг 3: Создание Web Service**

1. **Нажмите "New +" → "Web Service"**
2. **Подключите ваш GitHub репозиторий**
3. **Настройте параметры:**
   - **Name:** `bar-webhook` (или любое имя)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### **Шаг 4: Настройка переменных окружения**

В разделе "Environment Variables" добавьте:

```
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
FIREBASE_PROJECT_ID=ваш_project_id
FIREBASE_CLIENT_EMAIL=ваш_client_email
FIREBASE_PRIVATE_KEY=ваш_private_key
```

**⚠️ Важно:** Не добавляйте `service-account-key.json` - используйте переменные окружения!

### **Шаг 5: Развертывание**

1. **Нажмите "Create Web Service"**
2. **Render автоматически:**
   - Клонирует ваш репозиторий
   - Установит зависимости
   - Запустит сервер
   - Назначит URL

### **Шаг 6: Получение URL**

После развертывания вы получите URL вида:
```
https://bar-webhook.onrender.com
```

---

## 🤖 **Настройка Telegram Webhook:**

### **Автоматическая настройка:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://bar-webhook.onrender.com/telegram-webhook"}'
```

### **Проверка webhook:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

## 🧪 **Тестирование:**

1. **Проверьте health endpoint:**
   ```
   https://bar-webhook.onrender.com/health
   ```

2. **Проверьте Firebase:**
   ```
   https://bar-webhook.onrender.com/test-firebase
   ```

3. **Отправьте сообщение боту в Telegram**

---

## 📊 **Мониторинг:**

- **Render Dashboard:** https://dashboard.render.com
- **Логи:** Доступны в разделе "Logs"
- **Метрики:** CPU, Memory, Requests

---

## ⚠️ **Важные особенности Render Free:**

1. **Sleep Mode:** Сервер "засыпает" после 15 минут неактивности
2. **Cold Start:** Первый запрос после сна может занять 30 секунд
3. **750 часов/месяц:** Обычно достаточно для тестирования

---

## 🔄 **Обновления:**

При каждом push в GitHub:
1. Render автоматически пересоберет приложение
2. Развернет новую версию
3. Обновит webhook (если URL не изменился)

---

## 🎉 **Готово!**

Ваш сервер теперь работает онлайн 24/7 бесплатно!

**URL вашего сервера:** `https://bar-webhook.onrender.com`
**Webhook URL:** `https://bar-webhook.onrender.com/telegram-webhook`
