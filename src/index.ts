import { CatchGame as ReCatchGame, GameFlowEvent } from './catch.game'
import { FallItemMeta, FallItem } from './catch.game/fall-item'

// 本體
export { ReCatchGame };

// Enum
export {
  GameFlowEvent
}

// interface | type
type FallItemVM = FallItem;
export {
  FallItemMeta,
  FallItemVM
}