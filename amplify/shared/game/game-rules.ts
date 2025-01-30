import { GameData } from "./game-data"
// prettier-ignore
import {
  BISHOP, CANNON, GUARD, KING, KNIGHT, PAWN, QUEEN, ROOK,
  Bishops,Cannons,Guards,Kings,Knights,Pawns,Queens,Rooks,
  BoardCoord, PieceTypePure, AvailableMoves,
} from "./game-types"
import { Piece } from "./game-piece"
import { getBishopMoves } from "./rules/bishop"
import { getCannonMoves } from "./rules/cannon"
import { getGuardMoves } from "./rules/guard"
import { getKingMoves } from "./rules/king"
import { getKnightMoves } from "./rules/knight"
import { getPawnMoves } from "./rules/pawn"
import { getQueenMoves } from "./rules/queen"
import { getRookMoves } from "./rules/rook"

export namespace GameRules {
  export const getAvailableMoves = (
    piece: Piece<PieceTypePure>,
    coord: BoardCoord,
    data: GameData
  ): AvailableMoves => {
    if (Bishops.includes(piece.type as BISHOP)) {
      return getBishopMoves(piece as Piece<BISHOP>, coord, data)
    }
    if (Cannons.includes(piece.type as CANNON)) {
      return getCannonMoves(piece as Piece<CANNON>, coord, data)
    }
    if (Guards.includes(piece.type as GUARD)) {
      return getGuardMoves(piece as Piece<GUARD>, coord, data)
    }
    if (Kings.includes(piece.type as KING)) {
      return getKingMoves(piece as Piece<KING>, coord, data)
    }
    if (Knights.includes(piece.type as KNIGHT)) {
      return getKnightMoves(piece as Piece<KNIGHT>, coord, data)
    }
    if (Pawns.includes(piece.type as PAWN)) {
      return getPawnMoves(piece as Piece<PAWN>, coord, data)
    }
    if (Queens.includes(piece.type as QUEEN)) {
      return getQueenMoves(piece as Piece<QUEEN>, coord, data)
    }
    if (Rooks.includes(piece.type as ROOK)) {
      return getRookMoves(piece as Piece<ROOK>, coord, data)
    }
    return {}
  }
}