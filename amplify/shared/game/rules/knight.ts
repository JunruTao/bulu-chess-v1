import {
  generateBombardMoves,
  generateCannonMoves,
  generateMoveOrCapture,
  MoveGetterFunction,
  MoveMasks,
} from "./utils"
import { AvailableMoves, KNIGHT } from "../game-types"

// prettier-ignore
const mask10x: MoveMasks = [
  [2, 1], [2, -1], [-2, 1], [-2, -1], // standard chess
  [1, 2], [1, -2], [-1, 2], [-1, -2], // standard chess
  [0, 1], [0, -1], [ 1, 0], [-1,  0], // bulu chess
];

// prettier-ignore
const mask11x: MoveMasks = [
  [2, 1], [2, -1], [-2, 1], [-2, -1], // standard chess
  [1, 2], [1, -2], [-1, 2], [-1, -2], // standard chess
  [0, 2], [0, -2], [ 2, 0], [-2,  0], // bulu chess
];

// prettier-ignore
const mask13x: MoveMasks = [
  [2, 1], [2, -1], [-2, 1], [-2, -1], // standard chess
  [1, 2], [1, -2], [-1, 2], [-1, -2], // standard chess
  [0, 3], [0, -3], [ 3, 0], [-3,  0], // bulu chess
];

const BOMB_x10_L: MoveMasks = [[3,3], [2,4], [3,5], [2,6], [3,7], [4,6], [5,7]] // prettier-ignore
const BOMB_x10_R: MoveMasks = [[4,2], [5,3], [6,4], [7,5], [6,6], [6,2], [7,3]] // prettier-ignore
const BOMB_x11_L: MoveMasks = [[2,3],[2,4],[2,5],[2,6],[2,7], [3,3],[4,3], [3,7],[4,7]] // prettier-ignore
const BOMB_x11_R: MoveMasks = [[8,3],[8,4],[8,5],[8,6],[8,7], [6,3],[7,3], [6,7],[7,7]] // prettier-ignore

export const getKnightMoves: MoveGetterFunction<KNIGHT> = (
  piece,
  coord,
  data
) => {
  const { x, y } = data.coordStrToXy(coord)
  const moves: AvailableMoves = {
    default: [],
  }

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

  let moveMask: MoveMasks = []
  if (data.boardSize === 10) {
    moveMask = mask10x
  } else if (data.boardSize === 11) {
    moveMask = mask11x
  } else if (data.boardSize === 13) {
    moveMask = mask13x
  }

  // generate move from mask
  moveMask.forEach(([dx, dy]) => {
    generateMoveOrCapture({
      refMoves: moves,
      thisPiece: piece,
      data: data,
      x: x + dx,
      y: y + dy,
    })
  })

  return moves
}
