# Развертывание на GitHub Pages

## Что нужно сделать для правильной работы мессенджера и авторизации:

### 1. Настройка Supabase

1. **Получите правильный API ключ:**
   - Зайдите в ваш Supabase проект
   - Settings → API
   - Скопируйте "anon public" ключ
   - Замените `YourActualKeyHere` в `script.js` на ваш ключ

2. **Создайте таблицу сообщений:**
   - Откройте SQL Editor в Supabase
   - Выполните SQL из файла `supabase-setup.sql`

3. **Настройте аутентификацию:**
   - Authentication → Settings
   - Включите "Enable email confirmations"
   - Настройте "Site URL" как `https://yourusername.github.io/repository-name`

### 2. Развертывание на GitHub Pages

1. **Создайте репозиторий:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/aizatop/aliveagain.git
   git push -u origin main
   ```

2. **Включите GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root

3. **Обновите CORS в Supabase:**
   - Authentication → URL Configuration
   - Добавьте ваш GitHub Pages URL в "Redirect URLs"
   - Добавьте `https://yourusername.github.io/*` в "Additional Redirect URLs"

### 3. Проверка работы

После развертывания:
1. Откройте сайт по GitHub Pages URL
2. Попробуйте зарегистрироваться с новым email
3. Проверьте работу мессенджера

### 4. Резервный режим

Если Supabase недоступен, сайт автоматически переключится в офлайн-режим:
- Авторизация работает через localStorage
- Сообщения сохраняются локально
- Функциональность ограничена

### 5. Возможные проблемы

**Проблема:** CORS ошибка
**Решение:** Добавьте GitHub Pages URL в CORS настройки Supabase

**Проблема:** Аутентификация не работает
**Решение:** Проверьте правильность API ключа и URL редиректа

**Проблема:** Сообщения не сохраняются
**Решение:** Убедитесь что таблица `messages` создана и включен Realtime
