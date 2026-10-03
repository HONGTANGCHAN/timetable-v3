# 我的課表

純 HTML、CSS、JavaScript 的課表展示應用，包含 localStorage 模擬註冊、登入、Session 與登出流程，不連接資料庫或後端 API。

## 功能

- 本週課表總覽與每日課表
- 即時上課 / 下課倒數
- 假期倒數與校曆事件
- 教師拖堂計時與本機排行榜
- 深色 / 淺色 / 跟隨系統主題
- 公開設定頁、班級選擇與儲存管理
- 本機模擬註冊、登入、Session 與登出

## 示範資料

所有班級、課表、假期與事件都集中在：

`data/demo-data.js`

直接替換 `window.DEMO_DATA` 即可改成其他展示資料，不需要修改頁面邏輯。

## 執行

可以直接由任何靜態伺服器開啟，例如：

```powershell
python -m http.server 8000
```

再開啟 `http://localhost:8000/`。

本版本不使用 `fetch` 讀取資料，因此直接雙擊 `index.html` 也可以顯示主要內容；使用靜態伺服器仍可完整測試 Service Worker 的離線快取。

## 私隱

- 無 Supabase、Google 或其他第三方登入
- 無後端 API、資料庫或外部天氣資料請求
- 帳號、Session、班級與偏好只儲存在瀏覽器本機
- 模擬密碼雜湊不具備真實帳號系統的安全性
