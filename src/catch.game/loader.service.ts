import * as PIXI from 'pixi.js';

export class LoaderSVC {
  private loader: PIXI.Loader;

  get resources(): PIXI.IResourceDictionary {
    return this.loader.resources;
  }

  constructor() {
    this.loader = new PIXI.Loader();
  }

  public async add(params: { name: string, url: string }[]) {
    return new Promise((resolve) => {
      this.loader.add(params).load(() => {
        resolve();
      })
    })
  }
}

export const loaderSVC = new LoaderSVC();


export enum ImageResourcesEnum {
  bg = 'bg',
  rereDefault = 'rere-default',
  rereLeft = 'rere-left',
  rereRight = 'rere-right',

  timeMinus = 'time-minus',
  timePlus = 'time-plus'
}
