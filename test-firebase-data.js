const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testFirebaseData() {
  console.log('🔥 Тестирование данных в Firebase');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(50));
  
  // Создаем тестовый заказ
  const testOrderId = `test_order_${Date.now()}`;
  console.log(`📋 Создание тестового заказа: ${testOrderId}`);
  
  const webhookData = {
    callback_query: {
      id: `test_${Date.now()}`,
      data: `confirm_${testOrderId}`,
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
    // Отправляем webhook
    const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log(`✅ Заказ создан: ${response.status} - ${result}`);
      
      // Теперь обновляем статус
      console.log(`\n🔄 Обновление статуса на "preparing"...`);
      
      const updateData = {
        ...webhookData,
        callback_query: {
          ...webhookData.callback_query,
          id: `test_${Date.now()}`,
          data: `preparing_${testOrderId}`
        }
      };
      
      const updateResponse = await fetch(`${SERVER_URL}/telegram-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.text();
      
      if (updateResponse.ok) {
        console.log(`✅ Статус обновлен: ${updateResponse.status} - ${updateResult}`);
        
        // Еще одно обновление
        console.log(`\n🔄 Обновление статуса на "ready"...`);
        
        const readyData = {
          ...webhookData,
          callback_query: {
            ...webhookData.callback_query,
            id: `test_${Date.now()}`,
            data: `ready_${testOrderId}`
          }
        };
        
        const readyResponse = await fetch(`${SERVER_URL}/telegram-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readyData)
        });
        
        const readyResult = await readyResponse.text();
        
        if (readyResponse.ok) {
          console.log(`✅ Статус обновлен: ${readyResponse.status} - ${readyResult}`);
          console.log(`\n🎉 Тестовый заказ ${testOrderId} успешно создан и обновлен!`);
          console.log(`📊 Статусы: confirmed → preparing → ready`);
        } else {
          console.log(`❌ Ошибка обновления на ready: ${readyResponse.status} - ${readyResult}`);
        }
      } else {
        console.log(`❌ Ошибка обновления: ${updateResponse.status} - ${updateResult}`);
      }
    } else {
      console.log(`❌ Ошибка создания заказа: ${response.status} - ${result}`);
    }
  } catch (error) {
    console.log(`💥 Исключение: ${error.message}`);
  }
  
  console.log('\n─'.repeat(50));
  console.log('💡 Проверьте Firebase Console для просмотра созданных данных');
  console.log('📁 Коллекция: orders');
  console.log(`📄 Документ: ${testOrderId}`);
}

testFirebaseData().catch(console.error);
