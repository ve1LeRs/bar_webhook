const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testCancelOrder() {
  console.log('❌ Тестирование отмены заказа');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(50));
  
  const orderId = `cancel_test_${Date.now()}`;
  console.log(`📋 Тестовый заказ: ${orderId}`);
  
  // 1. Создаем заказ
  console.log('\n1️⃣ Создание заказа...');
  const createData = {
    callback_query: {
      id: `create_${Date.now()}`,
      data: `confirm_${orderId}`,
      message: {
        message_id: 123,
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Новый заказ для отмены'
      },
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Customer',
        username: 'customer_test'
      }
    }
  };
  
  try {
    const createResponse = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      console.log('   ✅ Заказ создан успешно');
    } else {
      console.log(`   ❌ Ошибка создания: ${createResponse.status}`);
      return;
    }
  } catch (error) {
    console.log(`   💥 Исключение: ${error.message}`);
    return;
  }
  
  // 2. Начинаем приготовление
  console.log('\n2️⃣ Начало приготовления...');
  const preparingData = {
    callback_query: {
      id: `preparing_${Date.now()}`,
      data: `preparing_${orderId}`,
      message: {
        message_id: 124,
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Начало приготовления'
      },
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Kitchen',
        username: 'kitchen_staff'
      }
    }
  };
  
  try {
    const preparingResponse = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparingData)
    });
    
    if (preparingResponse.ok) {
      console.log('   ✅ Приготовление начато');
    } else {
      console.log(`   ❌ Ошибка: ${preparingResponse.status}`);
    }
  } catch (error) {
    console.log(`   💥 Исключение: ${error.message}`);
  }
  
  // 3. Отменяем заказ
  console.log('\n3️⃣ Отмена заказа...');
  const cancelData = {
    callback_query: {
      id: `cancel_${Date.now()}`,
      data: `cancel_${orderId}`,
      message: {
        message_id: 125,
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Отмена заказа'
      },
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Manager',
        username: 'manager'
      }
    }
  };
  
  try {
    const cancelResponse = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cancelData)
    });
    
    const cancelResult = await cancelResponse.text();
    
    if (cancelResponse.ok) {
      console.log('   ✅ Заказ отменен успешно');
      console.log(`   📄 Ответ: ${cancelResult}`);
    } else {
      console.log(`   ❌ Ошибка отмены: ${cancelResponse.status} - ${cancelResult}`);
    }
  } catch (error) {
    console.log(`   💥 Исключение: ${error.message}`);
  }
  
  console.log('\n─'.repeat(50));
  console.log('🎯 Тест отмены заказа завершен');
  console.log(`📋 Заказ ID: ${orderId}`);
  console.log('💡 Проверьте Firebase Console для просмотра статуса заказа');
}

testCancelOrder().catch(console.error);
