import * as PIXI from 'pixi.js';
import { loaderSVC, ImageResourcesEnum } from './loader.service';


export interface ReReMeta {
  leftArrowEl?: string;
  rightArrowEl?: string;
  colDenominator: number;
  leftImageUrl: string;
  defaultImageUrl: string;
  rightImageUrl: string;
}

export enum Direction {
  default = 0,

  left = 1,

  right = 2
}

export class ReRe {
  app: PIXI.Application;
  container: PIXI.Container;
  directionSprite: {
    [Direction.default]: PIXI.Sprite;
    [Direction.left]: PIXI.Sprite;
    [Direction.right]: PIXI.Sprite;
  };
  currentDirection: number = Direction.default;
  moveSpeed: number = 10;
  rereMeta: ReReMeta;
  isPlaying = false;

  $leftArrowEl: HTMLElement;
  $rightArrowEl: HTMLElement;

  constructor(app: PIXI.Application, rereMeta: ReReMeta) {
    this.app = app;
    this.rereMeta = rereMeta

    this.$leftArrowEl = document.querySelector(this.rereMeta.leftArrowEl);
    this.$rightArrowEl = document.querySelector(this.rereMeta.rightArrowEl);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.init();
  }

  init(): void {
    // 建立左中右圖片(精靈)
    this.directionSprite = {
      [Direction.default]: new PIXI.Sprite(loaderSVC.resources[ImageResourcesEnum.rereDefault].texture),
      [Direction.left]: new PIXI.Sprite(loaderSVC.resources[ImageResourcesEnum.rereLeft].texture),
      [Direction.right]: new PIXI.Sprite(loaderSVC.resources[ImageResourcesEnum.rereRight].texture),
    }


    // 建立ReRe圖片（左中右）的容器
    this.container = new PIXI.Container();
    for (let key in this.directionSprite) {
      this.container.addChild(this.directionSprite[key]) // 將左中右圖加入容器
      switch (+key) {
        case Direction.left:
        case Direction.right:
          // 左右的圖片先隱藏
          this.directionSprite[key].visible = false;
          break;
      }
    }

    const defaultSprite = this.directionSprite[Direction.default]; // 挑出default的精靈當設置高寬的基礎

    // 設置高寬
    this.container.width = this.app.screen.width / this.rereMeta.colDenominator;
    this.container.height = (defaultSprite.height / defaultSprite.width) * this.container.width;
    // 設置初始位置
    this.container.x = this.app.screen.width / 2 - (this.container.width / 2);
    this.container.y = this.app.screen.height - this.container.height - 20;

    this.bindEvent();
  }

  bindEvent(): void {
    /**
     * window.addEventListener和document.addEventListener區別
     * ref. https://blog.csdn.net/MLGB__NIU/article/details/79107984
     * ref. https://stackoverflow.com/questions/12045440/difference-between-document-addeventlistener-and-window-addeventlistener
     */

    // 鍵盤事件
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    // Touch事件
    document.addEventListener("touchstart", this.onKeyDown, true);
    // document.addEventListener("touchmove", this.onKeyDown, true);
    document.addEventListener("touchend", this.onKeyUp, true);

    // 移除長按事件
    if (this.$leftArrowEl) {
      this.$leftArrowEl.ontouchstart = (e) => false;
    }
    if (this.$rightArrowEl) {
      this.$rightArrowEl.ontouchstart = (e) => false;
    }

    this.app.ticker.add(this.handleMovie, this)
  }

  start(): void {
    this.isPlaying = true;
  }

  stop(): void {
    this.isPlaying = false;
  }

  onKeyDown(e: KeyboardEvent | TouchEvent): void {
    const keyCode = (e as KeyboardEvent).keyCode;
    switch (keyCode) {
      case 39:
        this.currentDirection = Direction.right;
        break;
      case 37:
        this.currentDirection = Direction.left;
        break;
    }

    if (keyCode) return;

    const { leftArrowEl = '', rightArrowEl = '' } = this.rereMeta;
    if (leftArrowEl || rightArrowEl) {
      // 有設定左或右邊箭頭
      switch (true) {
        case this.$leftArrowEl === e.target:
          this.currentDirection = Direction.left;
          break;
        case this.$rightArrowEl === e.target:
          this.currentDirection = Direction.right;
          break;
      }
      return;
    }

    const touchEvt = e as TouchEvent;
    // 取得最後的Touch
    const touche = touchEvt.touches[touchEvt.touches.length - 1];

    if (!touche) return;
    if (touche.clientX < window.screen.width / 2) {
      this.currentDirection = Direction.left;
    } else {
      this.currentDirection = Direction.right;
    }
  }

  onKeyUp(e: KeyboardEvent | TouchEvent): void {
    const keyCode = (e as KeyboardEvent).keyCode;
    switch (true) {
      case keyCode === 39 && this.currentDirection === Direction.right:
      case keyCode === 37 && this.currentDirection === Direction.left:
        this.currentDirection = Direction.default;
        break;
    }

    if (keyCode) return;

    const { leftArrowEl = '', rightArrowEl = '' } = this.rereMeta;
    if (leftArrowEl || rightArrowEl) {
      // 有設定左或右邊箭頭
      switch (true) {
        case this.$leftArrowEl === e.target && this.currentDirection === Direction.left:
        case this.$rightArrowEl === e.target && this.currentDirection === Direction.right:
          this.currentDirection = Direction.default;
          break;
      }
      return;
    }

    this.currentDirection = Direction.default;
  }

  handleMovie(): void {
    if (!this.isPlaying) return;

    for (let key in this.directionSprite) {
      if (+key === this.currentDirection) {
        // 現在移動方向的圖顯示
        this.directionSprite[key].visible = true;
      } else {
        // 隱藏非現在移動方向的圖
        this.directionSprite[key].visible = false;
      }
    }

    switch (this.currentDirection) {
      case Direction.left:
        if (this.container.x <= 0) {
          // 到達左邊邊界
          return;
        }
        this.container.x -= this.moveSpeed;
        break;
      case Direction.right:
        if (this.container.x + this.container.width >= this.app.screen.width) {
          // 到達右邊邊界
          return;
        }
        this.container.x += this.moveSpeed;
        break;
    }

  }



}
