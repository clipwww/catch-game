# RE Catch Game

## 安裝

```
npm i @re/catch-game
```

---

## 使用
```typescript
import { ReCatchGame } from '@re/catch-game'

const catchGame = new ReCatchGame(options)
```

---

## 設定
```typescript
const options = {
  el: string, // 遊戲塞入位置 selector
  width: string, // 遊戲寬
  height: string, // 遊戲高
  showFPS: boolean, // 查看FPS
  parameters: {
    gameTime: number, // 遊戲時間
    rereMeta: {
      colDenominator: number, // 瑞瑞的大小為螢幕的幾分之幾
      leftArrowEl: string, // 移動瑞瑞的左邊按鈕 selector
      rightArrowEl: string, // 移動瑞瑞的右邊按鈕 selector
      // 瑞瑞左中右圖片
      leftImageUrl: string,
      defaultImageUrl: string,
      rightImageUrl: string,
    },
    fallItemMetas: [
      { 
        name: string, // 物品名稱（不可重覆）
        url: string, // 物品圖片
        score: number, // 加減分
        time: number, // 加減時
        speed: number, // 速度
        limit?: number, // 數量上限
        ratio: number, // 比例
        colDenominator: number // 大小為螢幕的幾分之幾
      },
    ],
    image: {
      backgroundUrl: string, // 背景圖片
      timeMinusUrl: string, // 減時特效圖片
      timePlusUrl: string, // 加時特效圖片
    },
    sound: {
      // 聲音不給就是不會播放
      muted: false, // 靜音
      backgroundUrl?: string, // 背景音樂
      scorePlusUrl?: string, // 加分音效
      scoreMinusUrl?: string, // 減分音效
      timePlusUrl?: string,  // 加時音效
      timeMinusUrl?: string,  // 減時音效
    }
  }
}

const catchGame = new ReCatchGame(options)
```

---

## Methods
```typescript
const catchGame = new ReCatchGame(options)

catchGame.start(); // 開始遊戲

catchGame.pause(); // 暫停遊戲

catchGame.continue(); // 繼續遊戲

catchGame.addEventListener(type: string, handler: Function); // 註冊監聽事件

catchGame.removeEventListener(type: string, handler: Function); // 刪除監聽事件
```

---

## Event

| 事件名稱 | 觸發時機 | 回調參數
|---|---|---|
| ready | 遊戲準備完成<br/>(圖片載入、應用程式初始化完成 | none
| started | 遊戲開始| none
| pause | 遊戲暫停 | none
| continue | 遊戲繼續 | none
| catched | 接到物品時 | fallItem: FallItem (接到的物品), <br/> score: number (目前分數)
| countdown | 秒數有變化時<br/> 倒數或加時減時 | seconds: number (目前秒數)
| gameover | 遊戲結束時<br/>秒數歸零 | score: number (目前分數), <br/> catchedRecords: FallItemMeta[] (遊戲中接到物品的紀錄)

---

# 其他
```typescript

const catchGame = new ReCatchGame(options)

catchGame.muted = true // 靜音

```