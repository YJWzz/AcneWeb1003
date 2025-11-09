# 青春痘護理平台 — 部署與維運手冊

## 目的
說明如何從原始碼建置、測試到線上部署本平台的完整流程，並提供常見問題與解法，方便開發者／維運人員快速上手。

## 一、系統概覽（簡短）
本系統主要組成：
- 前端（靜態網站） — 使用者介面：護理指南、聊天機器人、AI 即時偵測上傳介面。參見專案文件（功能說明）。fileciteturn1file0L13-L17  
- 後端（API） — 處理上傳影像、觸發 AI 分析、管理資料庫儲存（使用者與圖片 metadata）。fileciteturn1file1L48-L49  
- 自動化 / 資料整合（n8n） — 文件擷取、向量化（OpenAI Embeddings）、寫入 Pinecone、並提供問答流程。fileciteturn1file3L34-L36

目前線上範例網址（供測試）：後端與前端範例。fileciteturn1file0L32-L36

---

## 二、先決條件（本地測試）
- Git（clone repo）  
- Node.js + npm（前端）  
- Python 3.8+、venv（後端）  
- Docker（選擇性：啟動 n8n 本地或其他服務）  
- cloud accounts：Render / Hugging Face / Supabase / Pinecone / OpenAI（視需求）

---

## 三、快速上手（本機開發）

### 1) 取得程式碼
```bash
git clone https://github.com/YJWzz/AcneWeb1003.git
cd AcneWeb1003
```

### 2) 後端（Python） - 開發模式
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# 若使用 FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> 功能：接受三張 400×400 圖片、儲存檔案/metadata、呼叫分析模型並回傳結果。fileciteturn1file1L16-L19

### 3) 前端（Node）
```bash
cd ../frontend
npm install
npm run dev
```
前端包含：護理指南頁、聊天 UI、三視角照片上傳。fileciteturn1file0L52-L57

### 4) n8n（本地測試）
本地用 Docker 啟動 n8n：
```bash
docker run -it --rm -p 5678:5678 \
  -e N8N_BASIC_AUTH_USER=you \
  -e N8N_BASIC_AUTH_PASSWORD=pass \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
n8n workflow 主要步驟：Extract from File → Token Splitter → Embeddings(OpenAI) → Pinecone 存入。問答流程為 Webhook → Edit Fields → AI Agent → OpenAI Message → Respond。fileciteturn1file3L45-L55

---

## 四、部署（雲端） — 範例流程

### 建議雲端組合（與專案現況對應）
- 前端：Vercel / Netlify / Render（static site）  
- 後端：Render Web Service（Python）  
- 自動化（n8n）：Hugging Face Space（託管 n8n Editor + Runtime）或自架 Docker on VM。fileciteturn1file5L4-L6  
- 資料庫 / 儲存：Supabase（Postgres + Storage）。fileciteturn1file5L7-L9  
- 向量庫：Pinecone；Embeddings：OpenAI API。fileciteturn1file8L1-L2

### Render 套餐選擇建議（依負載）
你文件列出 Render 方案與建議：Free → Starter → Standard → Pro… 若有背景工作或較長時間的影像推論，建議至少 Starter 或 Standard；大量即時影像/模型推論則考慮 Pro 或以上。fileciteturn1file6L1-L7

### 部署步驟概覽（後端）
1. 在 GitHub push `backend/`  
2. 在 Render 建立 Web Service（連 GitHub）並設定 Build 命令與 start command（例如 `uvicorn main:app --host 0.0.0.0 --port $PORT`）  
3. 在 Render 的 Environment 設定所有 `.env`（見下方 `.env.example`）  
4. 部署並檢查 logs

### 部署步驟概覽（前端）
1. push `frontend/`  
2. 使用 Vercel / Netlify / Render 的 static site，設定 `API_BASE_URL` 指向後端 URL。fileciteturn1file0L32-L36

### 部署 n8n（Hugging Face Space 範例）
1. 在 Hugging Face 創建 Space，選擇 Docker 或 Runtime（依你的 n8n 配置）  
2. 複製 Supabase 的 Transaction pooler 與 SQLAlchemy 相關環境變數至 Space（文件有提醒）。fileciteturn1file4L15-L16  
3. 匯入 n8n workflow JSON（`n8n-workflows/`），測試 webhook 回傳。fileciteturn1file3L41-L48

---

## 五、常見問題（FAQ）與解法
**Q1：分析需要 3–6 分鐘、服務休眠導致首次連線慢？**  
A：此為使用 Render free tier 的常見現象（休眠、資源限制），可升級方案或把高耗時的分析放到 background worker / queue（Redis + RQ / Celery）。fileciteturn1file2L45-L50

**Q2：n8n 無法連接 Supabase / SQLAlchemy？**  
A：確認在 Hugging Face Space 設定 Transaction pooler 與 SQLAlchemy type 並等待 Space 完成連線產生網址。fileciteturn1file4L15-L19

**Q3：聊天機器人回傳格式問題？**  
A：n8n 節點流程中把 OpenAI 的回覆取出（`message.content` 或 `choices[0].message.content`）並只回傳 `reply` 欄位，若格式錯誤請檢查 Edit Fields 節點。fileciteturn1file11L51-L56

---

## 六、監控與維運建議
- 加入 Sentry（Error 報告）與基本的 health-check endpoint（`/healthz`）  
- 定期備份 Supabase 與 Pinecone（export）  
- 為長時間任務加入 job queue，並把任務狀態回傳給前端（job_id + 輪詢或 websocket 顯示進度）。fileciteturn1file2L45-L50

---

## 七、附錄：重要檔案位置（repo 建議）
```
/frontend
/backend
/n8n-workflows
/infra/.env.example
/docs/Acne1.0_web紀錄.pdf
/docs/青春痘護膚平台.pdf
/docs/n8n.pdf
```
（你上傳的三份報告已整合於說明中，參見內文引用）。fileciteturn1file1L12-L19
