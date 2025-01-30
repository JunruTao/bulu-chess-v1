import {
  KING_MOVE_MASK,
  generateMoveOrCapture,
  MoveGetterFunction,
  generateCannonMoves,
  MoveMasks,
  generateBombardMoves,
} from "./utils"
import { AvailableMoves, KING } from "../game-types"

const BOMB_x10_L: MoveMasks = [[3,3], [3,4], [3,5], [3,6], [4,6]] // prettier-ignore
const BOMB_x10_R: MoveMasks = [[5,3], [6,3], [6,4], [6,5], [6,6]] // prettier-ignore
const BOMB_x11_L: MoveMasks = [[4,4], [3,4], [3,5], [3,6], [4,6]] // prettier-ignore
const BOMB_x11_R: MoveMasks = [[6,4], [7,4], [7,5], [7,6], [6,6]] // prettier-ignore

export const getKingMoves: MoveGetterFunction<KING> = (piece, coord, data) => {
  const { x, y } = data.coordStrToXy(coord)
  const moves: AvailableMoves = {
    default: [],
  }
  KING_MOVE_MASK.forEach(([dx, dy]) => {
    generateMoveOrCapture({
      refMoves: moves,
      thisPiece: piece,
      data: data,
      x: x + dx,
      y: y + dy,
    })
  })

  // generate cannon moves
  if (piece.hasCannon()) {
    generateCannonMoves({
      refMoves: moves,
      data: data,
      thisPiece: piece,
      thisX: x,
      thisY: y,
    })
    if (data.isBatterySquare(x, y)) {
      let batteryDir = data.getSquareType(x, y)[1] as "L" | "R"
      let bomb_masks: MoveMasks = []
      let bomb_dirs: MoveMasks = []
      if (data.boardSize === 10) {
        bomb_masks = batteryDir === "L" ? BOMB_x10_L : BOMB_x10_R
      } else if (data.boardSize === 11) {
        bomb_masks = batteryDir === "L" ? BOMB_x11_L : BOMB_x11_R
      } else if (data.boardSize === 13) {
        // TODO:
      }
      generateBombardMoves({
        refMoves: moves,
        thisX: x,
        thisY: y,
        thisPiece: piece,
        data: data,
        singles: bomb_masks,
        dirs: bomb_dirs,
      })
    }
  }

  return moves
}
