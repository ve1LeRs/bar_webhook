# Скрипт для настройки webhook с онлайн сервером
Write-Host "🌐 Настройка webhook для онлайн сервера" -ForegroundColor Green
Write-Host "=" * 50

# Запрашиваем URL сервера
Write-Host "📡 Введите URL вашего онлайн сервера:" -ForegroundColor Yellow
Write-Host "Примеры:" -ForegroundColor White
Write-Host "  - https://bar-webhook.onrender.com" -ForegroundColor White
Write-Host "  - https://your-app.railway.app" -ForegroundColor White
Write-Host "  - https://your-app.vercel.app" -ForegroundColor White

$serverUrl = Read-Host "URL сервера"
if (-not $serverUrl) {
    Write-Host "❌ URL не введен" -ForegroundColor Red
    exit 1
}

# Убираем слеш в конце если есть
$serverUrl = $serverUrl.TrimEnd('/')

# Формируем webhook URL
$webhookUrl = "$serverUrl/telegram-webhook"
Write-Host "`n📨 Webhook URL: $webhookUrl" -ForegroundColor Cyan

# Запрашиваем токен бота
Write-Host "`n🤖 Введите токен вашего Telegram бота:" -ForegroundColor Yellow
$botToken = Read-Host "Bot Token"
if (-not $botToken) {
    Write-Host "❌ Токен не введен" -ForegroundColor Red
    exit 1
}

# Проверяем доступность сервера
Write-Host "`n🔍 Проверка доступности сервера..." -ForegroundColor Yellow
try {
    $healthUrl = "$serverUrl/health"
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    Write-Host "✅ Сервер доступен: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Сервер недоступен или медленно отвечает: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Это нормально для Render.com (sleep mode)" -ForegroundColor White
}

# Устанавливаем webhook
Write-Host "`n🔗 Установка webhook..." -ForegroundColor Yellow
try {
    $webhookData = @{
        url = $webhookUrl
    } | ConvertTo-Json
    
    $webhookResponse = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body $webhookData -ContentType "application/json"
    
    if ($webhookResponse.ok) {
        Write-Host "✅ Webhook успешно установлен!" -ForegroundColor Green
        Write-Host "📋 Описание: $($webhookResponse.description)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка установки webhook: $($webhookResponse.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка при установке webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем webhook
Write-Host "`n🔍 Проверка webhook..." -ForegroundColor Yellow
try {
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
    Write-Host "📊 Статус webhook:" -ForegroundColor Cyan
    Write-Host "   URL: $($webhookInfo.result.url)" -ForegroundColor White
    Write-Host "   Статус: $($webhookInfo.result.status)" -ForegroundColor White
    Write-Host "   Последняя ошибка: $($webhookInfo.result.last_error_message)" -ForegroundColor White
    Write-Host "   Последняя дата: $($webhookInfo.result.last_error_date)" -ForegroundColor White
} catch {
    Write-Host "❌ Ошибка при проверке webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Тестируем Firebase
Write-Host "`n🧪 Тестирование Firebase..." -ForegroundColor Yellow
try {
    $firebaseUrl = "$serverUrl/test-firebase"
    $firebaseResponse = Invoke-RestMethod -Uri $firebaseUrl -Method Get -TimeoutSec 15
    Write-Host "✅ Firebase работает: $($firebaseResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Firebase тест не прошел: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Проверьте переменные окружения в Render Dashboard" -ForegroundColor White
}

Write-Host "`n🎯 Готово! Теперь вы можете:" -ForegroundColor Green
Write-Host "   1. Отправить сообщение боту в Telegram" -ForegroundColor White
Write-Host "   2. Использовать кнопки для обновления статусов заказов" -ForegroundColor White
Write-Host "   3. Проверить логи в Render Dashboard" -ForegroundColor White

Write-Host "`n📝 Сохраните эти данные:" -ForegroundColor Yellow
Write-Host "   Server URL: $serverUrl" -ForegroundColor White
Write-Host "   Webhook URL: $webhookUrl" -ForegroundColor White
Write-Host "   Bot Token: $botToken" -ForegroundColor White

Write-Host "`n🔧 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "   Health Check: $serverUrl/health" -ForegroundColor White
Write-Host "   Firebase Test: $serverUrl/test-firebase" -ForegroundColor White
Write-Host "   Render Dashboard: https://dashboard.render.com" -ForegroundColor White

Read-Host "`nНажмите Enter для завершения"
