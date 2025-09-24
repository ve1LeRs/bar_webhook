const fetch = require('node-fetch');

// Тестирование webhook сервера после развертывания на Render.com
async function testAfterDeploy() {
  const webhookUrl = 'https://bar-webhook.onrender.com/telegram-webhook';
  
  console.log('🧪 Тестирование webhook сервера после развертывания...');
  
  // Тест 1: Проверка здоровья сервера
  try {
    console.log('1️⃣ Проверка здоровья сервера...');
    const healthResponse = await fetch('https://bar-webhook.onrender.com/health');
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'OK') {
      console.log('✅ Сервер работает');
      console.log(`   Uptime: ${Math.floor(healthData.uptime)} секунд`);
    } else {
      console.log('❌ Сервер не отвечает правильно');
      return;
    }
  } catch (error) {
    console.log('❌ Сервер недоступен:', error.message);
    return;
  }
  
  // Тест 2: Проверка Firebase
  try {
    console.log('2️⃣ Проверка Firebase...');
    const firebaseResponse = await fetch('https://bar-webhook.onrender.com/test-firebase');
    const firebaseData = await firebaseResponse.json();
    
    if (firebaseData.success) {
      console.log('✅ Firebase работает');
      console.log(`   Test doc ID: ${firebaseData.docId}`);
    } else {
      console.log('❌ Firebase не работает:', firebaseData.error);
    }
  } catch (error) {
    console.log('❌ Ошибка Firebase:', error.message);
  }
  
  // Тест 3: Тестирование callback_query
  try {
    console.log('3️⃣ Тестирование callback_query...');
    
    const testCallback = {
      callback_query: {
        id: `test_after_deploy_${Date.now()}`,
        from: {
          id: 1743362083,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser'
        },
        message: {
          message_id: 1,
          from: {
            id: 8326139522,
            is_bot: true,
            first_name: 'Asafiev Bar Bot',
            username: 'asafiev_bar_bot'
          },
          chat: {
            id: 1743362083,
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: 'Тест после развертывания'
        },
        data: 'confirmed_test_after_deploy_123'
      }
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCallback)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Callback_query обработан успешно');
      console.log(`   Ответ: ${result}`);
    } else {
      console.log('❌ Ошибка обработки callback_query');
      console.log(`   Статус: ${response.status}`);
      console.log(`   Ответ: ${result}`);
    }
    
  } catch (error) {
    console.log('❌ Ошибка тестирования callback_query:', error.message);
  }
  
  // Тест 4: Проверка webhook в Telegram
  try {
    console.log('4️⃣ Проверка настроек webhook в Telegram...');
    
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || '8326139522:AAG2fwHYd1vRPx0cUXt4ATaFYTNxmzInWJo'}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log('📱 Информация о webhook:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Последняя ошибка: ${info.last_error_message || 'Нет ошибок'}`);
      console.log(`   Количество ошибок: ${info.pending_update_count || 0}`);
      
      if (info.url && info.url.includes('bar-webhook.onrender.com')) {
        console.log('✅ Webhook настроен правильно');
      } else {
        console.log('⚠️ Webhook URL не соответствует ожидаемому');
      }
    } else {
      console.log('❌ Ошибка получения информации о webhook');
    }
    
  } catch (error) {
    console.log('❌ Ошибка проверки webhook:', error.message);
  }
  
  console.log('\n✨ Тестирование завершено!');
  console.log('📋 Следующие шаги:');
  console.log('   1. Если все тесты прошли успешно, кнопки должны работать');
  console.log('   2. Отправьте тестовое сообщение в Telegram');
  console.log('   3. Нажмите любую кнопку для проверки');
  console.log('   4. Проверьте логи в Render.com');
}

// Запуск тестов
testAfterDeploy().catch(console.error);
