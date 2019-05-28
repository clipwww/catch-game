import * as PIXI from 'pixi.js';
import PixiSound from 'pixi-sound'
import moment from 'moment';

import { BaseGame, BaseGameConfig } from './base.game';
import { loaderSVC, ImageResourcesEnum } from './loader.service';
import { ReRe, ReReMeta } from './rere';
import { FallItem, FallItemMeta } from './fall-item';
import { hitTestRectangle, effectTransition } from '../utils/pixi.util';

// PIXI.settings.ROUND_PIXELS = true;
interface CatchGameParameters {
  gameTime: number;

  rereMeta: ReReMeta,
  fallItemMetas: FallItemMeta[],
  image: {
    backgroundUrl: string
    timePlusUrl: string,
    timeMinusUrl: string;
  }
  sound: {
    muted?: boolean;
    backgroundUrl: string;
    scorePlusUrl?: string;
    timePlusUrl?: string;
    scoreMinusUrl?: string;
    timeMinusUrl?: string;
  }
}
export interface CatchGameConfig extends BaseGameConfig {
  parameters: CatchGameParameters
}


export class CatchGame extends BaseGame {
  parameters: CatchGameParameters;
  timer = { // 計算時間用
    fallItem: 0,
    seconds: 0
  }
  isPlaying: boolean = false; // 是否為遊玩中


  rere: ReRe; // 瑞瑞
  fallItems: FallItem[] = [] // 所有掉落物品
  fallItemMetas: FallItemMeta[] = [] // 掉落物品種類
  fallItemRecords: { // 掉落物品紀錄（for檢查上限
    total: number;
    [key: string]: number
  } = {
      get total() {
        return Object.keys(this).reduce((total, key) => {
          return key === 'total' ? total : total += this[key];
        }, 0)
      }
    }
  catchedRecords: FallItemMeta[] = [];

  bgm: PixiSound.Sound;
  scorePlusSound: PixiSound.Sound;
  scoreMinusSound: PixiSound.Sound;
  timePlusSound: PixiSound.Sound;
  timeMinusSound: PixiSound.Sound;



  private _countdown: number = 30;
  get countdown() {
    return this._countdown;
  }
  set countdown(seconds: number) {
    const isGameOver = seconds <= 0
    this.dispatchEvent(GameFlowEvent.Countdown, isGameOver ? 0 : seconds);
    if (isGameOver) {
      this.end();
    }
    this._countdown = seconds;
  }

  private _muted: boolean = false;
  get muted() {
    return !!this._muted;
  }
  set muted(bool) {
    if (this.bgm) {
      this.bgm.muted = bool;
    }
    this._muted = bool;
  }

  constructor(config: CatchGameConfig) {
    super(config);

    this.parameters = config.parameters;
    this.countdown = this.parameters.gameTime;
    this._muted = this.parameters.sound.muted;

    const fallItemMetas = [];
    for (let i = 0; i < this.parameters.fallItemMetas.length; i++) {
      // 根據比例(ratio)建立掉落物品清單
      const meta = this.parameters.fallItemMetas[i];
      fallItemMetas.push(...Array(meta.ratio).fill(undefined).map(() => meta))
    }
    this.fallItemMetas = fallItemMetas;

    this.init();
  }

  private async init(): Promise<void> {
    await this.loadResources(); // 載入所有需要的Source

    this.setBackground(); // 設置背景
    this.rere = new ReRe(this.app, this.parameters.rereMeta); // 建立瑞瑞
    this.stage.addChild(this.rere.container); // 把瑞瑞加入舞台
    this.app.ticker.add(this.processing, this); // 設置遊戲進行的動作

    this.dispatchEvent(GameFlowEvent.Ready); // 觸法初始化完成事件
  }

  public start(): void {
    const now = performance.now();
    this.timer.seconds = now;
    this.timer.fallItem = now;

    this.rere.start();
    this.isPlaying = true; // 正在遊戲中
    console.log(moment().format('HH:mm:ss'))
    this.dispatchEvent(GameFlowEvent.Started); // 觸法遊戲開始事件
  }

  public pause(): void {
    // 暫停遊戲
    this.rere.stop();
    this.fallItems.forEach(item => item.stop());
    this.isPlaying = false;
    this.dispatchEvent(GameFlowEvent.Pause);
  }

  public continue(): void {
    // 繼續遊戲
    this.rere.start();
    this.isPlaying = true; // 正在遊戲中
    this.fallItems.forEach(item => item.start()); // 掉落物品開始掉落
    this.dispatchEvent(GameFlowEvent.Continue); // 觸法繼續遊戲事件
  }

  private async loadResources(): Promise<void> {
    const bgImags = {
      // 背景圖片
      name: ImageResourcesEnum.bg,
      url: this.parameters.image.backgroundUrl,
    }

    const timeEffectImages = [
      // 加時減時特效圖片
      { name: ImageResourcesEnum.timePlus, url: this.parameters.image.timePlusUrl },
      { name: ImageResourcesEnum.timeMinus, url: this.parameters.image.timeMinusUrl }
    ]

    const rereImages = [
      // 瑞瑞左中右圖片
      { name: ImageResourcesEnum.rereLeft, url: this.parameters.rereMeta.leftImageUrl },
      { name: ImageResourcesEnum.rereDefault, url: this.parameters.rereMeta.defaultImageUrl },
      { name: ImageResourcesEnum.rereRight, url: this.parameters.rereMeta.rightImageUrl }
    ]

    const fallItemImages = this.parameters.fallItemMetas.map(item => {
      // 所有掉落物品圖片
      return {
        name: item.name,
        url: item.url
      }
    })

    await loaderSVC.add([bgImags, ...rereImages, ...fallItemImages, ...timeEffectImages]);

    // 背景音樂
    this.bgm = PixiSound.Sound.from({
      url: this.parameters.sound.backgroundUrl,
      autoPlay: !this.muted,
      loop: true,
    });

    // 加分音效
    if (this.parameters.sound.scorePlusUrl) {
      this.scorePlusSound = PixiSound.Sound.from({
        url: this.parameters.sound.scorePlusUrl,
        preload: true,
      });
    }

    // 減分音效
    if (this.parameters.sound.scoreMinusUrl) {
      this.scoreMinusSound = PixiSound.Sound.from({
        url: this.parameters.sound.scoreMinusUrl,
        preload: true,
      });
    }

    // 加時音效
    if (this.parameters.sound.timePlusUrl) {
      this.timePlusSound = PixiSound.Sound.from({
        url: this.parameters.sound.timePlusUrl,
        preload: true,
      });
    }

    // 減時音效
    if (this.parameters.sound.timeMinusUrl) {
      this.timeMinusSound = PixiSound.Sound.from({
        url: this.parameters.sound.timeMinusUrl,
        preload: true,
      });
    }

  }


  private setBackground(): void {
    // 建立背景圖片
    const background = new PIXI.Sprite(loaderSVC.resources[ImageResourcesEnum.bg].texture);
    background.width = this.app.screen.width;
    background.height = this.app.screen.height;
    this.stage.addChild(background);
  }

  private processing(): void {
    if (!this.isPlaying) return; // 非遊玩中（ex 暫停 遊戲結束
    const now = performance.now();

    if (Math.abs(this.timer.seconds - now) >= 1000) {
      // 每秒
      this.countdown -= 1;
      this.timer.seconds = now;
    }

    if (Math.abs(this.timer.fallItem - now) >= 300) {
      // 每 .3秒
      // 建立一次掉落物品
      this.createFallItem();

      this.timer.fallItem = now;
    }


    this.fallItems.filter(item => hitTestRectangle(this.rere.container, item.sprite)).forEach(item => {
      // 如果掉落高度大於籃子就不算
      if (item.sprite.y > this.rere.container.y + (this.rere.container.height / 2)) {
        return;
      }

      this.onHit(item); // 碰撞處理
      this.stage.removeChild(item.sprite); // 從舞台刪掉該掉落物
      item.remove(); // 執行掉落物的刪掉
    });
    this.fallItems = this.fallItems.filter(item => item.sprite.visible);
  }

  private createFallItem(): void {
    if (!this.isPlaying) return;

    if (this.fallItemRecords.total % this.fallItemMetas.length === 0) {
      // 重新配置掉落物品順序
      this.fallItemMetas = this.fallItemMetas.sort(() => Math.random() * 2 > 1 ? -1 : 1);

      console.log(this.fallItemMetas)
    }

    const meta = this.fallItemMetas[this.fallItemRecords.total % this.fallItemMetas.length];
    this.fallItemRecords[meta.name] = (this.fallItemRecords[meta.name] || 0) + 1; // 紀錄增加

    console.log(this.fallItemRecords.total, meta.name);
    if (meta.limit && this.fallItemRecords[meta.name] >= meta.limit) {
      // 掉落物品達到上限，跳過產生下一個
      this.createFallItem();
      return;
    }

    const fallItem = new FallItem(this.app, meta); // 建立掉落物
    this.stage.addChild(fallItem.sprite); // 加入舞台
    this.fallItems.push(fallItem); // 加入掉落物陣列
  }

  private onHit(fallItem: FallItem): void {
    // 發生碰撞
    const { x, y, score = 0, time = 0 } = fallItem;

    if (score !== 0) {
      // 獲得分數
      this.score += score;
      const isPlus = score > 0;

      if (isPlus && this.scorePlusSound && !this.muted) {
        this.scorePlusSound.play();
      }
      if (!isPlus && this.scoreMinusSound && !this.muted) {
        this.scoreMinusSound.play();
      }

      const text = new PIXI.Text(`${isPlus ? '+' : '-'}${Math.abs(score)}`, { // 加減數字
        fontSize: 32,
        fontStyle: 'Italic',
        fontFamily: "Arial",
        lineJoin: "bevel",
        fill: [isPlus ? '#4a6d50' : '#1f2a2f'],
        stroke: '#ffffff',
        strokeThickness: 5,
      });
      text.x = x;
      text.y = y;
      this.app.ticker.add(effectTransition(text, this.app, this.stage), this);
    }

    if (time !== 0) {
      // 增減時間
      this.countdown += time;
      const isPlus = time > 0;
      const sprite = new PIXI.Sprite(loaderSVC.resources[isPlus ? ImageResourcesEnum.timePlus : ImageResourcesEnum.timeMinus].texture);

      if (isPlus && this.timePlusSound && !this.muted) {
        this.timePlusSound.play();
      }
      if (!isPlus && this.timeMinusSound && !this.muted) {
        this.timeMinusSound.play();
      }

      sprite.scale.x = .2;
      sprite.scale.y = .2;
      sprite.x = this.app.screen.width - sprite.width;
      sprite.y = this.app.screen.height / 4;
      this.stage.addChild(sprite);
      this.app.ticker.add(effectTransition(sprite, this.app, this.stage), this);
    }

    this.catchedRecords.push(fallItem.meta);
    this.dispatchEvent(GameFlowEvent.Catched, fallItem, this.score);

  }

  private end(): void {
    // 遊戲結束
    this.muted = true;
    this.isPlaying = false;
    this.app.ticker.remove(this.processing, this); // 刪除進行遊戲的ticker
    this.fallItems.forEach(item => item.stop()); // 停止所有物品掉落
    this.rere.stop(); // 停止瑞瑞的移動
    this.dispatchEvent(GameFlowEvent.GameOver, this.score, this.catchedRecords); // 觸發遊戲結束事件
    console.log(moment().format('HH:mm:ss'))
  }
}


export enum GameFlowEvent {
  /**
   * 遊戲準備完成（圖片載入、應用程式初始化完成
   */
  Ready = 'ready',

  /**
   * 遊戲開始
   */
  Started = 'started',

  /**
   * 遊戲暫停
   */
  Pause = 'pause',

  /**
   * 遊戲繼續
   */
  Continue = 'continue',

  /**
   * 接到物品
   */
  Catched = 'catched',

  /**
   * 倒數
   */
  Countdown = 'countdown',

  /**
   * 遊戲結束
   */
  GameOver = 'gameover',
}
