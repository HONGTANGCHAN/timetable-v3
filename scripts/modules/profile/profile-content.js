// ============================================================
// 設定頁靜態內容（純資料，不連接雲端或後端）
// ============================================================

const PROFILE_APP_NAME = '我的課表';
const PROFILE_SUPPORT_EMAIL = 'contact@pcmstimetable.com';
const PROFILE_LEGAL_UPDATED = '2026-10-03';
const PROFILE_RESPONSE_HOURS = '2 個工作天';

const PROFILE_LICENSE_NAME = 'Creative Commons 姓名標示－相同方式分享 4.0 國際（CC BY-SA 4.0）';
const PROFILE_LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant';
const PROFILE_LICENSE_REPO = 'RayCheungCheung/pcmstimetable';
const PROFILE_SITE_URL = 'https://pcmstimetable.com';

const PROFILE_INVITE_TITLE = '邀請你一起用「我的課表」';
const PROFILE_INVITE_TEXT = '我用「我的課表」整理上課時間、假期倒數和校曆活動，推薦你都試下：';
const PROFILE_ABOUT_DESC = '可替換示範資料的課表工具，整理上課時間、假期倒數與校曆活動。';
const PROFILE_ABOUT_TRIBUTE = '為澳門培正中學師生打造';
const PROFILE_DEVELOPER_PANEL_TITLE = '開發者';

const PROFILE_DEVELOPER_MEMBERS = [
    {
        name: 'Ray Cheung',
        tag: '初二正',
        verified: true,
        avatar: 'assets/images/developers/ray-cheung.webp',
        socials: [
            { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/iam_raycheung/' },
            { icon: 'github', label: 'GitHub', url: 'https://github.com/RayCheungCheung' }
        ]
    },
    {
        name: 'Chan Hong Tang',
        tag: '初二正',
        verified: true,
        avatar: 'assets/images/developers/chan-hong-tang.webp',
        socials: [
            { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/chan_hong_tang/' },
            { icon: 'github', label: 'GitHub', url: 'https://github.com/HONGTANGCHAN' }
        ]
    }
];

const PROFILE_FAQ = [
    {
        q: '課表資料在哪裡修改？',
        a: '所有示範班級、課表、假期與活動都集中在 data/demo-data.js。替換這個檔案即可更新整個展示內容，不必改動其他模組。'
    },
    {
        q: '一定要登入嗎？',
        a: '不需要。登入與註冊是額外提供的本機模擬流程；課表與設定不需要帳號也能使用。'
    },
    {
        q: '為什麼可以離線使用？',
        a: '資料已內建在專案檔案中，Service Worker 會快取介面資源；即使沒有網絡，已開啟過的畫面仍可正常顯示。'
    },
    {
        q: '如何切換班級？',
        a: '開啟右上角設定，進入「班級與課表」，選擇示範班級或輸入自訂班級後按套用即可。'
    },
    {
        q: '設定會保存嗎？',
        a: '會。班級、主題與私隱偏好只保存在目前瀏覽器的本機儲存空間，不會上傳。'
    },
    {
        q: '如何清除快取？',
        a: '到「儲存空間及數據」按「清除快取並重新載入」。這只會移除介面快取，不會刪除你的本機設定。'
    },
    {
        q: '拖堂紀錄會上傳嗎？',
        a: '不會。拖堂計時與排行榜只使用本機紀錄，適合展示既有流程。'
    },
    {
        q: '回報問題之後會怎樣處理？',
        a: '報告會先保存在本機副本，並開啟郵件程式寄到支援信箱；一般會在 ' + PROFILE_RESPONSE_HOURS + ' 內回覆。'
    }
];

const PROFILE_FEEDBACK_TYPES = [
    { value: 'bug', label: '功能異常 / 錯誤回報' },
    { value: 'data', label: '示範資料有誤' },
    { value: 'ui', label: '界面與使用體驗' },
    { value: 'feature', label: '功能建議' },
    { value: 'performance', label: '效能 / 卡頓' },
    { value: 'other', label: '其他' }
];

const PROFILE_PRIVACY_KEY = 'profile_privacy_v1';
const PROFILE_PRIVACY_DEFAULTS = {
    compactMode: false,
    reducedMotion: false,
    analytics: false
};

const PROFILE_PRIVACY_ITEMS = [
    {
        key: 'compactMode',
        label: '精簡排列',
        desc: '減少卡片之間的視覺留白，讓同一個畫面容納更多資訊。'
    },
    {
        key: 'reducedMotion',
        label: '減少動態效果',
        desc: '減少卡片淡入與滑動過場，保留較穩定的閱讀體驗。'
    },
    {
        key: 'analytics',
        label: '本機使用統計',
        desc: '只在這個瀏覽器記錄功能使用次數，資料不會離開裝置。'
    }
];

const PROFILE_LEGAL_DOCS = {
    disclaimer: {
        title: '免責聲明',
        sections: [
            {
                h: '一、示範性質',
                p: [
                    '本專案的班級、課表、假期及活動資料均為示範內容，只供介面展示與測試使用。',
                    '請勿將示範資料視為任何學校、政府或機構的正式公告。'
                ]
            },
            {
                h: '二、資料準確性',
                p: [
                    '本專案不保證示範資料的完整性、即時性或準確性。正式使用前，請以學校或相關機構公布的最新資訊為準。'
                ]
            },
            {
                h: '三、使用責任',
                p: [
                    '使用者應自行判斷資料是否適合其用途。因使用或無法使用本專案而造成的直接或間接損失，開發者不承擔責任。'
                ]
            }
        ]
    },
    terms: {
        title: '服務條款',
        sections: [
            {
                h: '一、服務內容',
                p: [
                    '本專案提供課表、假期倒數與校曆活動的靜態展示功能；帳號功能為可選的本機模擬流程。'
                ]
            },
            {
                h: '二、使用規則',
                p: [
                    '使用者不得利用本專案從事違法、干擾他人或破壞裝置與網絡的行為。',
                    '本專案可因展示需求隨時調整、暫停或移除部分功能。'
                ]
            },
            {
                h: '三、智慧財產',
                p: [
                    '程式碼依專案所載授權條款提供；品牌名稱、標誌及第三方內容仍歸其各自權利人所有。'
                ]
            }
        ]
    },
    privacy: {
        title: '私隱政策',
        sections: [
            {
                h: '一、資料收集',
                p: [
                    '本版本提供本機模擬註冊與登入，不會把姓名、電郵、密碼或 Session 傳送到任何伺服器。'
                ]
            },
            {
                h: '二、本機儲存',
                p: [
                    '帳號、登入 Session、班級、主題與私隱偏好可能存放在瀏覽器 localStorage。這些資料只留在目前裝置，可透過清除瀏覽器資料移除。'
                ]
            },
            {
                h: '三、網絡傳送',
                p: [
                    '課表與假期使用內建示範資料，不會向後端 API 或第三方資料服務發出請求。',
                    '若使用者主動開啟郵件或外部連結，將受該服務本身的條款與私隱政策約束。'
                ]
            }
        ]
    },
    licensing: {
        title: '條款與許可',
        sections: [
            {
                h: '一、授權',
                p: [
                    '除另有標示外，本專案內容以 ' + PROFILE_LICENSE_NAME + ' 提供。',
                    PROFILE_LICENSE_URL
                ]
            },
            {
                h: '二、姓名標示',
                p: [
                    '轉載或改作時請保留專案名稱與來源：' + PROFILE_LICENSE_REPO + '。'
                ]
            },
            {
                h: '三、第三方資源',
                p: [
                    '字型、圖示、相片或其他第三方素材依其原授權提供，不在本專案授權範圍內。'
                ]
            }
        ]
    }
};
