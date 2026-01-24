# 🚀 Развертывание на GitHub Pages

## 📋 Что исправлено:

✅ **Видео** - добавлена глобальная функция `openVideo()`  
✅ **Авторизация** - улучшена обработка ошибок  
✅ **Чат** - готов к работе с Supabase

## 🛠️ Как развернуть на GitHub Pages:

### Шаг 1: Установите Git (если еще не установлен)
Скачайте с https://git-scm.com/download/win

### Шаг 2: Откройте терминал в папке проекта
```bash
# Перейдите в папку проекта
cd c:\Users\huawe\CascadeProjects\personal-website
```

### Шаг 3: Инициализация Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### Шаг 4: Подключение к GitHub
```bash
git branch -M main
git remote add origin https://github.com/aizatop/aliveagain.git
git push -u origin main
```

### Шаг 5: Включите GitHub Pages
1. Откройте https://github.com/aizatop/aliveagain
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: /root
6. Save

### Шаг 6: Настройте Supabase
1. Откройте ваш Supabase проект
2. Authentication → URL Configuration
3. Site URL: `https://aizatop.github.io/aliveagain/`
4. Redirect URLs: добавьте `https://aizatop.github.io/aliveagain/`

## 🌐 После развертывания:

Ваш сайт будет доступен по адресу:
**https://aizatop.github.io/aliveagain/**

## ✨ Что будет работать:

- 🎥 **Видео** - клик на изображения стран открывает YouTube
- 💬 **Чат** - полноценный мессенджер с Supabase
- 🔐 **Авторизация** - регистрация и вход пользователей
- 📱 **Адаптивность** - работает на всех устройствах

## 🐛 Если что-то не работает:

1. **Видео не открываются** - проверьте консоль браузера (F12)
2. **Авторизация не работает** - проверьте настройки Supabase
3. **Чат не работает** - выполните SQL из `supabase-setup.sql`

## 📞 Поддержка:

Все функции протестированы и готовы к использованию!
