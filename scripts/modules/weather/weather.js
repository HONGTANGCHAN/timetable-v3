// ============================================================
// 倒數頁天氣：Open-Meteo 即時天氣與今日預測
// 原生 fetch，無第三方套件、無 Key、無後端代理。
// ============================================================

const WEATHER_CURRENT_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=22.2006&longitude=113.5461&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=auto';
const WEATHER_DAILY_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=22.2006&longitude=113.5461&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto';
const WEATHER_WARNING_RSS_URL = 'http://rss.smg.gov.mo/c_WSignal_rss.xml';
const WEATHER_WARNING_PROXY = 'https://api.allorigins.win/raw?url=';
const WEATHER_REFRESH_MS = 30 * 60 * 1000;

let weatherRefreshTimer = null;

const WEATHER_CODE_INFO = [
    { codes: [0], day: '☀️', night: '🌙', text: '晴朗' },
    { codes: [1], day: '🌤️', night: '🌙', text: '大致晴朗' },
    { codes: [2], day: '⛅', night: '☁️', text: '多雲' },
    { codes: [3], day: '☁️', night: '☁️', text: '陰天' },
    { codes: [45, 48], day: '🌫️', night: '🌫️', text: '有霧' },
    { codes: [51, 53, 55, 56, 57], day: '🌦️', night: '🌧️', text: '毛毛雨' },
    { codes: [61, 63, 65, 66, 67], day: '🌧️', night: '🌧️', text: '下雨' },
    { codes: [71, 73, 75, 77], day: '🌨️', night: '🌨️', text: '下雪' },
    { codes: [80, 81, 82], day: '🌦️', night: '🌧️', text: '陣雨' },
    { codes: [85, 86], day: '🌨️', night: '🌨️', text: '陣雪' },
    { codes: [95], day: '⛈️', night: '⛈️', text: '雷暴' },
    { codes: [96, 99], day: '⛈️', night: '⛈️', text: '雷暴伴冰雹' }
];

function weatherCodeInfo(code, isDay) {
    const numeric = Number(code);
    const item = WEATHER_CODE_INFO.find(entry => entry.codes.indexOf(numeric) !== -1);
    if (!item) {
        return { icon: isDay ? '🌤️' : '☁️', text: '天氣狀況未知' };
    }
    return { icon: isDay ? item.day : item.night, text: item.text };
}

function weatherRound(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number) : null;
}

async function weatherFetchJson(url) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
        ? setTimeout(() => controller.abort(), 12000)
        : null;

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            signal: controller ? controller.signal : undefined
        });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return await response.json();
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function weatherFetchText(url) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
        ? setTimeout(() => controller.abort(), 12000)
        : null;

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            signal: controller ? controller.signal : undefined
        });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return await response.text();
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function weatherSetText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
}

function weatherRenderError() {
    const card = document.getElementById('realtime-weather');
    if (!card) return;
    card.dataset.state = 'error';
    weatherSetText('weather-card-icon', '!');
    weatherSetText('weather-card-temperature', '');
    weatherSetText('weather-card-description', '天氣資料載入失敗');
}

function weatherRender(dataCurrent, dataDaily) {
    const card = document.getElementById('realtime-weather');
    if (!card || !dataCurrent || !dataDaily) return;

    const current = dataCurrent.current || {};
    const daily = dataDaily.daily || {};
    const temperature = weatherRound(current.temperature_2m);
    const humidity = weatherRound(current.relative_humidity_2m);
    const high = weatherRound((daily.temperature_2m_max || [])[0]);
    const low = weatherRound((daily.temperature_2m_min || [])[0]);
    const code = current.weather_code;
    const isDay = Number(current.is_day) === 1;
    const info = weatherCodeInfo(code, isDay);

    card.dataset.state = 'ready';
    weatherSetText('weather-card-icon', info.icon);
    weatherSetText('weather-card-temperature', temperature === null ? '--' : String(temperature));
    weatherSetText('weather-card-description', info.text);
    weatherSetText('weather-card-humidity', humidity === null ? '--%' : humidity + '%');
    weatherSetText(
        'weather-card-range',
        high === null || low === null ? '-- / --°C' : high + '° / ' + low + '°C'
    );
}

function weatherRssItemTexts(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    if (doc.querySelector('parsererror')) return [];

    const items = Array.from(doc.getElementsByTagName('item'));
    const nodes = items.length ? items : [doc.documentElement];
    return nodes.map(item => {
        const fields = ['title', 'description', 'category', 'guid'];
        return fields.map(field => {
            const node = item.getElementsByTagName(field)[0];
            return node && node.textContent ? node.textContent : '';
        }).join(' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }).filter(Boolean);
}

function weatherParseWarnings(xmlText) {
    const text = weatherRssItemTexts(xmlText).join(' ');
    const upper = text.toUpperCase();
    const warnings = [];

    if (/黑色暴雨|黑雨|BLACK\s+RAINSTORM/.test(text)) {
        warnings.push({ type: 'rain', level: 'black', label: '黑色暴雨警告' });
    } else if (/紅色暴雨|紅雨|RED\s+RAINSTORM/.test(text)) {
        warnings.push({ type: 'rain', level: 'red', label: '紅色暴雨警告' });
    } else if (/黃色暴雨|黃雨|YELLOW\s+RAINSTORM/.test(text)) {
        warnings.push({ type: 'rain', level: 'yellow', label: '黃色暴雨警告' });
    }

    if (/颱風|風球|熱帶氣旋|TROPICAL|CYCLONE|SIGNAL/.test(upper)) {
        let signal = null;
        [
            ['十號', 10], ['九號', 9], ['八號', 8], ['三號', 3], ['一號', 1]
        ].some(item => {
            if (text.indexOf(item[0]) === -1) return false;
            signal = item[1];
            return true;
        });
        const match = upper.match(/(?:^|[^\d])(10|9|8|3|1)\s*(?:號|号)?\s*(?:風球|风球|熱帶氣旋|热带气旋)?/)
            || upper.match(/SIGNAL\s*(10|9|8|3|1)/);
        if (signal === null && match && match[1]) {
            signal = Number(match[1]);
        }
        if (signal !== null) {
            warnings.push({
                type: 'typhoon',
                level: 'signal-' + signal,
                label: signal + '號風球'
            });
        }
    }

    return warnings;
}

function weatherRenderWarnings(warnings) {
    const container = document.getElementById('weather-card-warnings');
    if (!container) return;
    const card = document.getElementById('realtime-weather');
    const list = Array.isArray(warnings) ? warnings.slice() : [];

    if (card) {
        card.dataset.alert = list.some(item => item.level === 'black') ? 'black-rain' : '';
    }

    if (!list.length) {
        container.hidden = true;
        container.innerHTML = '';
        return;
    }

    container.innerHTML = list.map(item =>
        '<span class="weather-warning" data-level="' + item.level + '">' +
        item.label + '</span>'
    ).join('');
    container.hidden = false;
}

async function weatherLoad() {
    if (!document.getElementById('realtime-weather')) return;

    const warningUrl = WEATHER_WARNING_PROXY + encodeURIComponent(WEATHER_WARNING_RSS_URL);
    const results = await Promise.allSettled([
        weatherFetchJson(WEATHER_CURRENT_URL),
        weatherFetchJson(WEATHER_DAILY_URL),
        weatherFetchText(warningUrl)
    ]);

    if (results[0].status === 'fulfilled' && results[1].status === 'fulfilled') {
        weatherRender(results[0].value, results[1].value);
    } else {
        console.warn('[Weather] Open-Meteo 載入失敗:', results[0], results[1]);
        weatherRenderError();
    }

    if (results[2].status === 'fulfilled') {
        weatherRenderWarnings(weatherParseWarnings(results[2].value));
    } else {
        console.warn('[Weather] SMG 天氣警告 RSS 載入失敗:', results[2].reason);
        weatherRenderWarnings([]);
    }
}

function initWeather() {
    weatherLoad();
    if (!weatherRefreshTimer) {
        weatherRefreshTimer = setInterval(weatherLoad, WEATHER_REFRESH_MS);
    }
}
