const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testPerformance() {
  console.log('⚡ Тестирование производительности');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(50));
  
  const concurrentRequests = 10;
  const orders = [];
  
  // Создаем массив заказов для тестирования
  for (let i = 1; i <= concurrentRequests; i++) {
    orders.push({
      id: `perf_test_${i}_${Date.now()}`,
      name: `Заказ производительности #${i}`
    });
  }
  
  console.log(`📋 Создано ${concurrentRequests} заказов для тестирования`);
  console.log(`🚀 Запуск ${concurrentRequests} одновременных запросов...`);
  
  const startTime = Date.now();
  
  // Создаем все заказы одновременно
  const createPromises = orders.map(async (order, index) => {
    const webhookData = {
      callback_query: {
        id: `perf_${index}_${Date.now()}`,
        data: `confirm_${order.id}`,
        message: {
          message_id: 1000 + index,
          chat: { id: 123456789, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: order.name
        },
        from: {
          id: 123456789,
          is_bot: false,
          first_name: `User${index}`,
          username: `user_${index}`
        }
      }
    };
    
    try {
      const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
      
      const result = await response.text();
      
      return {
        orderId: order.id,
        success: response.ok,
        status: response.status,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        orderId: order.id,
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  });
  
  // Ждем завершения всех запросов
  const results = await Promise.all(createPromises);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Анализируем результаты
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log('\n📊 РЕЗУЛЬТАТЫ ПРОИЗВОДИТЕЛЬНОСТИ:');
  console.log('─'.repeat(50));
  console.log(`⏱️  Общее время: ${totalTime}ms`);
  console.log(`📈 Среднее время ответа: ${Math.round(avgResponseTime)}ms`);
  console.log(`✅ Успешных запросов: ${successful}/${concurrentRequests}`);
  console.log(`❌ Неудачных запросов: ${failed}/${concurrentRequests}`);
  console.log(`📊 Процент успеха: ${Math.round((successful / concurrentRequests) * 100)}%`);
  console.log(`🚀 Запросов в секунду: ${Math.round((concurrentRequests / totalTime) * 1000)}`);
  
  // Показываем детали по каждому запросу
  console.log('\n📋 ДЕТАЛИ ПО ЗАПРОСАМ:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const time = result.responseTime;
    console.log(`   ${status} Заказ ${index + 1}: ${result.orderId} (${time}ms)`);
    if (!result.success) {
      console.log(`      Ошибка: ${result.error || result.status}`);
    }
  });
  
  // Тестируем обновление статусов
  console.log('\n🔄 Тестирование обновления статусов...');
  
  const updateStartTime = Date.now();
  const updatePromises = orders.slice(0, 5).map(async (order, index) => {
    const webhookData = {
      callback_query: {
        id: `update_${index}_${Date.now()}`,
        data: `preparing_${order.id}`,
        message: {
          message_id: 2000 + index,
          chat: { id: 123456789, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: `Обновление статуса для ${order.name}`
        },
        from: {
          id: 123456789,
          is_bot: false,
          first_name: `Kitchen${index}`,
          username: `kitchen_${index}`
        }
      }
    };
    
    try {
      const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
      
      return {
        orderId: order.id,
        success: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        orderId: order.id,
        success: false,
        error: error.message
      };
    }
  });
  
  const updateResults = await Promise.all(updatePromises);
  const updateEndTime = Date.now();
  const updateTotalTime = updateEndTime - updateStartTime;
  
  const updateSuccessful = updateResults.filter(r => r.success).length;
  
  console.log(`⏱️  Время обновления: ${updateTotalTime}ms`);
  console.log(`✅ Успешных обновлений: ${updateSuccessful}/${updatePromises.length}`);
  
  console.log('\n🎯 ЗАКЛЮЧЕНИЕ:');
  if (successful === concurrentRequests && updateSuccessful === updatePromises.length) {
    console.log('🎉 Система показывает отличную производительность!');
    console.log('💡 Готова к высоким нагрузкам');
  } else if (successful >= concurrentRequests * 0.9) {
    console.log('✅ Система работает стабильно');
    console.log('💡 Небольшие ошибки в пределах нормы');
  } else {
    console.log('⚠️  Обнаружены проблемы с производительностью');
    console.log('💡 Рекомендуется оптимизация');
  }
  
  console.log('\n📝 Рекомендации:');
  console.log('   1. Мониторьте время ответа в продакшн');
  console.log('   2. Настройте логирование производительности');
  console.log('   3. Рассмотрите кэширование для часто используемых данных');
  console.log('   4. Настройте мониторинг Firebase производительности');
}

testPerformance().catch(console.error);
