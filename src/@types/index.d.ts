import { CatchGame } from '../catch.game';


declare global {
  interface Window {
    ReCatchGame: CatchGame;
  }
}
