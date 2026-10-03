// ============================================================
// 示範資料（唯一可替換的資料來源）
//
// 這個檔案只包含 mock data，不需要資料庫或後端 API。
// 替換班級、課表、假期或行事曆內容時，只需修改 window.DEMO_DATA。
// ============================================================
(function () {
    'use strict';

    const timetable = {
        '1': [
            { period: 1, start: '08:05', end: '08:50', subject: '中文', teacher: '陳老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '數學', teacher: '李老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '英文', teacher: '黃老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '綜合科學', teacher: '周老師' },
            { period: 5, start: '11:35', end: '12:15', subject: '歷史', teacher: '梁老師' },
            { period: 6, start: '14:15', end: '14:55', subject: '體育', teacher: '何老師' },
            { period: 7, start: '15:05', end: '15:45', subject: '視覺藝術', teacher: '林老師' }
        ],
        '2': [
            { period: 1, start: '08:05', end: '08:50', subject: '英文', teacher: '黃老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '中文', teacher: '陳老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '地理', teacher: '吳老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '數學', teacher: '李老師' },
            { period: 5, start: '11:35', end: '12:15', subject: '電腦', teacher: '鄭老師' },
            { period: 6, start: '14:15', end: '14:55', subject: '音樂', teacher: '蘇老師' },
            { period: 7, start: '15:05', end: '15:45', subject: '班會', teacher: '陳老師' }
        ],
        '3': [
            { period: 1, start: '08:05', end: '08:50', subject: '數學', teacher: '李老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '英文', teacher: '黃老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '中文', teacher: '陳老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '設計與科技', teacher: '郭老師' },
            { period: 5, start: '11:35', end: '12:15', subject: '綜合科學', teacher: '周老師' },
            { period: 6, start: '14:15', end: '14:55', subject: '體育', teacher: '何老師' },
            { period: 7, start: '15:05', end: '15:45', subject: '英文閱讀', teacher: '黃老師' }
        ],
        '4': [
            { period: 1, start: '08:05', end: '08:50', subject: '中文', teacher: '陳老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '歷史', teacher: '梁老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '數學', teacher: '李老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '英文', teacher: '黃老師' },
            { period: 5, start: '11:35', end: '12:15', subject: '地理', teacher: '吳老師' },
            { period: 6, start: '14:15', end: '14:55', subject: '電腦', teacher: '鄭老師' },
            { period: 7, start: '15:05', end: '15:45', subject: '自習', teacher: '陳老師' }
        ],
        '5': [
            { period: 1, start: '08:05', end: '08:50', subject: '英文', teacher: '黃老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '綜合科學', teacher: '周老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '數學', teacher: '李老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '中文', teacher: '陳老師' },
            { period: 5, start: '11:35', end: '12:15', subject: '音樂', teacher: '蘇老師' },
            { period: 6, start: '14:15', end: '14:55', subject: '體育', teacher: '何老師' },
            { period: 7, start: '15:05', end: '15:45', subject: '週會', teacher: '陳老師' }
        ],
        '6': [
            { period: 1, start: '08:05', end: '08:50', subject: '數學增潤', teacher: '李老師' },
            { period: 2, start: '09:00', end: '09:40', subject: '中文寫作', teacher: '陳老師' },
            { period: 3, start: '09:50', end: '10:30', subject: '英文會話', teacher: '黃老師' },
            { period: 4, start: '10:40', end: '11:20', subject: '專題研習', teacher: '周老師' }
        ]
    };

    window.DEMO_DATA = {
        classes: {
            schemaVersion: 1,
            defaultClassId: 'demo-a',
            defaultSchedule: 'demo:timetable',
            classes: [
                { id: 'demo-a', name: '示範一班', code: 'D1A', stage: '示範', schedule: 'demo:timetable' },
                { id: 'demo-b', name: '示範二班', code: 'D1B', stage: '示範', schedule: 'demo:timetable' },
                { id: 'demo-c', name: '示範三班', code: 'D1C', stage: '示範', schedule: 'demo:timetable' }
            ]
        },
        schedules: {
            'demo:timetable': timetable
        },
        events: {
            events: [
                { date: '2026-10-01', title: '國慶假期（示範）', type: 'holiday', emoji: '🎈' },
                { date: '2026-10-02', title: '國慶假期（示範）', type: 'holiday', emoji: '🎈' },
                { date: '2026-10-03', title: '國慶假期（示範）', type: 'holiday', emoji: '🎈' },
                { date: '2026-10-16', title: '校運會（示範）', type: 'activity', icon: 'target' },
                { date: '2026-10-23', title: '英文小測（示範）', type: 'exam', icon: 'clipboard' },
                { date: '2026-11-06', title: '家長日（示範）', type: 'activity', icon: 'school' },
                { date: '2026-11-18', title: '數學測驗（示範）', type: 'exam', icon: 'clipboard' },
                { date: '2026-12-21', title: '聖誕假期（示範）', type: 'holiday', emoji: '🎄' },
                { date: '2027-01-04', title: '新學期開始（示範）', type: 'activity', icon: 'calendar' },
                { date: '2027-02-05', title: '春節假期（示範）', type: 'holiday', emoji: '🧧' }
            ]
        },
        holidays: {
            holidays: [
                { name: '國慶假期（示範）', date: '2026-10-01', endDate: '2026-10-03', emoji: '🎈', note: '示範假期資料' },
                { name: '校運會補假（示範）', date: '2026-10-19', endDate: '2026-10-19', emoji: '🏅', note: '示範假期資料' },
                { name: '聖誕假期（示範）', date: '2026-12-21', endDate: '2026-12-31', emoji: '🎄', note: '示範假期資料' },
                { name: '元旦假期（示範）', date: '2027-01-01', endDate: '2027-01-03', emoji: '✨', note: '示範假期資料' },
                { name: '春節假期（示範）', date: '2027-02-05', endDate: '2027-02-14', emoji: '🧧', note: '示範假期資料' }
            ]
        }
    };
})();
