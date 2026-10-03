// ================= 功能 8：日曆系統（唯讀） =================
// 事件一律由 DB 集合 'events'（data/demo-data.js）提供，使用者「唔可以新增或刪除」。
// 為此已經移除所有新增入口：
//   · 點擊日期格子只會檢視該日事件（原本會即時彈出新增視窗）
//   · 新增事件彈窗 #add-calendar-event-modal 及 saveCalendarEvent() 已整組刪除
// 要新增／修改事件，請直接改 data/demo-data.js。
let calendarCurrentDate = new Date();
let calendarEvents = [];
let calendarSelectedDate = null;

// 事件資料統一由 DataManager（DB 集合 'events'）管理：
// localStorage → 示範資料 → 空陣列
const CALENDAR_DB_NAME = 'events';

// ================= 初始化 =================
async function initCalendar() {
    await loadCalendarEvents();

    // 本機集合改動後 → 即時重繪
    if (typeof DB !== 'undefined') {
        DB.subscribe(CALENDAR_DB_NAME, () => {
            calendarEvents = DB.get(CALENDAR_DB_NAME) || [];
            renderCalendar();
        });
    }

    renderCalendar();
}

async function loadCalendarEvents() {
    try {
        await DB.load(CALENDAR_DB_NAME);
        calendarEvents = DB.get(CALENDAR_DB_NAME) || [];
    } catch (e) {
        console.warn('載入事件資料失敗:', e);
        calendarEvents = [];
    }
    return calendarEvents;
}

// ================= 月份切換 =================
function changeCalendarMonth(offset) {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + offset);
    renderCalendar();
}

function goToCalendarToday() {
    calendarCurrentDate = new Date();
    renderCalendar();
}

// ================= 渲染月曆 =================
function renderCalendar() {
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    const titleEl = document.getElementById('calendar-title');
    if (titleEl) titleEl.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayStr = fmtDate(today);

    let html = '';

    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-cell other-month"><div class="cal-num">${prevMonthDays - i}</div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = calendarEvents.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;
        const hasEvents = dayEvents.length > 0;

        let eventsHtml = '';
        dayEvents.slice(0, 2).forEach(e => {
            // 開發者自訂顏色（e.color）優先，否則用類別預設色
            const colorStyle = dbIsHexColor(e.color) ? ` style="background-color:${e.color}"` : '';
            eventsHtml += `<div class="cal-event ${e.type}"${colorStyle}>${contentIcon(e.emoji || e.icon, { size: 13, fallback: dbEventIcon(e.type) })}${escapeHtml(e.title)}</div>`;
        });
        if (dayEvents.length > 2) {
            eventsHtml += `<div class="cal-event more">+${dayEvents.length - 2}</div>`;
        }

        html += `
            <div class="cal-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" 
                 onclick="onCalendarDateClick('${dateStr}')">
                <div class="cal-num">${day}</div>
                ${hasEvents ? '<div class="cal-dot"></div>' : ''}
                <div class="cal-events">${eventsHtml}</div>
            </div>
        `;
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="cal-cell other-month"><div class="cal-num">${i}</div></div>`;
    }

    const gridEl = document.getElementById('calendar-grid');
    if (gridEl) gridEl.innerHTML = html;

    selectCalendarDate(todayStr);
}

// ================= 點擊日期格子（只檢視當日事件） =================
function onCalendarDateClick(dateStr) {
    calendarSelectedDate = dateStr;
    selectCalendarDate(dateStr);
}

// ================= 選擇日期 =================
function selectCalendarDate(dateStr) {
    calendarSelectedDate = dateStr;
    const dayEvents = calendarEvents.filter(e => e.date === dateStr);
    const titleEl = document.getElementById('calendar-events-title');
    const listEl = document.getElementById('calendar-events-list');

    if (!titleEl || !listEl) return;

    const [y, m, d] = dateStr.split('-');
    titleEl.textContent = `${y}年${parseInt(m)}月${parseInt(d)}日 的事件`;

    if (dayEvents.length === 0) {
        listEl.innerHTML = `<div class="cal-event-empty">這天沒有事件</div>`;
        return;
    }

    listEl.innerHTML = dayEvents.map(e => {
        const colorStyle = dbIsHexColor(e.color)
            ? ` style="box-shadow: inset 3px 0 0 0 ${e.color}"`
            : '';
        const noteHtml = e.note ? `<div class="cal-event-note">${escapeHtml(e.note)}</div>` : '';
        return `
        <div class="cal-event-item ${e.type}"${colorStyle}>
            <div class="cal-event-emoji">${contentIcon(e.emoji || e.icon, { size: 19, fallback: dbEventIcon(e.type) })}</div>
            <div class="cal-event-info">
                <div class="cal-event-title">${escapeHtml(e.title)}</div>
                <div class="cal-event-type">${getCalTypeName(e.type)}</div>
                ${noteHtml}
            </div>
        </div>
    `;
    }).join('');
}

// ================= 輔助 =================
// 事件圖示一律直接用 dbEventIcon()（scripts/utils/icons.js 產生 SVG）；
// 舊有嘅 getCalEventIcon() 只服務已刪除嘅新增事件流程，已一併移除。
function getCalTypeName(type) {
    const names = { exam: '測驗 / 考試', homework: '作業截止', activity: '活動', holiday: '假期' };
    return names[type] || '事件';
}

function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ================= 唯讀：原本嘅新增事件流程已經移除 =================
// 呢個位原本有：openAddCalendarEventModal() / closeAddCalendarEventModal() /
// selectEventType() / updateDateDisplay() / 日期輸入監聽 / saveCalendarEvent()。
// 使用者唔可以自己新增事件，所以全部刪除；事件資料只需要 DB 讀取 + renderCalendar()。

