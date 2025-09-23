const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

// Реальные тестовые заказы
const realOrders = [
  {
    id: 'order_001',
    name: 'Заказ #001 - Коктейли',
    items: ['Мохито', 'Космополитан', 'Маргарита'],
    total: 1500
  },
  {
    id: 'order_002', 
    name: 'Заказ #002 - Закуски',
    items: ['Сырная тарелка', 'Оливки', 'Креветки'],
    total: 800
  },
  {
    id: 'order_003',
    name: 'Заказ #003 - Основные блюда',
    items: ['Стейк', 'Рыба', 'Паста'],
    total: 2500
  }
];

async function createRealOrder(order) {
  console.log(`\n📋 Создание заказа: ${order.name}`);
  console.log(`   ID: ${order.id}`);
  console.log(`   Позиции: ${order.items.join(', ')}`);
  console.log(`   Сумма: ${order.total} руб.`);
  
  const webhookData = {
    callback_query: {
      id: `real_${Date.now()}`,
      data: `confirm_${order.id}`,
      message: {
        message_id: Math.floor(Math.random() * 1000),
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: `Новый заказ: ${order.name}`
      },
      from: {
        id: 123456789,
        is_bot: false,
        first_name: 'Bartender',
        username: 'bar_staff'
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
    
    if (response.ok) {
      console.log(`   ✅ Заказ создан: ${response.status}`);
      return true;
    } else {
      console.log(`   ❌ Ошибка: ${response.status} - ${result}`);
      return false;
    }
  } catch (error) {
    console.log(`   💥 Исключение: ${error.message}`);
    return false;
  }
}

async function updateOrderStatus(orderId, action, statusName) {
  console.log(`\n🔄 ${statusName} заказа ${orderId}...`);
  
  const webhookData = {
    callback_query: {
      id: `update_${Date.now()}`,
      data: `${action}_${orderId}`,
      message: {
        message_id: Math.floor(Math.random() * 1000),
        chat: { id: 123456789, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: `Обновление статуса: ${statusName}`
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
    const response = await fetch(`${SERVER_URL}/telegram-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log(`   ✅ Статус обновлен: ${response.status}`);
      return true;
    } else {
      console.log(`   ❌ Ошибка: ${response.status} - ${result}`);
      return false;
    }
  } catch (error) {
    console.log(`   💥 Исключение: ${error.message}`);
    return false;
  }
}

async function simulateOrderLifecycle(order) {
  console.log(`\n🎬 Симуляция жизненного цикла заказа: ${order.name}`);
  console.log('─'.repeat(60));
  
  let successCount = 0;
  let totalSteps = 0;
  
  // 1. Создание заказа
  totalSteps++;
  if (await createRealOrder(order)) {
    successCount++;
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Начало приготовления
  totalSteps++;
  if (await updateOrderStatus(order.id, 'preparing', 'Начало приготовления')) {
    successCount++;
  }
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Готово к выдаче
  totalSteps++;
  if (await updateOrderStatus(order.id, 'ready', 'Готово к выдаче')) {
    successCount++;
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 4. Заказ выдан
  totalSteps++;
  if (await updateOrderStatus(order.id, 'completed', 'Заказ выдан')) {
    successCount++;
  }
  
  console.log(`\n📊 Результат для ${order.name}:`);
  console.log(`   ✅ Успешно: ${successCount}/${totalSteps}`);
  console.log(`   ❌ Ошибок: ${totalSteps - successCount}/${totalSteps}`);
  
  return successCount === totalSteps;
}

async function testRealOrders() {
  console.log('🍸 Тестирование реальных заказов');
  console.log(`📍 Сервер: ${SERVER_URL}`);
  console.log('─'.repeat(60));
  
  // Проверяем здоровье сервера
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    console.log(`🏥 Сервер: ${data.status} (uptime: ${Math.round(data.uptime)}s)`);
  } catch (error) {
    console.log(`❌ Сервер недоступен: ${error.message}`);
    return;
  }
  
  console.log(`\n📋 Будет протестировано ${realOrders.length} заказов:`);
  realOrders.forEach((order, index) => {
    console.log(`   ${index + 1}. ${order.name}`);
  });
  
  let totalSuccess = 0;
  let totalOrders = realOrders.length;
  
  // Тестируем каждый заказ
  for (const order of realOrders) {
    const success = await simulateOrderLifecycle(order);
    if (success) {
      totalSuccess++;
    }
    
    // Пауза между заказами
    if (order !== realOrders[realOrders.length - 1]) {
      console.log('\n⏳ Пауза между заказами...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('🎯 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:');
  console.log(`   📋 Всего заказов: ${totalOrders}`);
  console.log(`   ✅ Успешно обработано: ${totalSuccess}`);
  console.log(`   ❌ С ошибками: ${totalOrders - totalSuccess}`);
  console.log(`   📊 Процент успеха: ${Math.round((totalSuccess / totalOrders) * 100)}%`);
  
  if (totalSuccess === totalOrders) {
    console.log('\n🎉 ВСЕ ЗАКАЗЫ ОБРАБОТАНЫ УСПЕШНО!');
    console.log('💡 Система готова к реальной работе!');
  } else {
    console.log('\n⚠️  Некоторые заказы обработаны с ошибками');
    console.log('💡 Проверьте логи сервера для диагностики');
  }
  
  console.log('\n📝 Рекомендации:');
  console.log('   1. Проверьте Firebase Console для просмотра созданных заказов');
  console.log('   2. Убедитесь, что все статусы обновляются корректно');
  console.log('   3. Настройте TELEGRAM_BOT_TOKEN для полной функциональности');
}

testRealOrders().catch(console.error);
