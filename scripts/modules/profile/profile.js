// ============================================================
// 公開設定頁（無登入、無帳號、無雲端）
//
// 課表資料來自 data/demo-data.js；班級選擇與偏好只存於本機。
// 本檔提供設定清單、班級選擇器、子頁面導覽與共用 Toast。
// ============================================================

const DEMO_CLASS_STORAGE_KEY = 'demo_selected_class_v1';

let profileView = 'home';
let profileDetailKey = '';
let profileCurrentMore = null;
let profileViewStack = [];
let profileClassesLoaded = false;
let profileClassPick = '';
let profileClassPickCustom = '';
let profileToastTimer = null;

function profileEscape(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function profileVal(id) {
    const node = document.getElementById(id);
    return node ? String(node.value || '').trim() : '';
}

function profileToast(message) {
    const node = document.getElementById('profile-toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('is-on');
    clearTimeout(profileToastTimer);
    profileToastTimer = setTimeout(() => node.classList.remove('is-on'), 2200);
}

/* ================= 示範班級狀態 ================= */

function demoLoadClassesSync() {
    if (typeof DB === 'undefined' || typeof DB.setMemory !== 'function') return null;
    const demo = (typeof window !== 'undefined' && window.DEMO_DATA) ? window.DEMO_DATA.classes : null;
    if (demo) DB.setMemory('classes', demo);
    return DB.get('classes') || null;
}

function demoGetClassList() {
    let doc = (typeof DB !== 'undefined' && typeof DB.get === 'function') ? DB.get('classes') : null;
    if (!doc) doc = demoLoadClassesSync();
    return (typeof dbClassArray === 'function') ? dbClassArray(doc) : [];
}

function demoClassCode(cls) {
    return cls && cls.code ? String(cls.code).trim().toUpperCase() : '';
}

function demoFindClass(id) {
    return demoGetClassList().find(cls => cls.id === id) || null;
}

function demoStoredClassChoice() {
    let raw = '';
    try {
        raw = localStorage.getItem(DEMO_CLASS_STORAGE_KEY) || '';
    } catch (e) {
        raw = '';
    }
    if (!raw) return null;
    if (raw.indexOf('custom:') === 0) {
        return { reason: 'custom', classId: raw, className: raw.slice(7) };
    }
    const cls = demoFindClass(raw);
    return cls ? { reason: 'selected', classId: cls.id, className: cls.name } : null;
}

function demoSetStoredClassId(value) {
    try {
        if (value) localStorage.setItem(DEMO_CLASS_STORAGE_KEY, String(value));
        else localStorage.removeItem(DEMO_CLASS_STORAGE_KEY);
    } catch (e) {
        profileToast('無法儲存班級設定');
    }
}

function demoResolveClassInput(raw) {
    const input = String(raw || '').trim();
    const key = input.replace(/[\s-]/g, '').toUpperCase();
    if (!key) return null;
    return demoGetClassList().find(cls => {
        const id = String(cls.id || '').replace(/[\s-]/g, '').toUpperCase();
        const code = demoClassCode(cls).replace(/[\s-]/g, '');
        const name = String(cls.name || '').replace(/\s/g, '').toUpperCase();
        return key === id || key === code || key === name || input === cls.name;
    }) || null;
}

function demoResolveSchedule() {
    demoLoadClassesSync();
    const doc = (typeof DB !== 'undefined') ? DB.get('classes') : null;
    const list = demoGetClassList();
    const stored = demoStoredClassChoice();
    const defaultId = (doc && doc.defaultClassId) || (list[0] && list[0].id) || '';
    const fallbackUrl = (doc && doc.defaultSchedule) || 'demo:timetable';

    if (stored && stored.reason === 'custom') {
        return {
            reason: 'custom',
            classId: stored.classId,
            className: stored.className || '自訂班級',
            url: fallbackUrl,
            isDefault: true
        };
    }

    const cls = (stored && stored.classId && demoFindClass(stored.classId))
        || (defaultId && demoFindClass(defaultId))
        || list[0]
        || null;

    if (!cls) {
        return { reason: 'unselected', classId: '', className: '', url: fallbackUrl, isDefault: true };
    }

    return {
        reason: 'selected',
        classId: cls.id,
        className: cls.name,
        url: cls.schedule || fallbackUrl,
        isDefault: !cls.schedule
    };
}

/* ================= 共用畫面元件 ================= */

function profileListCardHtml(rows, attrs) {
    return '<section class="ios-card"' + (attrs ? ' ' + attrs : '') + '>' +
        '<div class="ios-list">' + rows.join('') + '</div></section>';
}

function profileInfoRowHtml(label, value) {
    return '<div class="ios-row" role="note">' +
        '<span class="ios-row__body"><span class="ios-row__label">' + profileEscape(label) + '</span></span>' +
        (value ? '<span class="ios-row__value">' + profileEscape(value) + '</span>' : '') +
        '</div>';
}

function profileNavRowHtml(label, sub, handler, danger) {
    return '<button class="ios-row' + (danger ? ' is-danger' : '') + '" type="button" onclick="' + handler + '">' +
        '<span class="ios-row__body"><span class="ios-row__label">' + profileEscape(label) + '</span>' +
        (sub ? '<span class="ios-row__sub">' + profileEscape(sub) + '</span>' : '') + '</span>' +
        (danger ? '' : '<span class="ios-row__chevron" aria-hidden="true"></span>') +
        '</button>';
}

function profileChoiceRowHtml(label, on, handler) {
    return '<button class="ios-choice' + (on ? ' is-on' : '') + '" type="button" ' +
        'role="radio" aria-checked="' + (on ? 'true' : 'false') + '" onclick="' + handler + '">' +
        '<span class="ios-choice__label">' + profileEscape(label) + '</span>' +
        '<span class="ios-choice__mark" data-icon="check" data-icon-size="12"></span>' +
        '</button>';
}

function profileStatHtml(label, value, id) {
    return '<div class="detail-stat">' +
        '<span class="detail-stat__k">' + profileEscape(label) + '</span>' +
        '<span class="detail-stat__v"' + (id ? ' id="' + id + '"' : '') + '>' +
        profileEscape(value == null ? '—' : value) + '</span></div>';
}

function profileFieldHtml(id, label, type, placeholder, value) {
    return '<div class="detail-field">' +
        '<label class="detail-field__label" for="' + id + '">' + profileEscape(label) + '</label>' +
        '<input class="detail-input" id="' + id + '" type="' + type + '" placeholder="' +
        profileEscape(placeholder || '') + '" value="' + profileEscape(value || '') + '">' +
        '</div>';
}

function profileSwitchRowHtml(id, label, desc, on, handler) {
    return '<div class="detail-row">' +
        '<span class="detail-row__body">' +
        '<span class="detail-row__label">' + profileEscape(label) + '</span>' +
        '<span class="detail-row__desc">' + profileEscape(desc) + '</span>' +
        '</span>' +
        '<button class="ios-switch' + (on ? ' is-on' : '') + '" type="button" id="' + id + '" ' +
        'role="switch" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' +
        profileEscape(label) + '" onclick="' + handler + '"></button>' +
        '</div>';
}

/* ================= 頂部設定入口 ================= */

function renderProfileHeader() {
    const btn = document.getElementById('header-user');
    if (!btn) return;
    btn.innerHTML =
        '<span class="header-user__icon" data-icon="sliders" data-icon-size="18" aria-hidden="true"></span>' +
        '<span class="header-user__name">設定</span>';
    btn.setAttribute('aria-label', '開啟設定');
    btn.title = '設定';
    btn.classList.remove('is-logged-in');
    if (typeof hydrateIcons === 'function') hydrateIcons(btn);
}

/* ================= 面板與子頁面 ================= */

const PROFILE_VIEW_NODES = {
    home: 'profile-view-home',
    class: 'profile-view-class',
    detail: 'profile-view-detail'
};

const PROFILE_VIEW_TITLES = {
    home: '設定',
    class: '班級與課表'
};

function profileShowView(view, title) {
    profileView = view;

    if (view !== 'home' && typeof profileResetSettingsSearch === 'function') {
        profileResetSettingsSearch();
    }

    Object.keys(PROFILE_VIEW_NODES).forEach(key => {
        const node = document.getElementById(PROFILE_VIEW_NODES[key]);
        if (!node) return;
        node.classList.toggle('is-on', key === view);
        node.classList.toggle('active', key === view);
    });

    const titleText = title || PROFILE_VIEW_TITLES[view] || '';
    const topTitle = document.getElementById('profile-topbar-title');
    if (topTitle) topTitle.textContent = titleText;

    const isSubPage = view === 'detail';
    const subPage = document.getElementById('profile-subpage');
    if (subPage) {
        subPage.classList.toggle('is-on', isSubPage);
        subPage.setAttribute('aria-hidden', isSubPage ? 'false' : 'true');
    }

    const subTitle = document.getElementById('subpage-title-text');
    if (subTitle) subTitle.textContent = titleText;

    const badge = document.getElementById('subpage-title-badge');
    if (badge) {
        const badgeText = (view === 'detail' && profileDetailKey)
            ? String((PROFILE_DETAIL_PAGES[profileDetailKey] || {}).badge || '')
            : '';
        badge.textContent = badgeText;
        badge.hidden = !badgeText;
    }

    const subMore = document.getElementById('subpage-more');
    if (subMore) {
        subMore.style.display =
            (isSubPage && typeof profileCurrentMore === 'function') ? 'flex' : 'none';
    }

    const back = document.getElementById('profile-back');
    if (back) back.style.display = (!isSubPage && view === 'class') ? 'flex' : 'none';

    const close = document.getElementById('profile-close');
    if (close) close.style.display = isSubPage ? 'none' : 'flex';

    const scroll = document.getElementById('profile-scroll');
    if (scroll) scroll.scrollTop = 0;
    const subBody = document.getElementById('subpage-body');
    if (subBody) subBody.scrollTop = 0;
}

function profilePushView(view, options) {
    const opts = options || {};
    profileViewStack.push({
        view: profileView,
        detailKey: profileDetailKey,
        more: profileCurrentMore
    });
    profileCurrentMore = typeof opts.more === 'function' ? opts.more : null;
    if (view === 'detail') {
        profileDetailKey = opts.detailKey || '';
        profileRenderDetail(profileDetailKey);
    }
    profileShowView(view, opts.title);
}

function profilePushDetail(key) {
    const page = PROFILE_DETAIL_PAGES[key];
    if (!page) return;
    profilePushView('detail', { title: page.title, detailKey: key, more: page.more });
}

function profileMoreAction() {
    if (typeof profileCurrentMore === 'function') profileCurrentMore();
}

function profileBackView() {
    if (profileViewStack.length) {
        const prev = profileViewStack.pop();
        profileCurrentMore = prev.more || null;
        profileDetailKey = prev.detailKey || '';
        let title = '';
        if (prev.view === 'detail') {
            profileRenderDetail(profileDetailKey);
            title = (PROFILE_DETAIL_PAGES[profileDetailKey] || {}).title || '';
        } else {
            title = PROFILE_VIEW_TITLES[prev.view] || '';
        }
        profileShowView(prev.view, title);
        return;
    }
    profileShowView('home');
}

function openProfilePanel(view) {
    const overlay = document.getElementById('profile-overlay');
    if (!overlay) return;
    profileViewStack = [];
    profileCurrentMore = null;

    overlay.classList.add('active');
    if (view === 'class') {
        profileOpenClassPicker();
    } else {
        renderProfileHome();
        profileShowView('home');
    }
}

function closeProfilePanel(event) {
    if (event && event.target !== event.currentTarget) return;
    if (typeof profileResetSettingsSearch === 'function') profileResetSettingsSearch();
    profileViewStack = [];
    profileDetailKey = '';
    profileCurrentMore = null;
    const overlay = document.getElementById('profile-overlay');
    if (overlay) overlay.classList.remove('active');
    const subPage = document.getElementById('profile-subpage');
    if (subPage) {
        subPage.classList.remove('is-on');
        subPage.setAttribute('aria-hidden', 'true');
    }
}

/* ================= 設定主頁 ================= */

function renderProfileHome() {
    const resolved = (typeof demoResolveSchedule === 'function') ? demoResolveSchedule() : null;
    const classNode = document.getElementById('settings-class-value');
    if (classNode) {
        classNode.textContent = resolved && resolved.className ? resolved.className : '未設定';
    }
    renderProfileHeader();
}

/* ---------- 設定搜尋 ---------- */

function profileToggleSettingsSearch() {
    const bar = document.getElementById('wa-search-bar');
    const btn = document.getElementById('wa-search-btn');
    if (!bar) return;
    const opening = bar.hasAttribute('hidden');
    if (opening) {
        bar.removeAttribute('hidden');
        const input = document.getElementById('wa-search-input');
        if (input) input.focus();
    } else {
        profileClearSettingsSearch();
    }
    if (btn) {
        btn.classList.toggle('is-on', opening);
        btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    }
}

function profileFilterSettings(query) {
    const home = document.querySelector('#profile-view-home .ios-home');
    if (!home) return;
    const keyword = String(query || '').trim().toLowerCase();
    let hits = 0;

    home.querySelectorAll('.ios-row').forEach(row => {
        const matched = !keyword || (row.textContent || '').toLowerCase().indexOf(keyword) !== -1;
        row.style.display = matched ? '' : 'none';
        if (matched) hits++;
    });

    home.querySelectorAll('.ios-card').forEach(card => {
        const visible = Array.prototype.some.call(
            card.querySelectorAll('.ios-row'),
            row => row.style.display !== 'none'
        );
        card.style.display = visible ? '' : 'none';
        const title = card.previousElementSibling;
        if (title && title.classList && title.classList.contains('ios-group-title')) {
            title.style.display = visible ? '' : 'none';
        }
    });

    const empty = document.getElementById('wa-search-empty');
    if (empty) {
        const word = document.getElementById('wa-search-empty-word');
        if (word) word.textContent = query;
        if (keyword && hits === 0) empty.removeAttribute('hidden');
        else empty.setAttribute('hidden', '');
    }
}

function profileClearSettingsSearch() {
    const bar = document.getElementById('wa-search-bar');
    const input = document.getElementById('wa-search-input');
    if (input) input.value = '';
    if (bar) bar.setAttribute('hidden', '');
    profileFilterSettings('');
    const btn = document.getElementById('wa-search-btn');
    if (btn) {
        btn.classList.remove('is-on');
        btn.setAttribute('aria-expanded', 'false');
    }
}

function profileResetSettingsSearch() {
    const bar = document.getElementById('wa-search-bar');
    if (!bar || bar.hasAttribute('hidden')) return;
    profileClearSettingsSearch();
}

/* ================= 班級選擇 ================= */

async function profilePrepareClassView() {
    const groups = document.getElementById('class-groups');
    if (!groups) return;
    demoLoadClassesSync();
    profileClassesLoaded = true;

    const staged = [];
    demoGetClassList().forEach(cls => {
        const stage = cls.stage || '其他';
        let bucket = staged.find(item => item.name === stage);
        if (!bucket) {
            bucket = { name: stage, items: [] };
            staged.push(bucket);
        }
        bucket.items.push(cls);
    });

    groups.innerHTML = staged.map(stage =>
        '<div class="class-stage">' +
            '<div class="class-stage__label">' + profileEscape(stage.name) + '</div>' +
            '<div class="class-grid">' +
                stage.items.map(cls => {
                    const code = demoClassCode(cls);
                    return '<button class="class-chip" type="button" data-class-id="' + profileEscape(cls.id) + '" ' +
                        'onclick="profilePickClass(\'' + profileEscape(cls.id) + '\')">' +
                        '<span class="class-chip__name">' + profileEscape(cls.name) + '</span>' +
                        (code ? '<span class="class-chip__code">' + profileEscape(code) + '</span>' : '') +
                        '</button>';
                }).join('') +
            '</div>' +
        '</div>'
    ).join('');

    const customInput = document.getElementById('class-custom-input');
    if (customInput) customInput.value = profileClassPickCustom || '';

    document.querySelectorAll('.class-chip').forEach(chip => {
        chip.classList.toggle('is-on', chip.dataset.classId === profileClassPick);
    });
    profileUpdateClassPicked();
}

function profilePickClass(classId) {
    profileClassPick = classId;
    profileClassPickCustom = '';
    const customInput = document.getElementById('class-custom-input');
    if (customInput) customInput.value = '';
    document.querySelectorAll('.class-chip').forEach(chip => {
        chip.classList.toggle('is-on', chip.dataset.classId === classId);
    });
    profileUpdateClassPicked();
}

function profileApplyCustomClass() {
    const raw = profileVal('class-custom-input');
    if (!raw) {
        profileToast('請先輸入班級名稱');
        return;
    }
    const matched = demoResolveClassInput(raw);
    if (matched) {
        profilePickClass(matched.id);
        const input = document.getElementById('class-custom-input');
        if (input) input.value = matched.name;
        profileToast('已對應：' + matched.name);
        return;
    }
    profileClassPickCustom = raw.slice(0, 20);
    profileClassPick = 'custom:' + profileClassPickCustom;
    document.querySelectorAll('.class-chip').forEach(chip => chip.classList.remove('is-on'));
    profileUpdateClassPicked();
}

function profileUpdateClassPicked() {
    const box = document.getElementById('class-picked');
    const nameNode = document.getElementById('class-picked-name');
    const descNode = document.getElementById('class-picked-desc');
    if (!box) return;
    let name = '';
    let desc = '';
    if (profileClassPickCustom) {
        name = profileClassPickCustom;
        desc = '自訂班級 · 使用示範課表';
    } else if (profileClassPick) {
        const cls = demoFindClass(profileClassPick);
        if (cls) {
            name = cls.name;
            desc = '已選擇 · 課表會立即更新';
        }
    }
    if (!name) {
        box.style.display = 'none';
        return;
    }
    box.style.display = 'flex';
    if (nameNode) nameNode.textContent = name;
    if (descNode) descNode.textContent = desc;
}

async function profileConfirmClass() {
    if (!profileClassPickCustom && !profileClassPick) {
        profileToast('請先選一個班級');
        return;
    }
    const picked = profileClassPickCustom ? 'custom:' + profileClassPickCustom : profileClassPick;
    demoSetStoredClassId(picked);
    const cls = demoFindClass(profileClassPick);
    const label = profileClassPickCustom || (cls ? cls.name : picked);

    try {
        if (typeof applyClassSchedule === 'function') {
            await applyClassSchedule(true);
        }
        renderProfileHome();
        closeProfilePanel();
        profileToast('已套用班級：' + label);
    } catch (error) {
        console.error('[settings] 套用班級失敗:', error);
        profileToast('班級已儲存，但課表重新載入失敗');
        closeProfilePanel();
    }
}

function profileOpenClassPicker() {
    const stored = demoStoredClassChoice();
    if (stored && stored.reason === 'custom') {
        profileClassPickCustom = stored.className || '';
        profileClassPick = '';
    } else {
        profileClassPick = (stored && stored.classId) || '';
        profileClassPickCustom = '';
    }
    profilePrepareClassView().then(() => profileShowView('class'));
}

async function profileRefreshClassList() {
    profileClassesLoaded = false;
    await profilePrepareClassView();
    renderProfileHome();
}

/* ================= 外觀 ================= */

function profileDetailAppearanceHtml() {
    const current = (typeof themePreference === 'function') ? themePreference() : 'auto';
    return profileListCardHtml([
        profileChoiceRowHtml('淺色', current === 'light', "profileSetTheme('light')"),
        profileChoiceRowHtml('深色', current === 'dark', "profileSetTheme('dark')"),
        profileChoiceRowHtml('跟隨系統', current === 'auto', "profileSetTheme('auto')")
    ], 'role="radiogroup" aria-label="外觀"');
}

function profileSetTheme(pref) {
    if (typeof setThemePreference !== 'function') {
        profileToast('主題模組未載入');
        return;
    }
    setThemePreference(pref);
    profileRerenderDetail();
}

/* ================= 私隱 ================= */

function profilePrivacyState() {
    const raw = (typeof Storage !== 'undefined') ? Storage.get(PROFILE_PRIVACY_KEY, null) : null;
    return Object.assign({}, PROFILE_PRIVACY_DEFAULTS, (raw && typeof raw === 'object') ? raw : {});
}

function profileDetailPrivacyHtml() {
    const state = profilePrivacyState();
    const rows = PROFILE_PRIVACY_ITEMS.map(item => profileSwitchRowHtml(
        'detail-privacy-' + item.key,
        item.label,
        item.desc,
        !!state[item.key],
        "profileTogglePrivacy('" + item.key + "', this)"
    ));
    return profileListCardHtml(rows);
}

function profileTogglePrivacy(key, button) {
    if (!button || !key) return;
    const state = profilePrivacyState();
    const next = !button.classList.contains('is-on');
    state[key] = next;
    if (typeof Storage !== 'undefined') Storage.set(PROFILE_PRIVACY_KEY, state);
    button.classList.toggle('is-on', next);
    button.setAttribute('aria-checked', next ? 'true' : 'false');
    const item = PROFILE_PRIVACY_ITEMS.find(row => row.key === key);
    profileToast((item ? item.label : '設定') + (next ? '：已開啟' : '：已關閉'));
}

/* ================= 儲存空間 ================= */

function profileBytes(bytes) {
    const value = Math.max(0, Number(bytes) || 0);
    if (value < 1024) return Math.round(value) + ' B';
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
    if (value < 1024 * 1024 * 1024) return (value / (1024 * 1024)).toFixed(2) + ' MB';
    return (value / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function profileLocalStorageBytes() {
    let total = 0;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || '';
            const value = localStorage.getItem(key) || '';
            total += (key.length + value.length) * 2;
        }
    } catch (e) { /* localStorage 不可用時顯示 0 */ }
    return total;
}

function profileDetailStorageHtml() {
    const usage = profileListCardHtml([
        profileStatHtml('課表與假期', '內建示範資料', 'detail-stat-demo'),
        profileStatHtml('本機設定', '計算中…', 'detail-stat-local'),
        profileStatHtml('離線快取', '計算中…', 'detail-stat-cache'),
        profileStatHtml('瀏覽器配額', '—', 'detail-stat-quota'),
        profileStatHtml('網絡資料請求', '不使用', 'detail-stat-network')
    ]);
    const manage = profileListCardHtml([
        '<button class="detail-action detail-action--danger" type="button" onclick="profileClearCache(this)">清除快取並重新載入</button>'
    ]);
    return '<p class="ios-group-title">用量</p>' + usage +
        '<p class="ios-group-title">管理</p>' + manage;
}

async function profileRefreshStorageStats() {
    const setText = (id, text) => {
        const node = document.getElementById(id);
        if (node) node.textContent = text;
    };

    setText('detail-stat-local', profileBytes(profileLocalStorageBytes()) + ' · 本機儲存');
    const schedule = (typeof scheduleData !== 'undefined') ? scheduleData : {};
    const days = (typeof dbScheduleDayCount === 'function') ? dbScheduleDayCount(schedule) : 0;
    const subjects = (typeof dbScheduleSubjectCount === 'function') ? dbScheduleSubjectCount(schedule) : 0;
    setText('detail-stat-demo', days + ' 節課 · ' + subjects + ' 個科目');

    if (typeof caches === 'undefined' || !caches.keys) {
        setText('detail-stat-cache', '此環境不支援離線快取');
    } else {
        let cacheBytes = 0;
        let cacheCount = 0;
        try {
            const keys = await caches.keys();
            cacheCount = keys.length;
            for (const key of keys) {
                const cache = await caches.open(key);
                const requests = await cache.keys();
                for (const request of requests) {
                    const response = await cache.match(request);
                    if (!response) continue;
                    cacheBytes += (await response.clone().blob()).size;
                }
            }
        } catch (e) {
            console.warn('[settings] 讀取快取大小失敗:', e);
        }
        setText('detail-stat-cache', cacheCount
            ? profileBytes(cacheBytes) + ' · ' + cacheCount + ' 個快取庫'
            : '沒有離線快取');
    }

    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            setText('detail-stat-quota', profileBytes(estimate.usage) + ' / ' + profileBytes(estimate.quota));
        } catch (e) {
            setText('detail-stat-quota', '無法取得');
        }
    } else {
        setText('detail-stat-quota', '此環境不支援');
    }
}

async function profileClearCache(button) {
    if (button) {
        button.disabled = true;
        button.textContent = '正在清除…';
    }
    let removedCaches = 0;
    if (typeof caches !== 'undefined' && caches.keys) {
        try {
            const keys = await caches.keys();
            const results = await Promise.all(keys.map(key => caches.delete(key)));
            removedCaches = results.filter(Boolean).length;
        } catch (e) {
            console.error('[settings] 清除快取失敗:', e);
        }
    }
    let removedMirrors = 0;
    try {
        const doomed = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || '';
            if (key.indexOf('demo_mirror_v1_') === 0) doomed.push(key);
        }
        doomed.forEach(key => { localStorage.removeItem(key); removedMirrors++; });
    } catch (e) { /* ignore */ }
    profileToast('已清除 ' + removedCaches + ' 個快取庫、' + removedMirrors + ' 份資料副本');
    setTimeout(() => location.reload(), 450);
}

/* ================= 常見問題、回饋與支援 ================= */

function profileDetailFaqHtml() {
    return PROFILE_FAQ.map(item =>
        '<section class="ios-card faq-card">' +
        '<div class="faq-q">' + profileEscape(item.q) + '</div>' +
        '<div class="faq-a">' + profileEscape(item.a) + '</div>' +
        '</section>'
    ).join('');
}

function profileDetailFeedbackHtml() {
    const options = PROFILE_FEEDBACK_TYPES.map(type =>
        '<option value="' + profileEscape(type.value) + '">' + profileEscape(type.label) + '</option>'
    ).join('');
    return '<section class="ios-card detail-form">' +
        '<form onsubmit="event.preventDefault(); profileSubmitFeedback();">' +
        '<div class="detail-field"><label class="detail-field__label" for="detail-feedback-type">問題類型</label>' +
        '<select class="detail-select" id="detail-feedback-type">' + options + '</select></div>' +
        profileFieldHtml('detail-feedback-subject', '主旨', 'text', '例如：課表顯示問題', '') +
        '<div class="detail-field"><label class="detail-field__label" for="detail-feedback-body">詳細描述</label>' +
        '<textarea class="detail-textarea" id="detail-feedback-body" placeholder="請描述你遇到的情況"></textarea></div>' +
        '<button class="detail-action" type="submit">建立回報郵件</button>' +
        '</form></section>';
}

function profileSubmitFeedback() {
    const type = profileVal('detail-feedback-type');
    const subject = profileVal('detail-feedback-subject');
    const body = profileVal('detail-feedback-body');
    if (!subject || !body) {
        profileToast('請填寫主旨與詳細描述');
        return;
    }
    const matched = PROFILE_FEEDBACK_TYPES.find(item => item.value === type);
    try {
        const history = Storage.get('profile_feedback_v1', []) || [];
        history.unshift({ type: type, subject: subject, body: body, at: Date.now() });
        Storage.set('profile_feedback_v1', history.slice(0, 20));
    } catch (e) { /* 回報內容仍可寄出 */ }
    const mailSubject = encodeURIComponent('[' + (matched ? matched.label : '意見') + '] ' + subject);
    const mailBody = encodeURIComponent(body);
    location.href = 'mailto:' + PROFILE_SUPPORT_EMAIL + '?subject=' + mailSubject + '&body=' + mailBody;
    profileToast('已開啟郵件程式');
}

function profileDetailContactHtml() {
    return profileListCardHtml([
        '<div class="ios-row" role="note"><span class="ios-row__body">' +
        '<span class="ios-row__label">支援信箱</span></span>' +
        '<span class="ios-row__value">' + profileEscape(PROFILE_SUPPORT_EMAIL) + '</span></div>',
        profileNavRowHtml('複製支援信箱', '', 'profileCopyContact()'),
        profileNavRowHtml('回報問題 / 意見反饋', '', "profilePushDetail('feedback')"),
        profileInfoRowHtml('一般回覆時間', PROFILE_RESPONSE_HOURS)
    ]);
}

async function profileCopyText(text, successMessage) {
    const value = String(text || '');
    if (!value) return false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            profileToast(successMessage || '已複製到剪貼簿');
            return true;
        }
    } catch (e) { /* 使用後備方案 */ }
    try {
        const helper = document.createElement('textarea');
        helper.value = value;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(helper);
        if (copied) {
            profileToast(successMessage || '已複製到剪貼簿');
            return true;
        }
    } catch (e) { /* ignore */ }
    profileToast('無法自動複製，請長按選取後複製');
    return false;
}

function profileCopyContact() {
    profileCopyText(PROFILE_SUPPORT_EMAIL, '已複製支援信箱');
}

/* ================= 邀請與關於 ================= */

function profileInviteUrl() {
    const base = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.siteUrl)
        ? String(APP_CONFIG.siteUrl).replace(/\/+$/, '') + '/'
        : location.href.split(/[?#]/)[0];
    const param = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.inviteParam)
        ? String(APP_CONFIG.inviteParam)
        : '';
    if (!param) return base;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + param;
}

function profileDetailInviteHtml() {
    const url = profileInviteUrl();
    return '<div class="detail-callout">' +
        '<span class="detail-callout__title">' + profileEscape(PROFILE_INVITE_TITLE) + '</span>' +
        '<span class="detail-callout__desc">' + profileEscape(PROFILE_INVITE_TEXT) + '</span>' +
        '</div>' +
        profileListCardHtml([
            '<div class="detail-invite">' + profileEscape(url) + '</div>',
            profileNavRowHtml('複製邀請連結', '', 'profileCopyInvite()')
        ]);
}

function profileCopyInvite() {
    profileCopyText(profileInviteUrl(), '已複製邀請連結');
}

function profileSyncInviteShare() {
    const row = document.getElementById('profile-share-row');
    if (row && !navigator.share) row.style.display = 'none';
}

function profileShareInvite() {
    if (!navigator.share) return;
    navigator.share({
        title: PROFILE_INVITE_TITLE,
        text: PROFILE_INVITE_TEXT,
        url: profileInviteUrl()
    }).catch(() => {});
}

function profileDetailAboutHtml() {
    const members = (typeof PROFILE_DEVELOPER_MEMBERS !== 'undefined' && PROFILE_DEVELOPER_MEMBERS.length)
        ? PROFILE_DEVELOPER_MEMBERS.map(profileDevMemberHtml).join('')
        : '';
    const tribute = (typeof PROFILE_ABOUT_TRIBUTE !== 'undefined' && PROFILE_ABOUT_TRIBUTE)
        ? '<p class="detail-tribute"><span class="detail-tribute__text">用</span>' +
          '<span class="detail-tribute__icon" data-icon="heart" data-icon-size="14" aria-hidden="true"></span>' +
          '<span class="detail-tribute__text">' + profileEscape(PROFILE_ABOUT_TRIBUTE) + '</span></p>'
        : '';
    const panelTitle = (typeof PROFILE_DEVELOPER_PANEL_TITLE !== 'undefined' && PROFILE_DEVELOPER_PANEL_TITLE)
        ? '<p class="dev-panel__title">' + profileEscape(PROFILE_DEVELOPER_PANEL_TITLE) + '</p>'
        : '';
    const panel = members
        ? profileListCardHtml(['<div class="dev-panel">' + panelTitle + members + tribute + '</div>'])
        : '';
    return '<div class="detail-callout">' +
        '<span class="detail-callout__title">' + profileEscape(PROFILE_APP_NAME) + '</span>' +
        '<span class="detail-callout__desc">' + profileEscape(PROFILE_ABOUT_DESC) + '</span>' +
        '<span class="detail-callout__version">版本 v' + profileEscape(profileAppVersion()) + '</span>' +
        '</div>' + panel;
}

function profileDevInitials(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
    const letters = words.map(word => word.charAt(0)).join('');
    return letters ? letters.toUpperCase() : '?';
}

function profileDevMemberHtml(member) {
    const socials = (member && member.socials ? member.socials : [])
        .filter(item => item && /^https:\/\//i.test(String(item.url || '')))
        .map(item => '<a class="dev-social__link" href="' + profileEscape(item.url) + '" ' +
            'target="_blank" rel="noopener noreferrer" aria-label="' + profileEscape(item.label) + '" ' +
            'title="' + profileEscape(item.label) + '"><span data-icon="' + item.icon + '" data-icon-size="20"></span></a>');
    const cls = (member && member.tag)
        ? '<span class="dev-member__class">' + profileEscape(member.tag) + '</span>'
        : '';
    const badge = (member && member.verified === true)
        ? '<span class="dev-member__badge" role="img" aria-label="已驗證" data-icon="verifiedBadge" data-icon-size="17"></span>'
        : '';
    const photo = (member && member.avatar)
        ? '<img class="dev-member__avatar-img" src="' + profileEscape(member.avatar) + '" alt="" width="64" height="64" decoding="async">'
        : '';
    return '<div class="dev-member">' +
        '<span class="dev-member__avatar' + (photo ? ' dev-member__avatar--photo' : '') + '" aria-hidden="true">' +
        profileEscape(profileDevInitials(member && member.name)) + photo + '</span>' +
        '<span class="dev-member__name-row"><span class="dev-member__name">' +
        profileEscape(member && member.name) + '</span>' + badge + '</span>' + cls +
        (socials.length ? '<span class="dev-social">' + socials.join('') + '</span>' : '') +
        '</div>';
}

/* ================= 法律文件 ================= */

function profileDetailDocHtml(key) {
    const doc = PROFILE_LEGAL_DOCS[key];
    if (!doc) return '';
    return '<article class="detail-doc">' +
        '<div class="detail-doc__meta">最後更新：' + profileEscape(PROFILE_LEGAL_UPDATED) + '</div>' +
        doc.sections.map(section =>
            '<section class="detail-doc__section"><h2>' + profileEscape(section.h) + '</h2>' +
            section.p.map(paragraph => '<p>' + profileEscape(paragraph) + '</p>').join('') +
            '</section>'
        ).join('') +
        '</article>';
}

/* ================= 子頁面註冊 ================= */

const PROFILE_DETAIL_PAGES = {
    appearance: { title: '外觀與主題', html: profileDetailAppearanceHtml },
    privacy: { title: '私隱', html: profileDetailPrivacyHtml },
    storage: {
        title: '儲存空間及數據',
        html: profileDetailStorageHtml,
        after: profileRefreshStorageStats
    },
    faq: { title: '常見問題', html: profileDetailFaqHtml },
    feedback: { title: '回報問題 / 意見反饋', html: profileDetailFeedbackHtml },
    contact: { title: '聯絡支援', html: profileDetailContactHtml },
    invite: { title: '邀請朋友', html: profileDetailInviteHtml, after: profileSyncInviteShare },
    about: { title: '關於我們', html: profileDetailAboutHtml }
};

if (typeof PROFILE_LEGAL_DOCS !== 'undefined') {
    Object.keys(PROFILE_LEGAL_DOCS).forEach(key => {
        PROFILE_DETAIL_PAGES['doc-' + key] = {
            title: PROFILE_LEGAL_DOCS[key].title,
            html: () => profileDetailDocHtml(key)
        };
    });
}

function profileRenderDetail(key) {
    const body = document.getElementById('profile-detail-body');
    if (!body) return;
    const page = PROFILE_DETAIL_PAGES[key];
    if (!page) {
        body.innerHTML = profileListCardHtml([profileInfoRowHtml('找不到此設定', '請返回再試')]);
        return;
    }
    body.innerHTML = page.html();
    if (typeof hydrateIcons === 'function') hydrateIcons(body);
    if (typeof page.after === 'function') page.after();
}

function profileRerenderDetail() {
    if (profileView === 'detail' && profileDetailKey) profileRenderDetail(profileDetailKey);
}

function profileAppVersion() {
    return (typeof APP_VERSION !== 'undefined' && APP_VERSION) ? String(APP_VERSION) : '3.5.1';
}

function profileRenderVersion() {
    const node = document.getElementById('app-version');
    if (node) node.textContent = 'v' + profileAppVersion();
}

/* ================= 初始化 ================= */

function initProfile() {
    demoLoadClassesSync();
    renderProfileHeader();
    renderProfileHome();
    profileRenderVersion();

    const overlay = document.getElementById('profile-overlay');
    if (overlay) {
        overlay.addEventListener('click', event => {
            if (event.target === overlay) closeProfilePanel();
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            active.blur();
            return;
        }
        if (profileViewStack.length) {
            profileBackView();
            return;
        }
        const panel = document.getElementById('profile-overlay');
        if (panel && panel.classList.contains('active')) closeProfilePanel();
    });
}
