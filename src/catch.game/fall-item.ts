import * as PIXI from 'pixi.js';
import { loaderSVC } from './loader.service';


export interface FallItemMeta {
  name: string;
  url: string;
  score: number;
  time: number;
  speed: number;
  ratio: number;
  colDenominator: number;
  limit?: number;
}

export class FallItem {
  private app: PIXI.Application;
  private isFalling = true;
  
  public sprite: PIXI.Sprite;
  public meta: FallItemMeta = {
    name: '',
    url: '',
    score: 0,
    time: 0,
    ratio: 0,
    colDenominator: 7,
    speed: 0
  };
  


  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get name(): string {
    return this.meta.name;
  }

  get score(): number {
    return this.meta.score;
  }

  get time(): number {
    return this.meta.time;
  }

  constructor(app: PIXI.Application, meta: FallItemMeta) {
    this.app = app;

    this.meta = meta;

    this.sprite = new PIXI.Sprite(loaderSVC.resources[meta.name].texture);
    this.sprite.height = (this.sprite.height / this.sprite.width) * (this.app.screen.width / this.meta.colDenominator);
    this.sprite.width = this.app.screen.width / this.meta.colDenominator

    this.sprite.x = (this.app.screen.width / this.meta.colDenominator) * Math.floor(Math.random() * this.meta.colDenominator);
    this.sprite.y = -this.sprite.height;

    const scale = Math.min(Math.max(Math.random() * 2, 0.75), 1);
    this.sprite.scale.x *= scale;
    this.sprite.scale.y *= scale;

    this.sprite.rotation = Math.random() * 2 > 1 ? +Math.random() * .5 : -Math.random() * .5;

    this.app.ticker.add(this.handleFall, this);
  }

  private handleFall(): void {
    if (!this.isFalling) return;
    if (this.sprite.y >= this.app.screen.height) {
      this.remove();
      return;
    }
    this.sprite.y += this.meta.speed;
  }

  public start(): void {
    this.isFalling = true;
  }

  public stop(): void {
    this.isFalling = false;
  }

  public remove(): void {
    this.sprite.visible = false;
    this.stop();
    this.app.ticker.remove(this.handleFall, this);
  }

}
