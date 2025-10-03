import { useEffect, useRef, useState } from "react";
import { Card, Button } from "react-bootstrap";
import Producttyles from "./Product.module.css";

import Product1 from "../../image/product/7769280.jpg";
import Product2 from "../../image/product/5387915.jpg";
import Product3 from "../../image/product/10682218.jpg";
import Product4 from "../../image/product/6566612.jpg";

function Product() {
  const [visibleCards, setVisibleCards] = useState(0);
  const titleRef = useRef(null);
  const hasAnimatedRef = useRef(false); // 防止重複啟動畫面

  const cardData = [
    {
      src: Product1,
      title: "CeraVe適樂膚水楊酸煥膚淨嫩潔膚露473ml",
      text: "溫和去除老廢角質，同時調理油脂分泌過多，預防痘痘粉刺形成，使肌膚更加潤澤平滑",
      link: "https://shop.cosmed.com.tw/SalePage/Index/7769280"
    },
    {
      src: Product2,
      title: "Pair沛醫亞淨痘調理洗面乳 80g",
      text: "溫和低敏潔顏，IPMP 抑菌控油；甘草酸鉀抗炎抗氧化；維 C＋大豆萃取深層保濕，全面預防並改善成人粉刺、痘痘與毛孔粗大。",
      link: "https://shop.cosmed.com.tw/SalePage/Index/5387915"
    },
    {
      src: Product3,
      title: "妮維雅煥膚柔嫩奇肌雙管精萃凝乳60ml",
      text: "結合醫美精華，煥回細緻光滑膚觸\n3酸煥膚精華；7天有效改善粗糙顆粒\n經皮膚科學實證，敏感肌適用",
      link: "https://shop.cosmed.com.tw/SalePage/Index/10682218"
    },
    {
      src: Product4,
      title: "DermaAngel護妍天使 集中抗痘精華10ml",
      text: "集中抗痘精華 高效淨痘 預防復發滲透根源 添加Ceramide輔助抗痘活性成分被肌膚吸收，迅速滲入肌底，同時提升肌膚健康保護力高效致痘",
      link: "https://shop.cosmed.com.tw/SalePage/Index/6566612"
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true; // 標記已播放
          let i = 0;
          const interval = setInterval(() => {
            setVisibleCards((prev) => {
              if (prev < cardData.length) {
                return prev + 1;
              } else {
                clearInterval(interval);
                return prev;
              }
            });
            i++;
          }, 300);
        }

        // 離開區域，重設動畫
        // if (!entry.isIntersecting && hasAnimatedRef.current) {
        //   hasAnimatedRef.current = false;
        //   setVisibleCards(0);
        // }
      },
      { threshold: 0.3 }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, [cardData.length]);

  return (
    <div className={Producttyles.container}>
      <div className={Producttyles.bodytitle} id="Upload Photo" ref={titleRef}>
        產品推薦 :
      </div>
      <div className={Producttyles.productItem}>
        {cardData.map((card, index) => (
          <Card
            key={index}
            className={`${Producttyles.cardEnter} ${index < visibleCards ? Producttyles.cardVisible : ""}`}
            style={{ width: "27rem", height: "23rem", marginBottom: "1rem" }}
          >
            <div className={Producttyles.productImg}>
              <Card.Img variant="top" src={card.src} style={{ width: "10rem", height: "10rem" }} />
            </div>
            <Card.Body style={{ padding: "5px 40px" }}>
              <Card.Title style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{card.title}</Card.Title>
              <Card.Text className={Producttyles.productIntrotext}>{card.text}</Card.Text>
              <div className={Producttyles.productBotton}>
                <Button href={card.link} variant="primary">購買去</Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Product;
