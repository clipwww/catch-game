import { MyReBridge } from "../view-models/common.vm";
import { CatchGame } from '../catch.game';


declare global {
  interface Window {
    __isInReApp: boolean;
    __myreAppBridge: MyReBridge;
    ReCatchGame: CatchGame;
  }
}
