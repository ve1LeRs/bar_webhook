const fetch = require('node-fetch');

// Конфигурация для тестирования
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const TEST_ORDER_ID = 'test_order_123';

// Тестовые данные
const testCallbacks = [
  {
    name: 'Подтверждение заказа',
    data: `confirm_${TEST_ORDER_ID}`,
    expectedStatus: 'confirmed'
  },
  {
    name: 'Начало приготовления',
    data: `preparing_${TEST_ORDER_ID}`,
    expectedStatus: 'preparing'
  },
  {
    name: 'Готово к выдаче',
    data: `ready_${TEST_ORDER_ID}`,
    expectedStatus: 'ready'
  },
  {
    name: 'Заказ выдан',
    data: `completed_${TEST_ORDER_ID}`,
    expectedStatus: 'completed'
  },
  {
    name: 'Отмена заказа',
    data: `cancel_${TEST_ORDER_ID}`,
    expectedStatus: 'cancelled'
  }
];

// Функция для отправки тестового webhook
async function sendTestWebhook(callbackData) {
  const webhookData = {
    callback_query: {
      id: `test_${Date.now()}`,
      data: callbackData,
      message: {
        message_id: 123,
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Тестовое сообщение'
      },
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Test',
        username: 'test_user'
      }
    }
  };

  try {
    console.log(`🧪 Отправка тестового webhook: ${callbackData}`);
    
    const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log(`✅ Успешно: ${response.status} - ${result}`);
    } else {
      console.log(`❌ Ошибка: ${response.status} - ${result}`);
    }
    
    return { success: response.ok, status: response.status, result };
    
  } catch (error) {
    console.log(`💥 Исключение: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Функция для проверки здоровья сервера
async function checkServerHealth() {
  try {
    console.log('🏥 Проверка здоровья сервера...');
    
    const response = await fetch(`${SERVER_URL}/health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Сервер работает:', result);
      return true;
    } else {
      console.log('❌ Сервер не отвечает:', result);
      return false;
    }
  } catch (error) {
    console.log('💥 Сервер недоступен:', error.message);
    return false;
  }
}

// Функция для тестирования Firebase
async function testFirebase() {
  try {
    console.log('🔥 Тестирование Firebase...');
    
    const response = await fetch(`${SERVER_URL}/test-firebase`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Firebase работает:', result);
      return true;
    } else {
      console.log('❌ Firebase не работает:', result);
      return false;
    }
  } catch (error) {
    console.log('💥 Ошибка Firebase:', error.message);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестов webhook сервера');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(50));
  
  // Проверка здоровья сервера
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('❌ Сервер недоступен. Убедитесь, что он запущен.');
    process.exit(1);
  }
  
  console.log('');
  
  // Тестирование Firebase
  const firebaseWorking = await testFirebase();
  if (!firebaseWorking) {
    console.log('⚠️  Firebase не работает, но продолжаем тестирование webhook...');
  }
  
  console.log('');
  
  // Тестирование webhook-ов
  console.log('🧪 Тестирование webhook-ов...');
  console.log('─'.repeat(50));
  
  let successCount = 0;
  let totalCount = testCallbacks.length;
  
  for (const test of testCallbacks) {
    console.log(`\n📋 ${test.name}`);
    console.log(`   Callback: ${test.data}`);
    console.log(`   Ожидаемый статус: ${test.expectedStatus}`);
    
    const result = await sendTestWebhook(test.data);
    
    if (result.success) {
      console.log(`   ✅ Успешно обработан`);
      successCount++;
    } else {
      console.log(`   ❌ Ошибка: ${result.error || result.result}`);
    }
    
    // Небольшая пауза между тестами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Результаты тестирования:`);
  console.log(`   ✅ Успешно: ${successCount}/${totalCount}`);
  console.log(`   ❌ Ошибок: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 Все тесты прошли успешно!');
  } else {
    console.log('⚠️  Некоторые тесты не прошли. Проверьте логи сервера.');
  }
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { runTests, sendTestWebhook, checkServerHealth, testFirebase };
