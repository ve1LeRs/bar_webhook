# Скрипт для автоматической настройки развертывания на Render
Write-Host "Настройка развертывания на Render.com" -ForegroundColor Green
Write-Host "=" * 50

# Проверяем Git
Write-Host "Проверка Git репозитория..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Есть несохраненные изменения:" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor White
        $commit = Read-Host "Хотите закоммитить изменения? (y/n)"
        if ($commit -eq "y" -or $commit -eq "Y") {
            $message = Read-Host "Введите сообщение коммита (или Enter для 'Update for Render deploy')"
            if (-not $message) { $message = "Update for Render deploy" }
            git add .
            git commit -m $message
            Write-Host "Изменения закоммичены" -ForegroundColor Green
        }
    }
    
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl) {
        Write-Host "Git репозиторий настроен: $remoteUrl" -ForegroundColor Green
    } else {
        Write-Host "Git remote не настроен" -ForegroundColor Red
        Write-Host "Настройте GitHub репозиторий:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/ваш-username/bar-webhook.git" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "Ошибка проверки Git: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Проверяем package.json
Write-Host "`nПроверка package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "package.json найден" -ForegroundColor Green
    Write-Host "   Название: $($package.name)" -ForegroundColor White
    Write-Host "   Версия: $($package.version)" -ForegroundColor White
    Write-Host "   Start script: $($package.scripts.start)" -ForegroundColor White
} else {
    Write-Host "package.json не найден" -ForegroundColor Red
    exit 1
}

# Проверяем server.js
Write-Host "`nПроверка server.js..." -ForegroundColor Yellow
if (Test-Path "server.js") {
    Write-Host "server.js найден" -ForegroundColor Green
} else {
    Write-Host "server.js не найден" -ForegroundColor Red
    exit 1
}

# Проверяем переменные окружения
Write-Host "`nПроверка переменных окружения..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host ".env файл найден" -ForegroundColor Green
    Write-Host "Не забудьте добавить переменные в Render Dashboard!" -ForegroundColor Yellow
} else {
    Write-Host ".env файл не найден" -ForegroundColor Yellow
    Write-Host "Создайте .env файл с переменными:" -ForegroundColor White
    Write-Host "   TELEGRAM_BOT_TOKEN=ваш_токен" -ForegroundColor White
    Write-Host "   TELEGRAM_CHAT_ID=ваш_chat_id" -ForegroundColor White
    Write-Host "   FIREBASE_PROJECT_ID=ваш_project_id" -ForegroundColor White
    Write-Host "   FIREBASE_CLIENT_EMAIL=ваш_client_email" -ForegroundColor White
    Write-Host "   FIREBASE_PRIVATE_KEY=ваш_private_key" -ForegroundColor White
}

# Инструкции по развертыванию
Write-Host "`nИнструкции по развертыванию на Render:" -ForegroundColor Green
Write-Host "1. Откройте https://render.com" -ForegroundColor White
Write-Host "2. Войдите через GitHub" -ForegroundColor White
Write-Host "3. Нажмите 'New +' -> 'Web Service'" -ForegroundColor White
Write-Host "4. Подключите ваш GitHub репозиторий" -ForegroundColor White
Write-Host "5. Настройте параметры:" -ForegroundColor White
Write-Host "   - Name: bar-webhook" -ForegroundColor White
Write-Host "   - Runtime: Node" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor White
Write-Host "   - Start Command: npm start" -ForegroundColor White
Write-Host "   - Plan: Free" -ForegroundColor White
Write-Host "6. Добавьте переменные окружения в разделе 'Environment Variables'" -ForegroundColor White
Write-Host "7. Нажмите 'Create Web Service'" -ForegroundColor White

# Проверяем готовность к push
Write-Host "`nПроверка готовности к push..." -ForegroundColor Yellow
try {
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "Все изменения сохранены" -ForegroundColor Green
        
        $push = Read-Host "Хотите запушить изменения в GitHub? (y/n)"
        if ($push -eq "y" -or $push -eq "Y") {
            git push origin main
            Write-Host "Изменения отправлены в GitHub" -ForegroundColor Green
        }
    } else {
        Write-Host "Есть несохраненные изменения" -ForegroundColor Yellow
        Write-Host $status -ForegroundColor White
    }
} catch {
    Write-Host "Ошибка при push: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nГотово! Теперь следуйте инструкциям выше для развертывания на Render." -ForegroundColor Green
Write-Host "Подробная инструкция: RENDER_DEPLOY_GUIDE.md" -ForegroundColor Cyan

Read-Host "Нажмите Enter для завершения"