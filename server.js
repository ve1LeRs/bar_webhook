const express = require('express');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Firebase Admin
let db;
try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Для продакшн (Heroku, Vercel и т.д.)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  } else {
    // Для локальной разработки (используйте service account key)
    const serviceAccount = require('./service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  db = admin.firestore();
  console.log('✅ Firebase Admin инициализирован');
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase:', error.message);
  console.log('💡 Убедитесь, что у вас есть service-account-key.json или настроены переменные окружения');
}

// Middleware
app.use(express.json());

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Тест Firebase подключения
app.get('/test-firebase', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Firebase не инициализирован' });
  }
  
  try {
    const testDoc = await db.collection('test').add({
      message: 'Webhook сервер работает!',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      server: 'webhook-server'
    });
    
    res.json({ 
      success: true, 
      docId: testDoc.id,
      message: 'Firebase подключение работает'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка Firebase', 
      message: error.message 
    });
  }
});

// Основной webhook endpoint
app.post('/telegram-webhook', async (req, res) => {
  try {
    console.log('📨 Получен webhook от Telegram');
    
    const { callback_query } = req.body;
    
    if (callback_query) {
      const { data, message, from } = callback_query;
      console.log(`🔘 Обработка callback: ${data} от пользователя ${from.username || from.first_name}`);
      
      // Парсим callback_data: "confirm_test_order_123" -> action="confirm", orderId="test_order_123"
      const parts = data.split('_');
      const action = parts[0];
      const orderId = parts.slice(1).join('_'); // Объединяем все части после первого подчеркивания
      
      if (!action || !orderId) {
        console.error('❌ Неверный формат callback_data:', data);
        return res.status(400).json({ error: 'Invalid callback data' });
      }
      
      // Маппинг действий на статусы
      const statusMap = {
        'confirm': 'confirmed',
        'preparing': 'preparing',
        'ready': 'ready',
        'completed': 'completed',
        'cancel': 'cancelled'
      };
      
      const newStatus = statusMap[action];
      
      if (!newStatus) {
        console.error('❌ Неизвестное действие:', action);
        return res.status(400).json({ error: 'Unknown action' });
      }
      
      if (!db) {
        console.error('❌ Firebase не инициализирован');
        return res.status(500).json({ error: 'Database not initialized' });
      }
      
      // Обновляем статус в Firestore
      console.log(`🔄 Обновление статуса заказа ${orderId} на: ${newStatus}`);
      
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (orderDoc.exists) {
        // Документ существует, обновляем
        await orderRef.update({
          status: newStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'telegram',
          updatedByUser: from.username || from.first_name || 'Unknown'
        });
        console.log(`✅ Статус заказа ${orderId} успешно обновлен на: ${newStatus}`);
      } else {
        // Документ не существует, создаем новый
        await orderRef.set({
          id: orderId,
          status: newStatus,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'telegram',
          updatedBy: 'telegram',
          updatedByUser: from.username || from.first_name || 'Unknown',
          testOrder: true // Помечаем как тестовый заказ
        });
        console.log(`✅ Тестовый заказ ${orderId} создан со статусом: ${newStatus}`);
      }
      
      // Отправляем подтверждение в Telegram
      const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: `✅ Статус обновлен: ${getStatusText(newStatus)}`,
          show_alert: false
        })
      });
      
      console.log(`📤 Подтверждение отправлено в Telegram`);
      
    } else {
      console.log('📝 Получено обычное сообщение (не callback)');
    }
    
    res.status(200).json({ message: 'OK' });
    
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Функция для получения текста статуса
function getStatusText(status) {
  const statusTexts = {
    'confirmed': '✅ Подтвержден',
    'preparing': '👨‍🍳 Готовится',
    'ready': '🍸 Готов',
    'completed': '✅ Выдан',
    'cancelled': '❌ Отменен'
  };
  return statusTexts[status] || status;
}

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('💥 Необработанная ошибка:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Webhook сервер запущен на порту ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Firebase test: http://localhost:${port}/test-firebase`);
  console.log(`📨 Webhook URL: http://localhost:${port}/telegram-webhook`);
  
  if (process.env.TELEGRAM_BOT_TOKEN) {
    console.log(`🤖 Telegram Bot Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
  } else {
    console.log('⚠️  TELEGRAM_BOT_TOKEN не настроен');
  }
  
  if (process.env.TELEGRAM_CHAT_ID) {
    console.log(`💬 Telegram Chat ID: ${process.env.TELEGRAM_CHAT_ID}`);
  } else {
    console.log('⚠️  TELEGRAM_CHAT_ID не настроен');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершение работы...');
  process.exit(0);
});

module.exports = app;
