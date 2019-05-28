import * as PIXI from 'pixi.js';

type BaseShape = PIXI.Sprite | PIXI.Container;

export function hitTestRectangle(r1: BaseShape, r2: BaseShape): boolean {

  const { x: r1X, y: r1Y } = r1.getGlobalPosition(new PIXI.Point(), true);
  const { x: r2X, y: r2Y } = r2.getGlobalPosition(new PIXI.Point(), true);

  //Calculate the `halfWidth` and `halfHeight` properties of the sprites
  const r1HalfWidth = r1.width / 2;
  const r1HalfHeight = r1.height / 2;
  const r2HalfWidth = r2.width / 2;
  const r2HalfHeight = r2.height / 2;

  //Calculate `centerX` and `centerY` properties on the sprites
  const r1CenterX = r1X + r1HalfWidth;
  const r1CenterY = r1Y + r1HalfHeight;
  const r2CenterX = r2X + r2HalfWidth;
  const r2CenterY = r2Y + r2HalfHeight;

  //Create a `collision` variable that will tell us
  //if a collision is occurring
  let collision = false;

  // console.log(`r1`, {
  //     x: r1.x,
  //     y: r1.y,
  //     width: r1.width,
  //     height: r1.height,
  //     halfWidth: r1HalfWidth,
  //     halfHeight: r1HalfHeight,
  //     centerX: r1CenterX,
  //     centerY: r1CenterY,
  // })
  // console.log(`r2`, {
  //     x: r2.x,
  //     y: r2.y,
  //     width: r2.width,
  //     height: r2.height,
  //     halfWidth: r2HalfWidth,
  //     halfHeight: r2HalfHeight,
  //     centerX: r2CenterX,
  //     centerY: r2CenterY,
  // })

  //Check whether the shapes of the sprites are overlapping. If they
  //are, set `collision` to `true`
  if (Math.abs(r1CenterX - r2CenterX) < r1HalfWidth + r2HalfWidth
    && Math.abs(r1CenterY - r2CenterY) < r1HalfHeight + r2HalfHeight) {
    collision = true;
  }

  //Return the value of `collision` back to the main program
  return collision;
};


export const effectTransition = (effect: PIXI.Sprite | PIXI.Text, app: PIXI.Application, effectContainer: PIXI.Container): () => void => {
  effectContainer.addChild(effect);
  // 特效動畫 往上漂淡出
  function fun(): void {
    if (effect.alpha <= 0) {
      // 透明到看不到後就刪除ticker
      effect.visible = false;
      effectContainer.removeChild(effect);
      app.ticker.remove(fun, this)
      return;
    }
    // 漸漸變淡跟往上飄
    effect.alpha -= 0.01;
    effect.y -= 1;
  }
  return fun;
}
