# Быстрый запуск ngrok
Write-Host "🚀 Запуск ngrok туннеля..." -ForegroundColor Green

# Запускаем ngrok в фоновом режиме
Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WindowStyle Hidden

# Ждем запуска
Start-Sleep -Seconds 3

# Получаем URL
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $publicUrl = $response.tunnels[0].public_url
    $webhookUrl = "$publicUrl/telegram-webhook"
    
    Write-Host "✅ Ngrok запущен!" -ForegroundColor Green
    Write-Host "🌐 Public URL: $publicUrl" -ForegroundColor Cyan
    Write-Host "📨 Webhook URL: $webhookUrl" -ForegroundColor Cyan
    Write-Host "📊 Dashboard: http://localhost:4040" -ForegroundColor Yellow
    
    # Копируем webhook URL в буфер обмена
    $webhookUrl | Set-Clipboard
    Write-Host "📋 Webhook URL скопирован в буфер обмена!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Ошибка получения URL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🛑 Для остановки ngrok закройте это окно или нажмите Ctrl+C" -ForegroundColor Yellow
Read-Host "Нажмите Enter для завершения"
