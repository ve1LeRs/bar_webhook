// Сервер для обработки webhook'ов от Telegram
// Этот файл нужно запустить на сервере для обработки нажатий кнопок в Telegram

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Обработка webhook'ов от Telegram
app.post('/telegram-webhook', async (req, res) => {
  try {
    const { callback_query } = req.body;
    
    if (callback_query) {
      const { data, message } = callback_query;
      const orderId = data.split('_')[1];
      const action = data.split('_')[0];
      
      console.log(`Получен callback: ${action} для заказа ${orderId}`);
      
      // Здесь нужно обновить статус в Firestore
      // Это можно сделать через Firebase Admin SDK
      
      // Отправляем ответ в Telegram
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: `Статус заказа обновлен: ${action}`,
          show_alert: false
        })
      });
      
      res.status(200).send('OK');
    } else {
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).send('Error');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Telegram webhook сервер запущен на порту ${port}`);
});

// Экспорт для использования в других модулях
module.exports = app;
