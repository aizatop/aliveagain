-- Удаление таблицы, если она существует (для повторного запуска скрипта)
DROP TABLE IF EXISTS messages;

-- Создание таблицы для сообщений
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT DEFAULT 'user'
);

-- Включение Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Создание политики для чтения сообщений
CREATE POLICY "Allow read access" ON messages
    FOR SELECT USING (true);

-- Создание политики для вставки сообщений
CREATE POLICY "Allow insert messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Создание политики для обновления сообщений
CREATE POLICY "Allow update messages" ON messages
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Создание политики для удаления сообщений
CREATE POLICY "Allow delete messages" ON messages
    FOR DELETE USING (auth.uid()::text = user_id);

-- Включение Realtime для таблицы
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
