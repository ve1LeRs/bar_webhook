#!/bin/bash

# Скрипт для настройки webhook в Telegram
# Использование: ./setup-webhook.sh <BOT_TOKEN> <WEBHOOK_URL>

set -e

# Проверка аргументов
if [ $# -ne 2 ]; then
    echo "❌ Использование: $0 <BOT_TOKEN> <WEBHOOK_URL>"
    echo "   Пример: $0 123456789:ABCdefGHIjklMNOpqrsTUVwxyz https://your-domain.com/telegram-webhook"
    exit 1
fi

BOT_TOKEN=$1
WEBHOOK_URL=$2

echo "🤖 Настройка webhook для Telegram бота"
echo "📍 URL: $WEBHOOK_URL"
echo "─".repeat(50)

# Проверка доступности webhook URL
echo "🔍 Проверка доступности webhook URL..."
if curl -s --head "$WEBHOOK_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ Webhook URL доступен"
else
    echo "⚠️  Webhook URL может быть недоступен, но продолжаем..."
fi

# Настройка webhook
echo "📡 Настройка webhook в Telegram..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "📨 Ответ от Telegram:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Проверка успешности
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook успешно настроен!"
else
    echo "❌ Ошибка настройки webhook"
    exit 1
fi

# Получение информации о webhook
echo ""
echo "📋 Информация о webhook:"
WEBHOOK_INFO=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
echo "$WEBHOOK_INFO" | jq '.' 2>/dev/null || echo "$WEBHOOK_INFO"

echo ""
echo "🎉 Настройка завершена!"
echo "💡 Теперь ваш бот будет получать уведомления на $WEBHOOK_URL"
