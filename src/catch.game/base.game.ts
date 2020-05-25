import * as PIXI from 'pixi.js';
// import * as dat from "dat.gui";
// const gui = new dat.GUI();

export interface BaseGameConfig {
  el: string;
  width: number;
  height: number;
  showFPS?: boolean;
}


export class BaseGame {
  /**
   * PIXI
   */
  protected app: PIXI.Application; // 遊戲應用程式
  protected stage: PIXI.Container; // 舞台

  protected score: number = 0; // 遊戲分數

  private fpsArr: number[] = [];
  private eventRegistry: {
    [key: string]: Function[],
  } = {};

  constructor(config: BaseGameConfig) {
    const { el, width, height, showFPS } = config;

    // 建立應用程式
    this.app = new PIXI.Application({
      width,
      height,
      transparent: true,
      preserveDrawingBuffer: true,
      clearBeforeRender: true,
    })
    document.querySelector(el).appendChild(this.app.view)

    // 建立舞台
    const stage = new PIXI.Container()
    stage.width = this.app.screen.width;
    stage.height = this.app.screen.height;
    stage.x = 0;
    stage.y = 0;
    stage.sortableChildren = true;

    this.stage = stage

    this.app.stage.addChild(this.stage)

    if (showFPS) {
      this.watchFps();
    }
  }

  public addEventListener(type: string, handler: Function): void {
    // 註冊監聽事件
    type = type.toLowerCase();

    if (!this.eventRegistry.hasOwnProperty(type)) {
      this.eventRegistry[type] = [];
    }

    if (this.eventRegistry[type].indexOf(handler) == -1) {
      this.eventRegistry[type].push(handler);
    }
  }

  public removeEventListener(type: string, handler: Function): void {
    // 刪除監聽事件
    type = type.toLowerCase();

    if (!this.eventRegistry.hasOwnProperty(type)) {
      this.eventRegistry[type] = [];
    }

    const findIndex = this.eventRegistry[type].indexOf(handler);
    if (findIndex == -1) {
      this.eventRegistry[type].splice(findIndex, 1);
    }
  }

  protected dispatchEvent(type: string, ...arg: any): void {
    // 觸發事件
    type = type.toLowerCase();

    if (!this.eventRegistry.hasOwnProperty(type)) {
      return;
    }

    const len = this.eventRegistry[type].length;

    for (let i = 0; i < len; i++) {
      this.eventRegistry[type][i].call(this, ...arg);
    }
  }

  private watchFps(): void {
    // 查看FPS
    const fpsText = new PIXI.Text(`${this.fpsArr.length}`, {
      fontSize: 20,
      fontFamily: "Arial",
      lineJoin: "bevel",
      fill: ['#ffffff'],
      stroke: '#000000',
      strokeThickness: 5,
    });
    fpsText.zIndex = 99;
    this.stage.addChild(fpsText);
    fpsText.x = 10;
    fpsText.y = 10
    this.app.ticker.add(() => {
      const now = performance.now();
      while (this.fpsArr.length > 0 && this.fpsArr[0] <= now - 1000) {
        // 超過一秒的踢出Array
        this.fpsArr.shift();
      }
      this.fpsArr.push(now);
      fpsText.text = `${this.fpsArr.length}`;

    })
  }
}
