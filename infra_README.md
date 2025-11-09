# Infra 快速說明（給 DevOps / 後端工程師）

## 目的
匯總部署所需的雲端服務、套餐建議、環境變數與檢查清單，讓維運人員可以快速完成服務上線。

## 1. 服務清單（目前建議）
- Render：後端 API（可選 Starter / Standard 視流量），若需 background worker 或較長時間的推論，選 Standard 或 Pro。fileciteturn1file12L137-L144  
- Vercel / Netlify / Render：前端靜態網站  
- Hugging Face Space：n8n Editor + Runtime（提供公開 webhook URL）fileciteturn1file5L4-L6  
- Supabase：Postgres + Storage + Auth（儲存上傳影像與 metadata）fileciteturn1file8L61-L66  
- Pinecone：向量庫（向量檢索）  
- OpenAI：Embeddings 與 Chat Models

## 2. Render 套餐快速對照
- Free：測試用（會休眠，適合 Demo）  
- Starter：建議小型 API（可啟用 background worker）  
- Standard / Pro：建議生產環境（Persistent Disk、更多 CPU/RAM）  
說明與建議見專案紀錄。fileciteturn1file6L1-L7

## 3. 部署檢查清單（上線前）
- [ ] 環境變數是否全部設定（OpenAI / Pinecone / Supabase / Database / N8N）  
- [ ] CORS：前端 domain 是否在後端允許名單內  
- [ ] HTTPS：確保所有 webhook 與 API 使用 HTTPS（n8n 與前端通訊）fileciteturn1file12L16-L16  
- [ ] Supabase Storage 容量與資料保留策略（定期清理或升級）fileciteturn1file8L34-L36  
- [ ] Render logs 與 n8n workflow logs 測試（確認 webhook 可觸發且無權限錯誤）fileciteturn1file3L41-L48

## 4. n8n 相關建議
- 使用 SQLAlchemy type 並把 Supabase transaction pooler 變數複製到 Hugging Face 的環境變數（以維持穩定連線）。fileciteturn1file4L15-L16  
- 把 n8n workflow JSON 放在 repo（`n8n-workflows/`）做版本控制，更新時再匯入（避免直接在 editor 內改動卻無版本記錄）。fileciteturn1file3L41-L48

## 5. 備援與擴充（建議）
- 若分析時間過長（3–6 分鐘），把影像分析改採「Job queue + Background worker」→ job_id 回傳給前端，前端輪詢或 WebSocket 顯示進度。fileciteturn1file2L45-L50  
- 若想提供更即時的體驗，考慮把推論放到具 GPU 的雲端或使用輕量化模型。
