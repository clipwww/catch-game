import "core-js/stable";
import "regenerator-runtime/runtime";
import dayjs from 'dayjs';

import { ReCatchGame, GameFlowEvent } from '../dist/index'

window.addEventListener('orientationchange', () => {
  window.location.reload();
})
if (!!window.orientation || window.innerHeight <  window.innerWidth) {
  alert('請以直立手機的方式進行遊玩。')
}

const catchGame = new ReCatchGame({
  el: '#app', // 遊戲塞入位置
  width: window.innerWidth, // 遊戲寬
  height: window.innerHeight, // 遊戲高
  showFPS: true, // 查看FPS
  parameters: {
    gameTime: 30, // 遊戲時間
    rereMeta: {
      colDenominator: 6, // 瑞瑞的大小為螢幕的幾分之幾
      leftArrowEl: '#L', // 移動瑞瑞的左邊按鈕 selector
      rightArrowEl: '#R', // 移動瑞瑞的右邊按鈕 selector
      // 瑞瑞左中右圖片
      leftImageUrl: './images/img-rereLeft.png',
      defaultImageUrl: './images/img-rereDefault.png',
      rightImageUrl: './images/img-rereRight.png',
    },
    fallItemMetas: [
      /**
       * name 物品名稱（不可重覆）
       * url 物品圖片
       * score 加減分
       * time 加減時
       * speed 速度
       * limit 數量上限
       * ratio 比例
       * colDenominator 大小為螢幕的幾分之幾
       */
      { name: 'good-gift-item', url: './images/img-goodQa.png', score: 1, time: 0, speed: Math.random() + 4, ratio: 8, colDenominator: 7 },
      { name: 'bad-gift-item', url: './images/img-badQa.png', score: -1, time: 0, speed: Math.random() + 4, ratio: 5, colDenominator: 7 },
      { name: 'bomb-item', url: './images/img-bomb.png', score: 0, time: -5, speed: Math.random() + 4, ratio: 1, colDenominator: 7 },
      { name: 'clock-item', url: './images/img-clock.png', score: 0, time: 3, limit: 4, speed: Math.random() + 4, ratio: 1, colDenominator: 7 }
    ],
    image: {
      backgroundUrl: './images/bg-app02.jpg', // 背景圖片
      timeMinusUrl: './images/bombMinus.png', // 加時特效圖片
      timePlusUrl: './images/timePlus.png', // 減時特效圖片
    },
    sound: {
      muted: true, // 靜音
      backgroundUrl: './audio/mainMusic.mp3', // 背景音樂
      scorePlusUrl: '', // 加分音效
      scoreMinusUrl: '', // 減分音效
      timePlusUrl: '',  // 加時音效
      timeMinusUrl: '',  // 減時音效
    }
  }
});

window['_catchGame'] = catchGame;

catchGame.addEventListener(GameFlowEvent.Ready, () => {
  // console.log(GameFlowEvent.Ready);
  function start() {
    catchGame.start();
    const $el = document.getElementById('js-go');
    $el.removeEventListener('click', start);
    $el.remove();
  }
  document.getElementById('js-go').addEventListener('click', start)
})

catchGame.addEventListener(GameFlowEvent.Catched, (item, score) => {
  // console.log(GameFlowEvent.Catched, item, score);
  document.getElementById('score').innerText = `${score}`;
})


catchGame.addEventListener(GameFlowEvent.Countdown, (seconds) => {
  console.log('countdown', seconds);
  document.getElementById('time').innerText = dayjs().startOf('day').add(seconds, "second")
    .format("mm:ss")
})


catchGame.addEventListener(GameFlowEvent.GameOver, (score, catchedRecords) => {
  console.log('gameover', score, catchedRecords);
  // alert(score)
})
