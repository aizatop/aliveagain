# AliveAgain - Инструкция по настройке Supabase Backend

## 📋 Содержание
1. [Что такое Supabase](#что-такое-supabase)
2. [Создание проекта](#создание-проекта)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Интеграция с фронтенд](#интеграция-с-фронтенд)
5. [Примеры API запросов](#примеры-api-запросов)
6. [Развертывание](#развертывание)

---

## Что такое Supabase

**Supabase** - это открытая альтернатива Firebase, которая предоставляет:
- 🗄️ PostgreSQL базу данных
- 🔐 Аутентификацию пользователей
- 📡 Real-time API
- 💾 Хранилище файлов
- 🔔 Push-уведомления

Идеально подходит для нашего проекта AliveAgain!

---

## Создание проекта

### Шаг 1: Регистрация на Supabase
1. Перейдите на [https://supabase.com](https://supabase.com)
2. Нажмите "Sign Up" (Зарегистрироваться)
3. Создайте аккаунт через GitHub или Email
4. Подтвердите email

### Шаг 2: Создание нового проекта
1. В панели управления нажмите "New Project"
2. Заполните данные:
   - **Project Name**: `AliveAgain`
   - **Database Password**: Придумайте безопасный пароль
   - **Region**: Выберите географически близкий регион (например, Europe West)
3. Нажмите "Create new project"
4. Дождитесь инициализации проекта (5-10 минут)

### Шаг 3: Получение учетных данных
После создания проекта перейдите в:
- **Settings** → **API**

Скопируйте:
- `Project URL` - URL вашего Supabase проекта
- `anon public` - публичный ключ для клиента
- `service_role` - секретный ключ (только для сервера)

---

## Настройка базы данных

### Таблица: users (Пользователи)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  age INT,
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица: visits (Посещения)
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country VARCHAR(100) NOT NULL,
  visited_at TIMESTAMP DEFAULT NOW(),
  duration_minutes INT,
  impressions TEXT
);
```

### Таблица: friends (Друзья)
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

### Таблица: messages (Сообщения)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
```

### Создание таблиц в Supabase:
1. Откройте **SQL Editor** в левой панели
2. Скопируйте SQL код выше
3. Нажмите "Run" для каждой таблицы

---

## Интеграция с фронтенд

### Шаг 1: Установка Supabase клиента
```bash
npm install @supabase/supabase-js
```

### Шаг 2: Создание файла конфигурации
Создайте файл `supabase-config.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

**⚠️ ВАЖНО**: Никогда не коммитьте реальные ключи в Git! Используйте `.env` файлы.

### Шаг 3: Создание файла `.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Шаг 4: Обновление конфига для Vite
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.env': process.env
  }
})
```

---

## Примеры API запросов

### 1. Аутентификация - Регистрация
```javascript
import { supabase } from './supabase-config.js'

async function signUp(email, password, username) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    
    if (error) throw error
    
    // Создаем профиль пользователя
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { id: data.user.id, email: email, username: username }
      ])
    
    if (profileError) throw profileError
    
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 2. Аутентификация - Вход
```javascript
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) throw error
    return { success: true, session: data.session }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 3. Получение профиля пользователя
```javascript
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { success: true, profile: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4. Обновление профиля
```javascript
async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return { success: true, profile: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 5. Записать посещение страны
```javascript
async function recordVisit(userId, country, duration) {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert([
        { 
          user_id: userId, 
          country: country,
          duration_minutes: duration
        }
      ])
      .select()
    
    if (error) throw error
    return { success: true, visit: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 6. Получить друзей пользователя
```javascript
async function getUserFriends(userId) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, friends(username, avatar_url)')
      .eq('user_id', userId)
      .eq('status', 'accepted')
    
    if (error) throw error
    return { success: true, friends: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 7. Отправить сообщение
```javascript
async function sendMessage(senderId, recipientId, content) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          content: content
        }
      ])
      .select()
    
    if (error) throw error
    return { success: true, message: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 8. Получить сообщения в реальном времени (Real-time)
```javascript
async function subscribeToMessages(userId) {
  const subscription = supabase
    .from(`messages:recipient_id=eq.${userId}`)
    .on('*', payload => {
      console.log('Новое сообщение:', payload.new)
      // Обновляем UI
    })
    .subscribe()
  
  return subscription
}
```

---

## Развертывание

### Вариант 1: Развертывание на Vercel
```bash
# 1. Инициализируем Git репозиторий
git init
git add .
git commit -m "Initial commit"

# 2. Загружаем на GitHub
git remote add origin https://github.com/ваше-имя/AliveAgain.git
git push -u origin main

# 3. На Vercel импортируем репозиторий
# https://vercel.com/import

# 4. Добавляем переменные окружения
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Вариант 2: Развертывание на Netlify
```bash
# 1. Установим Netlify CLI
npm install -g netlify-cli

# 2. Логируемся
netlify login

# 3. Деплоим проект
netlify deploy --prod
```

---

## Безопасность

### Row Level Security (RLS) - Защита данных
```sql
-- Только пользователь может видеть свой профиль
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Только пользователь может обновлять свой профиль
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Только владелец может видеть свои сообщения
CREATE POLICY "Users can view own messages"
ON messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```

### Включение RLS
1. В **SQL Editor** выполните команды выше
2. В таблице перейдите на вкладку **Auth**
3. Включите "Enable RLS"

---

## Полезные ссылки

- 📚 [Документация Supabase](https://supabase.com/docs)
- 🔐 [Authentication](https://supabase.com/docs/guides/auth)
- 🗄️ [Database](https://supabase.com/docs/guides/database)
- 🚀 [Realtime](https://supabase.com/docs/guides/realtime)
- 💾 [Storage](https://supabase.com/docs/guides/storage)

---

## Советы по разработке

✅ **DO:**
- Используйте переменные окружения для ключей
- Включите Row Level Security для защиты данных
- Создавайте индексы на часто используемые колонки
- Используйте Real-time для интерактивных функций

❌ **DON'T:**
- Не коммитьте секретные ключи
- Не используйте service_role ключ на клиенте
- Не обходите RLS политики
- Не доверяйте валидации только на клиенте

---

## Вопросы и поддержка

Если возникли вопросы:
1. Проверьте [документацию Supabase](https://supabase.com/docs)
2. Посетите [Community Forum](https://github.com/supabase/supabase/discussions)
3. Откройте issue на [GitHub](https://github.com/supabase/supabase/issues)

---

**AliveAgain © 2026** | Powered by Supabase
