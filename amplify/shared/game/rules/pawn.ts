import {
  generateBombardMoves,
  generateCannonMoves,
  MoveGetterFunction,
  MoveMasks,
} from "./utils"
import {
  AvailableMoves,
  BoardCoord,
  MoveActionStrip,
  PAWN,
} from "../game-types"

const BOMB_x10_L: MoveMasks = [[3,4], [2,5], [3,6], [4,7]] // prettier-ignore
const BOMB_x10_R: MoveMasks = [[5,2], [6,3], [7,4], [6,5]] // prettier-ignore
const BOMB_x11_L: MoveMasks = [[4,3], [3,4], [2,5], [3,6], [4,7]] // prettier-ignore
const BOMB_x11_R: MoveMasks = [[6,3], [7,4], [8,5], [7,6], [6,7]] // prettier-ignore

export const getPawnMoves: MoveGetterFunction<PAWN> = (piece, coord, data) => {
  const { x, y } = data.coordStrToXy(coord)
  const hasCannon = piece.hasCannon()
  const col = piece.color
  const dir = piece.dir
  const str = data.getHomeSecondRow(piece.type)
  const moves: AvailableMoves = {
    default: [],
  }

  let board: BoardCoord
  let board2: BoardCoord
  let nx: number, ny: number, nx2: number, ny2: number
  let actions: MoveActionStrip

  // Single-step forward
  ny = y + dir
  if (data.isInBound(x, ny) && data.isSquareEmpty(x, ny)) {
    board = data.coordXyToStr(x, ny)
    actions = [["MOVE", board]]
    if (hasCannon && data.isBatterySquare(x, ny)) {
      actions.push(["BATTERY", board])
    }
    moves.default!.push({
      holder: board,
      actions: actions,
    })
    // Double-step forward (cannot be battery)
    ny = y + 2 * dir
    if (y === str && data.isSquareEmpty(x, ny)) {
      board2 = data.coordXyToStr(x, ny)
      moves.default!.push({
        holder: board2,
        actions: [["MOVE", board2]],
      })
    }
  }

  // Diagonal captures (10x, 11x, 13x)
  ;[-1, 1].forEach((lr) => {
    nx = x + lr
    ny = y + dir
    if (data.isInBound(nx, ny) && data.isOpponentPiece(piece.color, nx, ny)) {
      board = data.coordXyToStr(nx, ny)
      const captureType = data.isCaptureEquipTarget(piece, nx, ny)
        ? "CAPTURE_EQUIP"
        : "CAPTURE"
      actions = [[captureType, board]]

      if (hasCannon && data.isBatterySquare(nx, ny)) {
        actions.push(["BATTERY", board])
      }
      moves.default!.push({
        holder: board,
        actions: actions,
      })

      // forward mover (BULU chess rule) - en passion
      nx2 = nx + lr
      ny2 = ny + dir
      if (data.isInBound(nx2, ny2) && data.isSquareEmpty(nx2, ny2)) {
        board2 = data.coordXyToStr(nx2, ny2)
        actions = [
          [captureType, board],
          ["MOVE", board2],
        ]
        if (hasCannon && data.isBatterySquare(nx2, ny2)) {
          actions.push(["BATTERY", board])
        }
        moves.default!.push({
          holder: board2,
          actions: actions,
        })
      }
    }
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
