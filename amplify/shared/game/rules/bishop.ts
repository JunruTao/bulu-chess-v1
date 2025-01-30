import {
  generateBombardMoves,
  generateCannonMoves,
  getSlidingMoves,
  MoveGetterFunction,
  MoveMasks,
} from "./utils"
import { AvailableMoves, BISHOP } from "../game-types"

const BOMB_x10_L_Dirs: MoveMasks = [[-1,-1], [-1,1]] // prettier-ignore
const BOMB_x10_R_Dirs: MoveMasks = [[1,-1], [1,1]] // prettier-ignore

const BOMB_x11_L_Dirs: MoveMasks = [[-1,-1], [-1,1]] // prettier-ignore
const BOMB_x11_R_Dirs: MoveMasks = [[1,-1], [1,1]] // prettier-ignore
const BOMB_x11_L: MoveMasks = [[4,4],[3,5],[4,6]] // prettier-ignore
const BOMB_x11_R: MoveMasks = [[6,4],[7,5],[6,6]] // prettier-ignore

export const getBishopMoves: MoveGetterFunction<BISHOP> = (
  piece,
  coord,
  data
) => {
  const { x, y } = data.coordStrToXy(coord)
  // prettier-ignore
  const moves: AvailableMoves = getSlidingMoves({
    thisX:x, 
    thisY:y, 
    thisPiece: piece, 
    data:data,
    dirs: [
      [1, 1], [1, -1], [-1, 1], [-1, -1], // Bishop directions
    ],
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
        bomb_dirs = batteryDir === "L" ? BOMB_x10_L_Dirs : BOMB_x10_R_Dirs
      } else if (data.boardSize === 11) {
        bomb_dirs = batteryDir === "L" ? BOMB_x11_L_Dirs : BOMB_x11_R_Dirs
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
