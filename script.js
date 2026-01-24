// Инициализация Supabase
const supabaseUrl = 'https://wjtxswzeibngvwaanusd.supabase.co';
const supabaseKey = 'sb_publishable_zuu5cnEHd9vosElaR1wGvw_432g_6Ih';

let supabase;
try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized successfully');
} catch (error) {
    console.error('Supabase initialization failed:', error);
    supabase = null;
}

// Глобальные переменные
let currentUser = null;
let messages = [];
let messageSubscription = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Проверка авторизации
    checkAuthStatus();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Загрузка сообщений
    loadMessages();
}

function setupEventListeners() {
    // Кнопка авторизации
    document.getElementById('auth-btn').addEventListener('click', showAuthModal);
    
    // Форма авторизации
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    
    // Отправка сообщения
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Закрытие модального окна
    document.getElementById('auth-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });
    
    // Плавная прокрутка
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Функции авторизации
async function checkAuthStatus() {
    try {
        // Проверка сессии Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
            currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.email.split('@')[0],
                avatar: session.user.user_metadata?.avatar || null
            };
        } else {
            // Резервный вариант - localStorage
            const user = localStorage.getItem('currentUser');
            if (user) {
                currentUser = JSON.parse(user);
            }
        }
        
        if (currentUser) {
            updateAuthUI();
            enableMessenger();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        
        // Резервный вариант
        const user = localStorage.getItem('currentUser');
        if (user) {
            currentUser = JSON.parse(user);
            updateAuthUI();
            enableMessenger();
        }
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('auth-form').reset();
}

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Attempting auth with:', email);
    
    // Всегда работаем в офлайн режиме для надежности
    const user = {
        id: Date.now().toString(),
        email: email,
        name: email.split('@')[0],
        avatar: null
    };
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    updateAuthUI();
    enableMessenger();
    closeAuthModal();
    
    addSystemMessage(`${user.name} присоединился к чату`);
    
    // Показываем уведомление
    alert(`Добро пожаловать, ${user.name}! Вы вошли в офлайн режиме.`);
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const currentUserSpan = document.getElementById('current-user');
    const userStatus = document.getElementById('user-status');
    
    if (currentUser) {
        authBtn.textContent = 'Выйти';
        authBtn.onclick = logout;
        currentUserSpan.textContent = currentUser.name;
        userStatus.textContent = 'В сети';
        userStatus.style.color = '#4CAF50';
    } else {
        authBtn.textContent = 'Войти';
        authBtn.onclick = showAuthModal;
        currentUserSpan.textContent = 'Гость';
        userStatus.textContent = 'Не в сети';
        userStatus.style.color = '#999';
    }
}

async function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        try {
            // Выход из Supabase Auth
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        disableMessenger();
        addSystemMessage('Пользователь вышел из чата');
    }
}

// Функции мессенджера
function enableMessenger() {
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    
    // Подписка на новые сообщения
    subscribeToMessages();
}

function disableMessenger() {
    document.getElementById('message-input').disabled = true;
    document.getElementById('send-btn').disabled = true;
    
    // Отписка от сообщений
    if (messageSubscription) {
        messageSubscription.unsubscribe();
        messageSubscription = null;
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentUser) return;
    
    const message = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        user_name: currentUser.name,
        text: messageText,
        timestamp: new Date().toISOString(),
        type: 'user'
    };
    
    try {
        // Попытка сохранить в Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('messages')
                .insert([message])
                .select();
            
            if (error) {
                console.log('Supabase error, using local storage:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase not available');
        }
    } catch (error) {
        console.log('Saving to local storage');
        // Сохранение в localStorage как резервный вариант
        let savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        savedMessages.push(message);
        localStorage.setItem('chatMessages', JSON.stringify(savedMessages.slice(-100))); // Храним последние 100 сообщений
    }
    
    messageInput.value = '';
    addMessageToUI(message);
    messages.push(message);
}

async function loadMessages() {
    try {
        // Сначала загружаем из localStorage
        const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        savedMessages.forEach(message => addMessageToUI(message));
        messages = savedMessages;
        
        // Затем пробуем загрузить из Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('timestamp', { ascending: true })
                .limit(50);
            
            if (error) {
                console.log('Loading from Supabase failed, using local storage:', error);
                return;
            }
            
            if (data && data.length > 0) {
                // Очищаем и добавляем сообщения из Supabase
                document.getElementById('chat-messages').innerHTML = '';
                data.forEach(message => addMessageToUI(message));
                messages = data;
                
                // Сохраняем в localStorage как резерв
                localStorage.setItem('chatMessages', JSON.stringify(data));
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        
        // Загрузка из localStorage как резервный вариант
        const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        savedMessages.forEach(message => addMessageToUI(message));
        messages = savedMessages;
    }
}

function subscribeToMessages() {
    messageSubscription = supabase
        .channel('public:messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                const newMessage = payload.new;
                if (newMessage.user_id !== currentUser?.id) {
                    addMessageToUI(newMessage);
                    messages.push(newMessage);
                }
            }
        )
        .subscribe();
}

function addMessageToUI(message) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.user_id === currentUser?.id ? 'own' : ''}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-bubble">
            ${message.type === 'system' ? 
                `<em>${message.text}</em>` : 
                message.text
            }
        </div>
        ${message.type !== 'system' ? 
            `<div class="message-time">${message.user_name} • ${time}</div>` : 
            ''
        }
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
    const message = {
        id: Date.now().toString(),
        text: text,
        timestamp: new Date().toISOString(),
        type: 'system'
    };
    
    addMessageToUI(message);
    
    // Сохранение системного сообщения
    try {
        supabase
            .from('messages')
            .insert([message])
            .then(() => {
                messages.push(message);
            })
            .catch(() => {
                messages.push(message);
                localStorage.setItem('chatMessages', JSON.stringify(messages));
            });
    } catch (error) {
        messages.push(message);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
}

// Функции для стран и видео
function openVideo(url) {
    window.open(url, '_blank');
}

function scrollToCountries() {
    document.getElementById('countries').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Дополнительные функции
function toggleEmojiPicker() {
    // Простая реализация эмодзи
    const emojis = ['✈️', '🌍', '🏛️', '🗼', '🎭', '🍝', '🍷', '☕', '🌸', '🗾'];
    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-picker';
    emojiContainer.style.cssText = `
        position: absolute;
        bottom: 70px;
        right: 20px;
        background: white;
        border: 1px solid #e8ddd0;
        border-radius: 10px;
        padding: 10px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
    
    emojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.textContent = emoji;
        emojiBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            transition: background 0.2s;
        `;
        emojiBtn.onmouseover = () => emojiBtn.style.background = '#f5e6d3';
        emojiBtn.onmouseout = () => emojiBtn.style.background = 'none';
        emojiBtn.onclick = () => {
            const input = document.getElementById('message-input');
            input.value += emoji;
            input.focus();
            document.body.removeChild(emojiContainer);
        };
        emojiContainer.appendChild(emojiBtn);
    });
    
    document.body.appendChild(emojiContainer);
    
    // Закрытие при клике вне
    setTimeout(() => {
        document.addEventListener('click', function closeEmoji(e) {
            if (!emojiContainer.contains(e.target)) {
                if (document.body.contains(emojiContainer)) {
                    document.body.removeChild(emojiContainer);
                }
                document.removeEventListener('click', closeEmoji);
            }
        });
    }, 100);
}

function showRegisterForm() {
    // Простая регистрация (имитация)
    const email = prompt('Введите ваш email для регистрации:');
    if (email) {
        alert('Регистрация успешна! Теперь вы можете войти.');
        document.getElementById('email').value = email;
        document.getElementById('password').focus();
    }
}

// Параллакс эффект при прокрутке
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-background');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Изменение навбара при прокрутке
    const navbar = document.querySelector('.navbar');
    if (scrolled > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 5px 30px rgba(107, 93, 84, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(107, 93, 84, 0.1)';
    }
});

// Анимация появления элементов при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдение за карточками стран
document.addEventListener('DOMContentLoaded', function() {
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});

// Обработка ошибок Supabase
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('Supabase')) {
        console.warn('Supabase временно недоступен, используем локальное хранилище');
        event.preventDefault();
    }
});

// Резервное сохранение сообщений в localStorage
setInterval(function() {
    if (messages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(messages.slice(-50))); // Сохраняем последние 50 сообщений
    }
}, 30000); // Каждые 30 секунд
