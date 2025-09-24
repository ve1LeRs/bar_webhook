# 🚀 Исправление кнопок Telegram - Инструкции по развертыванию

## 🔍 Проблема
Кнопки в Telegram застревают в состоянии загрузки из-за ошибок в webhook сервере на Render.com.

## ✅ Решение
Обновить код на Render.com с исправленной версией из папки `webhook-server`.

## 📋 Шаги для исправления:

### 1. Подготовка файлов
Все исправленные файлы уже находятся в папке `webhook-server/`:
- ✅ `server.js` - исправлен маппинг действий
- ✅ `package.json` - правильные зависимости
- ✅ `service-account-key.json` - ключ Firebase
- ✅ Все тестовые файлы

### 2. Развертывание на Render.com

#### Вариант A: Через Git (рекомендуется)
1. Создайте новый репозиторий на GitHub
2. Скопируйте все файлы из папки `webhook-server/` в репозиторий
3. В Render.com создайте новый Web Service
4. Подключите репозиторий
5. Настройте переменные окружения:
   ```
   TELEGRAM_BOT_TOKEN=8326139522:AAG2fwHYd1vRPx0cUXt4ATaFYTNxmzInWJo
   TELEGRAM_CHAT_ID=1743362083
   NODE_ENV=production
   ```

#### Вариант B: Прямое обновление
1. Зайдите в панель управления Render.com
2. Найдите сервис `bar-webhook`
3. Перейдите в раздел "Settings"
4. Обновите код в разделе "Build & Deploy"
5. Скопируйте содержимое файлов из папки `webhook-server/`

### 3. Проверка развертывания
После развертывания проверьте:
```bash
# Проверка здоровья сервера
curl https://bar-webhook.onrender.com/health

# Должен вернуть:
# {"status":"OK","timestamp":"...","uptime":...}
```

### 4. Тестирование кнопок
1. Отправьте тестовое сообщение в Telegram
2. Нажмите любую кнопку
3. Кнопка должна перестать "крутиться" и показать уведомление

## 🔧 Ключевые исправления:

### 1. Маппинг действий
```javascript
// БЫЛО (неправильно):
const statusMap = {
  'confirm': 'confirmed',  // ❌ Неправильно
  'cancel': 'cancelled'    // ❌ Неправильно
};

// СТАЛО (правильно):
const statusMap = {
  'confirmed': 'confirmed',  // ✅ Правильно
  'cancelled': 'cancelled',  // ✅ Правильно
  'preparing': 'preparing',
  'ready': 'ready',
  'completed': 'completed',
  'test': 'test'
};
```

### 2. Обработка ошибок
```javascript
// Добавлена обработка ошибок для answerCallbackQuery
try {
  const response = await fetch(telegramUrl, { ... });
  if (!response.ok) {
    console.error('❌ Ошибка отправки ответа в Telegram:', errorText);
  }
} catch (telegramError) {
  console.error('❌ Ошибка отправки в Telegram:', telegramError.message);
}
```

### 3. Правильный формат callback_data
- Frontend отправляет: `confirmed_${docRef.id}`
- Webhook ожидает: `confirmed_${orderId}`
- ✅ Формат совпадает!

## 🧪 Тестирование после развертывания:

### 1. Локальное тестирование
```bash
cd webhook-server
node server.js
# В другом терминале:
node test-real-callback.js
```

### 2. Тестирование в Telegram
```bash
node test-telegram-buttons.js
```

### 3. Проверка логов
В Render.com проверьте логи на наличие:
- ✅ "📨 Получен webhook от Telegram"
- ✅ "🔘 Обработка callback: confirmed_..."
- ✅ "✅ Статус заказа ... успешно обновлен"
- ❌ Отсутствие ошибок "400 Bad Request"

## 🎯 Ожидаемый результат:
1. Кнопки в Telegram перестают застревать в состоянии загрузки
2. При нажатии кнопки появляется уведомление об успешном обновлении
3. Статус заказа обновляется в Firebase
4. В логах сервера нет ошибок

## 📞 Если проблема не решается:
1. Проверьте переменные окружения в Render.com
2. Убедитесь, что service-account-key.json загружен
3. Проверьте логи сервера на ошибки
4. Убедитесь, что webhook URL правильный: `https://bar-webhook.onrender.com/telegram-webhook`
