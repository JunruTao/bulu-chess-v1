import { KING_MOVE_MASK, MoveGetterFunction } from "./utils"
import { AvailableMoves, CANNON } from "../game-types"

export const getCannonMoves: MoveGetterFunction<CANNON> = (
  piece,
  coord,
  data
) => {
  const { x, y } = data.coordStrToXy(coord)
  const color = piece.color

  const moves: AvailableMoves = {
    cannon: [],
  }

  if (piece.isAdvancedCannon()) {
    // todo:
    //
    //
  } else {
    KING_MOVE_MASK.forEach(([dx, dy]) => {
      let _x = x + dx
      let _y = y + dy
      let board = data.coordXyToStr(_x, _y)
      if (data.isInBound(_x, _y) && data.isFriendlyBarePiece(color, _x, _y)) {
        moves.cannon!.push({
          holder: board,
          action: ["MOVE_EQUIP", board],
        })
      }
    })
  }

  if (data.boardSize === 10) {
    // TODO:
  } else if (data.boardSize === 11) {
    // TODO:
  } else if (data.boardSize === 13) {
    // TODO:
  }
  return moves
}
