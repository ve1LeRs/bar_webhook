const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function quickTest() {
  console.log('🚀 Быстрое тестирование endpoints');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(40));
  
  // Health check
  try {
    console.log('🏥 Health check...');
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    console.log(`✅ Health: ${response.status} - ${data.status}`);
  } catch (error) {
    console.log(`❌ Health: ${error.message}`);
  }
  
  // Firebase test
  try {
    console.log('🔥 Firebase test...');
    const response = await fetch(`${SERVER_URL}/test-firebase`);
    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Firebase: ${response.status} - ${data.message}`);
    } else {
      console.log(`❌ Firebase: ${response.status} - ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Firebase: ${error.message}`);
  }
  
  // Webhook test
  try {
    console.log('📨 Webhook test...');
    const webhookData = {
      callback_query: {
        id: 'test_123',
        data: 'confirm_test_order_123',
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
    
    const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    
    const data = await response.text();
    if (response.ok) {
      console.log(`✅ Webhook: ${response.status} - ${data}`);
    } else {
      console.log(`❌ Webhook: ${response.status} - ${data}`);
    }
  } catch (error) {
    console.log(`❌ Webhook: ${error.message}`);
  }
  
  console.log('─'.repeat(40));
  console.log('✨ Тестирование завершено!');
}

quickTest().catch(console.error);
