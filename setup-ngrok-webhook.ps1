# Скрипт для настройки ngrok и webhook
Write-Host "🚀 Настройка ngrok и webhook для Telegram Bot" -ForegroundColor Green
Write-Host "=" * 50

# Проверяем, запущен ли сервер
Write-Host "📡 Проверка сервера..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Сервер работает: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Сервер не запущен. Запускаем..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Запускаем ngrok
Write-Host "🌐 Запуск ngrok туннеля..." -ForegroundColor Yellow
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

# Получаем URL туннеля
Write-Host "🔍 Получение URL туннеля..." -ForegroundColor Yellow
try {
    $tunnelsResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $publicUrl = $tunnelsResponse.tunnels[0].public_url
    Write-Host "✅ Ngrok URL: $publicUrl" -ForegroundColor Green
    
    # Формируем webhook URL
    $webhookUrl = "$publicUrl/telegram-webhook"
    Write-Host "📨 Webhook URL: $webhookUrl" -ForegroundColor Cyan
    
    # Запрашиваем токен бота
    Write-Host "`n🤖 Настройка Telegram Bot:" -ForegroundColor Yellow
    $botToken = Read-Host "Введите токен вашего Telegram бота"
    
    if ($botToken) {
        Write-Host "🔗 Установка webhook..." -ForegroundColor Yellow
        
        # Устанавливаем webhook
        $webhookData = @{
            url = $webhookUrl
        } | ConvertTo-Json
        
        try {
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
        } catch {
            Write-Host "❌ Ошибка при проверке webhook: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Токен не введен. Webhook не установлен." -ForegroundColor Yellow
    }
    
    Write-Host "`n🎯 Готово! Теперь вы можете:" -ForegroundColor Green
    Write-Host "   1. Отправить сообщение боту в Telegram" -ForegroundColor White
    Write-Host "   2. Проверить логи сервера для обработки webhook'ов" -ForegroundColor White
    Write-Host "   3. Использовать кнопки для обновления статусов заказов" -ForegroundColor White
    
    Write-Host "`n📝 Сохраните эти данные:" -ForegroundColor Yellow
    Write-Host "   Ngrok URL: $publicUrl" -ForegroundColor White
    Write-Host "   Webhook URL: $webhookUrl" -ForegroundColor White
    Write-Host "   Bot Token: $botToken" -ForegroundColor White
    
} catch {
    Write-Host "❌ Ошибка при получении URL туннеля: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Убедитесь, что ngrok запущен и доступен на порту 4040" -ForegroundColor Yellow
}

Write-Host "`n🛑 Для остановки нажмите Ctrl+C" -ForegroundColor Red
Write-Host "📊 Ngrok Dashboard: http://localhost:4040" -ForegroundColor Cyan

# Ждем нажатия клавиши
Read-Host "Нажмите Enter для завершения"
