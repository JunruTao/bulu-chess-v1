import {
  BoardCoordData,
  BoardFileStringCode,
  BoardCoord,
  PieceTypePure,
  PieceFullName,
  PieceNamesLookup,
  PiecePrimType,
  PieceColorLabel,
  PieceColor,
} from "./game-types"

export namespace GameUtils {
  export const coordToStringCode = (
    coord: BoardCoordData,
    size: number,
    flipped: boolean = false
  ) => {
    if (flipped) {
      return `${BoardFileStringCode[size - coord.x - 1]}${
        size + 1
      }` as BoardCoord
    }
    return `${BoardFileStringCode[coord.x]}${size - coord.y}` as BoardCoord
  }

  export const stringCodeToCoord = (
    sc: BoardCoord,
    size: number,
    flipped: boolean = false
  ): BoardCoordData => {
    if (flipped) {
      return {
        x: size - BoardFileStringCode.indexOf(sc[0]) - 1,
        y: Number(sc.slice(1)) - 1,
      }
    }
    return {
      x: BoardFileStringCode.indexOf(sc[0]),
      y: size - Number(sc.slice(1)),
    }
  }

  export const getPiecePrimName = (piece: PieceTypePure): PieceFullName => {
    return PieceNamesLookup[piece[0].toLowerCase() as PiecePrimType]
  }

  export const getPieceName = (piece: PieceTypePure): string => {
    return (
      PieceNamesLookup[piece[0].toLowerCase() as PiecePrimType] +
      (piece.length > 1 ? "%" : "")
    )
  }

  export const getPieceColorLabel = (piece: PieceTypePure): PieceColorLabel => {
    return piece === piece.toLowerCase() ? "Black" : "White"
  }

  export const getPieceColor = (piece: PieceTypePure): PieceColor => {
    return piece === piece.toLowerCase() ? "b" : "w"
  }

  export const isWhite = (piece: PieceTypePure): boolean => {
    return piece === piece.toUpperCase()
  }

}
