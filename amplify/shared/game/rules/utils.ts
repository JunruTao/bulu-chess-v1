import { GameData } from "../game-data"
import { Piece } from "../game-piece"
import {
  AvailableMoves,
  BoardCoord,
  MoveActionStrip,
  PieceColor,
  PieceTypePure,
} from "../game-types"

export type MoveGetterFunction<T extends PieceTypePure> = (
  piece: Piece<T>,
  coord: BoardCoord,
  data: GameData
) => AvailableMoves

type MoveUnit = -1 | 1 | 0
type MoveDirection = [MoveUnit, MoveUnit]

export type MoveMasks = readonly [number, number][]
// prettier-ignore
export const KING_MOVE_MASK: MoveMasks = [
  [1, 0], [-1, 0], [0,  1], [ 0, -1], 
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

interface GenerateMoveOrCaptureProps {
  refMoves: AvailableMoves
  thisPiece: Piece
  data: GameData
  x: number
  y: number
}

export const generateMoveOrCapture = ({
  refMoves,
  thisPiece,
  data,
  x,
  y,
}: GenerateMoveOrCaptureProps) => {
  if (refMoves.default) {
    const hasCannon = thisPiece.hasCannon()
    let actions: MoveActionStrip
    let board = data.coordXyToStr(x, y)
    if (data.isInBound(x, y)) {
      if (data.isSquareEmpty(x, y)) {
        actions = [["MOVE", board]]
        if (hasCannon && data.isBatterySquare(x, y)) {
          actions.push(["BATTERY", board])
        }
        refMoves.default.push({
          holder: board,
          actions: actions,
        })
        return true
      } else if (data.isOpponentPiece(thisPiece.color, x, y)) {
        actions = [
          [
            data.isCaptureEquipTarget(thisPiece, x, y)
              ? "CAPTURE_EQUIP"
              : "CAPTURE",
            board,
          ],
        ]
        if (hasCannon && data.isBatterySquare(x, y)) {
          actions.push(["BATTERY", board])
        }

        refMoves.default.push({
          holder: board,
          actions: actions,
        })
      }
    }
  }
  return false
}

interface GenerateCannonMovesProps {
  refMoves: AvailableMoves
  thisX: number
  thisY: number
  thisPiece: Piece
  data: GameData
}

export const generateCannonMoves = ({
  refMoves,
  thisX,
  thisY,
  thisPiece,
  data,
}: GenerateCannonMovesProps) => {
  refMoves.cannon = []
  let x: number, y: number, board: BoardCoord
  for (const [dx, dy] of KING_MOVE_MASK) {
    x = thisX + dx
    y = thisY + dy
    board = data.coordXyToStr(x, y)
    if (data.isInBound(x, y)) {
      if (data.isSquareEmpty(x, y)) {
        refMoves.cannon.push({
          holder: board,
          action: ["DUMP", board],
        })
      } else if (data.isFriendlyBarePiece(thisPiece.color, x, y)) {
        refMoves.cannon.push({
          holder: board,
          action: ["TRANSFER_EQUIP", board],
        })
      }
    }
  }
}

interface GetSlidingMovesProps {
  thisX: number
  thisY: number
  thisPiece: Piece
  data: GameData
  dirs: Array<MoveDirection>
}

export const getSlidingMoves = ({
  thisX,
  thisY,
  thisPiece,
  data,
  dirs,
}: GetSlidingMovesProps) => {
  const moves: AvailableMoves = {
    default: [],
  }
  let nx: number, ny: number

  for (const [dx, dy] of dirs) {
    nx = thisX + dx
    ny = thisY + dy
    while (
      generateMoveOrCapture({ refMoves: moves, thisPiece, data, x: nx, y: ny })
    ) {
      nx += dx
      ny += dy
    }
  }

  return moves
}

const _generateBombardFromDir = (
  refMoves: AvailableMoves,
  thisPiece: Piece,
  data: GameData,
  x: number,
  y: number
) => {
  if (refMoves.bombard) {
    if (data.isInBound(x, y)) {
      if (data.isSquareEmpty(x, y)) {
        return true
      } else if (data.isOpponentPiece(thisPiece.color, x, y)) {
        refMoves.bombard.push(data.coordXyToStr(x, y))
      }
    }
    return false
  }
}

interface GenerateBombardMovesProps {
  refMoves: AvailableMoves
  thisX: number
  thisY: number
  thisPiece: Piece
  data: GameData
  singles: MoveMasks
  dirs: MoveMasks
}

export const generateBombardMoves = ({
  refMoves,
  thisX,
  thisY,
  thisPiece,
  data,
  singles,
  dirs,
}: GenerateBombardMovesProps) => {
  refMoves.bombard = []
  let board: BoardCoord
  if (singles.length) {
    for (const [x, y] of singles) {
      if (data.isInBound(x, y) && data.isOpponentPiece(thisPiece.color, x, y)) {
        board = data.coordXyToStr(x, y)
        refMoves.bombard.push(board)
      }
    }
  }
  if (dirs.length) {
    let nx: number, ny: number
    for (const [dx, dy] of dirs) {
      nx = thisX + dx
      ny = thisY + dy
      while (_generateBombardFromDir(refMoves, thisPiece, data, nx, ny)) {
        nx += dx
        ny += dy
      }
    }
  }
}
