// ============================================================
// 本機模擬帳號系統
//
// 只使用 localStorage 模擬註冊、登入、Session 與登出。
// 不使用後端 API、資料庫、第三方登入或遠端憑證。
// 密碼雜湊只為避免明文展示，不具備真實帳號系統的安全性。
// ============================================================

const AUTH_MOCK_ACCOUNTS_KEY = 'mock_auth_accounts_v1';
const AUTH_MOCK_SESSION_KEY = 'mock_auth_session_v1';

let authMockMode = 'login';

function authMockEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function authMockHash(value) {
    const text = 'mock-only::' + String(value || '');
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function authMockToken() {
    try {
        const bytes = new Uint8Array(18);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
    }
}

function authMockAccounts() {
    try {
        const raw = localStorage.getItem(AUTH_MOCK_ACCOUNTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.filter(item => item && item.id && item.email) : [];
    } catch (e) {
        return [];
    }
}

function authMockSaveAccounts(list) {
    try {
        localStorage.setItem(AUTH_MOCK_ACCOUNTS_KEY, JSON.stringify(list || []));
        return true;
    } catch (e) {
        return false;
    }
}

function authMockSession() {
    try {
        const raw = localStorage.getItem(AUTH_MOCK_SESSION_KEY);
        const session = raw ? JSON.parse(raw) : null;
        return (session && session.accountId && session.token) ? session : null;
    } catch (e) {
        return null;
    }
}

function authMockCurrentAccount() {
    const session = authMockSession();
    if (!session) return null;
    return authMockAccounts().find(account => account.id === session.accountId) || null;
}

function authMockCreateSession(account) {
    const session = {
        accountId: account.id,
        token: authMockToken(),
        createdAt: Date.now()
    };
    try {
        localStorage.setItem(AUTH_MOCK_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        return null;
    }
    return session;
}

function authMockClearSession() {
    try {
        localStorage.removeItem(AUTH_MOCK_SESSION_KEY);
    } catch (e) { /* ignore */ }
}

function authMockToast(message) {
    if (typeof profileToast === 'function') profileToast(message);
}

function authMockAlert(message, type) {
    const box = document.getElementById('auth-mock-alert');
    if (!box) return;
    box.textContent = message || '';
    box.className = 'auth-mock-alert' + (message ? ' is-on is-' + (type || 'error') : '');
}

function authMockRenderHeader() {
    const button = document.getElementById('header-auth');
    if (!button) return;
    const account = authMockCurrentAccount();
    button.innerHTML =
        '<span class="header-user__icon" data-icon="user" ' +
        'data-icon-size="18" aria-hidden="true"></span>' +
        '<span class="header-user__name">' + authMockEscape(account ? account.name : '登入') + '</span>';
    button.classList.toggle('is-logged-in', !!account);
    button.setAttribute('aria-label', account ? '開啟帳號：' + account.name : '登入或註冊');
    button.title = account ? account.name : '登入 / 註冊';
    if (typeof hydrateIcons === 'function') hydrateIcons(button);
}

function authMockRenderAccount() {
    const account = authMockCurrentAccount();
    if (!account) return false;
    const session = authMockSession();
    const name = document.getElementById('auth-account-name');
    const email = document.getElementById('auth-account-email');
    const avatar = document.getElementById('auth-account-avatar');
    const id = document.getElementById('auth-account-id');
    const created = document.getElementById('auth-account-created');
    const token = document.getElementById('auth-account-token');

    if (name) name.textContent = account.name;
    if (email) email.textContent = account.email;
    if (avatar) avatar.textContent = String(account.name || '?').trim().charAt(0).toUpperCase() || '?';
    if (id) id.textContent = account.id;
    if (created) {
        const date = new Date(account.createdAt || Date.now());
        created.textContent = isNaN(date.getTime()) ? '—' :
            date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }
    if (token) token.textContent = session ? session.token.slice(0, 12) + '…' : '—';
    return true;
}

function authMockShowView(view) {
    const isAccount = view === 'account' && authMockCurrentAccount();
    const target = isAccount ? 'account' : 'form';
    document.querySelectorAll('.auth-mock-view').forEach(node => {
        const on = node.id === 'auth-mock-view-' + target;
        node.classList.toggle('is-on', on);
    });
    const title = document.getElementById('auth-mock-title');
    if (title) title.textContent = isAccount ? '我的帳號' : '登入 / 註冊';
    if (isAccount) authMockRenderAccount();
}

function authMockSetMode(mode) {
    authMockMode = mode === 'register' ? 'register' : 'login';
    const isRegister = authMockMode === 'register';
    const loginTab = document.getElementById('auth-mode-login');
    const registerTab = document.getElementById('auth-mode-register');
    if (loginTab) {
        loginTab.classList.toggle('is-on', !isRegister);
        loginTab.setAttribute('aria-selected', !isRegister ? 'true' : 'false');
    }
    if (registerTab) {
        registerTab.classList.toggle('is-on', isRegister);
        registerTab.setAttribute('aria-selected', isRegister ? 'true' : 'false');
    }

    const nameField = document.getElementById('auth-register-name-field');
    const confirmField = document.getElementById('auth-register-confirm-field');
    if (nameField) nameField.hidden = !isRegister;
    if (confirmField) confirmField.hidden = !isRegister;

    const heroTitle = document.getElementById('auth-mock-hero-title');
    const heroDesc = document.getElementById('auth-mock-hero-desc');
    const submit = document.getElementById('auth-mock-submit');
    const password = document.getElementById('auth-mock-password');
    if (heroTitle) heroTitle.textContent = isRegister ? '建立本機帳號' : '歡迎回來';
    if (heroDesc) {
        heroDesc.textContent = isRegister
            ? '帳號只會保存在此瀏覽器，用於展示登入流程。'
            : '使用本機帳號繼續，資料不會傳送到任何伺服器。';
    }
    if (submit) submit.textContent = isRegister ? '註冊並登入' : '登入';
    if (password) password.setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');
    authMockAlert('');
}

function authMockOpen(view) {
    const account = authMockCurrentAccount();
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    authMockAlert('');
    if (view === 'register' && !account) authMockSetMode('register');
    else if (!account) authMockSetMode('login');
    overlay.classList.add('active');
    authMockShowView(account ? 'account' : 'form');
}

function authMockClose(event) {
    if (event && event.target !== event.currentTarget) return;
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.classList.remove('active');
    authMockAlert('');
}

function authMockReadCredentials() {
    return {
        name: String((document.getElementById('auth-mock-name') || {}).value || '').trim(),
        email: String((document.getElementById('auth-mock-email') || {}).value || '').trim().toLowerCase(),
        password: String((document.getElementById('auth-mock-password') || {}).value || ''),
        confirm: String((document.getElementById('auth-mock-confirm') || {}).value || '')
    };
}

function authMockClearForm() {
    ['auth-mock-name', 'auth-mock-email', 'auth-mock-password', 'auth-mock-confirm'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

function authMockSubmit() {
    const input = authMockReadCredentials();
    const accounts = authMockAccounts();

    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        authMockAlert('請輸入有效的 Email。');
        return;
    }
    if (input.password.length < 6) {
        authMockAlert('密碼至少需要 6 個字元。');
        return;
    }

    if (authMockMode === 'register') {
        if (!input.name) {
            authMockAlert('請輸入姓名或帳號名稱。');
            return;
        }
        if (input.password !== input.confirm) {
            authMockAlert('兩次輸入的密碼不一致。');
            return;
        }
        if (accounts.some(account => account.email === input.email)) {
            authMockAlert('這個 Email 已經註冊。');
            return;
        }

        const account = {
            id: 'mock_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            name: input.name.slice(0, 30),
            email: input.email,
            passwordHash: authMockHash(input.password),
            provider: 'local-mock',
            createdAt: Date.now()
        };
        accounts.push(account);
        if (!authMockSaveAccounts(accounts) || !authMockCreateSession(account)) {
            authMockAlert('本機儲存失敗，請檢查瀏覽器設定。');
            return;
        }
        authMockClearForm();
        authMockRenderHeader();
        authMockShowView('account');
        authMockToast('註冊成功，已登入');
        return;
    }

    const account = accounts.find(item => item.email === input.email);
    if (!account || account.passwordHash !== authMockHash(input.password)) {
        authMockAlert('Email 或密碼不正確。');
        return;
    }
    if (!authMockCreateSession(account)) {
        authMockAlert('無法建立登入 Session。');
        return;
    }
    authMockClearForm();
    authMockRenderHeader();
    authMockShowView('account');
    authMockToast('已登入，' + account.name);
}

function authMockLogout() {
    authMockClearSession();
    authMockRenderHeader();
    authMockSetMode('login');
    authMockShowView('form');
    authMockToast('已登出');
}

function initAuth() {
    authMockRenderHeader();

    const form = document.getElementById('auth-mock-form');
    if (form) {
        form.addEventListener('submit', event => {
            event.preventDefault();
            authMockSubmit();
        });
    }

    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.addEventListener('click', event => {
            if (event.target === overlay) authMockClose();
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const panel = document.getElementById('auth-overlay');
        if (panel && panel.classList.contains('active')) authMockClose();
    });
}
