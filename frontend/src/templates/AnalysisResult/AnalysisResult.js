import React, { useEffect, useState } from "react";
import { marked } from "marked";
import AnalysisResultstyles from "./AnalysisResult.module.css";

import TMUlogo from "../../image/TMU logo.png";
import NTUTlogo from "../../image/NTUT logo.png";
import TMUSHHlogo from "../../image/TMUSHH logo.jpg";
import COSMEDlogo from "../../image/COSMED.png";
import WATSONSlogo from "../../image/WATSONS.png";

function AnalysisResult() {
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState("");
  const [uploadTime, setUploadTime] = useState("");
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adviceLoading, setAdviceLoading] = useState(false);

  /* ---------- 第一次進來就抓結果 ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("user_id");
    if (!uid) { setLoading(false); return; }

    setUserId(uid);

    fetch(`/result?user_id=${uid}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        if (data.results?.length) setUploadTime(data.results[0].upload_time);

        if (data.advice) {
          setAdvice([marked(data.advice)]);
        } else {
          requestAdvice(data.results, uid);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- 若後端沒存 advice，就自己呼叫 n8n 生成 ---------- */
  async function requestAdvice(resultList, uid) {
    setAdviceLoading(true);
    const prompt = resultList.map(r => `${r.face_part} face: ${r.severity}`).join("\n");

    try {
      const res = await fetch(`${process.env.REACT_APP_N8N_API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `根據以下痘痘分析結果提供衛教建議和可參考資源：\n${prompt}` })
      });
      const data = await res.json();
      const markdown = data.reply || "無法取得建議";
      setAdvice([marked(markdown)]);

      await fetch("/save-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid, advice: markdown })
      });
    } catch {
      setAdvice(["無法取得衛教建議，請稍後再試。"]);
    } finally {
      setAdviceLoading(false);
    }
  }

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  /* ---------- 畫面 ---------- */
  return (
    <div className={AnalysisResultstyles.wrapper}>
      {/* Loading 轉圈圈 */}
      {loading ? (
        <div className={AnalysisResultstyles.loadingOverlay}>
          <div className={AnalysisResultstyles.spinner}></div>
          <p>資料分析中，請稍候...</p>
        </div>
      ) : (
        <>
          {/* 使用者資訊 */}
          <h1 className={AnalysisResultstyles.title}>使用者姓名: {userId}</h1>
          <p className={AnalysisResultstyles.uploadTime}>上傳時間: {uploadTime}</p>

          {/* 照片 + 結果卡片 */}
          <div className={AnalysisResultstyles.resultContainer}>
            <div className={AnalysisResultstyles.imageContainer}>
              {results.map((r, idx) => (
                <div key={idx} className={AnalysisResultstyles.resultCard}>
                  <h3>{capitalize(r.face_part)} Face</h3>
                  <img
                    src={`/uploads/${userId}/${r.filename}`}
                    alt={`${r.face_part} face`}
                    className={AnalysisResultstyles.resultImage}
                  />
                  <p>痤瘡等級: {r.severity}</p>
                  <p>痘痘總數: {r.acne_count} 顆</p>
                  {r.acne_types &&
                    Object.entries(r.acne_types).map(([type, info]) => (
                      <p key={type}>{type}：{info.count} 顆</p>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* AI 建議 */}
          <h2 className={AnalysisResultstyles.adviceTitle}>AI 衛教建議與參考資料</h2>
          <div className={AnalysisResultstyles.adviceSection}>
            {adviceLoading ? (
              <div className={AnalysisResultstyles.adviceLoading}>
                <div className={AnalysisResultstyles.spinner}></div>
                <p>正在生成建議中，請稍候...</p>
              </div>
            ) : advice.map((html, idx) => (
              <div key={idx}
                className={AnalysisResultstyles.adviceHTML}
                dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>

          {/* 返回按鈕 */}
          <div className={AnalysisResultstyles.back}>
            <a href="/" className={AnalysisResultstyles.backLink}>返回青春痘護膚平台</a>
          </div>

          {/* Footer */}
          <footer className={AnalysisResultstyles.footer}>
            <div className={AnalysisResultstyles.footerContainer}>
              <div className={AnalysisResultstyles.footerSection}>
                <h4>關於我們</h4>
                <p>本平台致力於提供青春痘評估、個人化護理建議與互動式問答，協助使用者改善肌膚健康。</p>
              </div>

              <div className={AnalysisResultstyles.footerSection}>
                <h4>聯絡資訊</h4>
                <p>Email: support@acnecare.com</p>
                <p>電話: 0800-123-456</p>
              </div>

              <div className={AnalysisResultstyles.footerSection}>
                <h4>致謝</h4>
                <a href="https://www.tmu.edu.tw/">
                  <img src={TMUlogo} alt="TMU Logo" className={AnalysisResultstyles.footerlogo} />
                </a>
                <br />
                <a href="https://www.ntut.edu.tw/">
                  <img src={NTUTlogo} alt="NTUT Logo" className={AnalysisResultstyles.footerlogo} />
                </a>
              </div>
            </div>

            <div className={AnalysisResultstyles.footerSection}>
              <h4>外部連結</h4>
              <div className={AnalysisResultstyles.footerlink}>
                <div>
                  <h6>雙和醫院掛號連結 :</h6>
                  <a href="https://www.shh.org.tw/page/team.aspx">
                    <img src={TMUSHHlogo} alt="TMUSHH Logo"
                      className={AnalysisResultstyles.footerlogo}
                      style={{ width: "250px" }} />
                  </a>
                </div>
                <div>
                  <h6>更多醫療產品 :</h6>
                  <a href="https://www.cosmed.com.tw/">
                    <img src={COSMEDlogo} alt="COSMED Logo" className={AnalysisResultstyles.footerlogo} />
                  </a>
                  <a href="https://www.watsons.com.tw/">
                    <img src={WATSONSlogo} alt="WATSONS Logo" className={AnalysisResultstyles.footerlogo} />
                  </a>
                </div>
              </div>
            </div>

            <div className={AnalysisResultstyles.footerBottom}>
              <p>© 2025 AcneCare Platform. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default AnalysisResult;
