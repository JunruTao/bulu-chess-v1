import {
  AttackDirection,
  BoardCoord,
  BoardCoordData,
  BoardCoordinates,
  BoardFormation,
  BoardGameMode,
  BoardSize,
  PieceColor,
  PieceTypePure,
  MoveType,
  SquareTypes,
  SquareTrueType,
  SquareColor,
} from "./game-types"
import { BoardDefaults } from "./game-board"
import { GameUtils } from "./game-utils"
import { Piece } from "./game-piece"

export interface GameSessionDataMutable {
  timeTotal: number
  timeLeft: number
  playerTurn: PieceColor
}

export interface GameSessionData extends GameSessionDataMutable {
  sessionId: string
  gameMode: BoardGameMode
  playerMode: "self" | "hvh" | "hva"
  playerRole: "both" | PieceColor | "viewer"
  playerW: string
  playerB: string
  orientation: "WHITE_BOTTOM" | "WHITE_TOP"
  gameState?: string
}

interface OperationLoggerProp {
  op: MoveType
  c0: BoardCoord
  c1: BoardCoord
  p0: Piece<PieceTypePure> | null
  p1: Piece<PieceTypePure> | null
  p0t: Piece<PieceTypePure> | null
  p1t: Piece<PieceTypePure> | null
}
type OpRes = [Piece | null, Piece | null] | null

export class GameData {
  public sessionData: GameSessionData
  public readonly boardData: (Piece | null)[][]
  public readonly boardFormation: BoardFormation
  public readonly boardCoordinates: BoardCoordinates
  public readonly boardSize: BoardSize
  public readonly isBoardFlipped: boolean

  constructor(props: GameSessionData) {
    this.sessionData = { ...props }
    // initialise board
    const { board, formation, size } = BoardDefaults[this.sessionData.gameMode]
    this.boardSize = size
    this.isBoardFlipped = this.sessionData.orientation === "WHITE_TOP"
    this.boardData = board.map((row) =>
      row.map((pieceType) =>
        pieceType
          ? new Piece(pieceType, this.getAttackDirection(pieceType))
          : null
      )
    )
    this.boardFormation = formation.map((row) => [...row])
    this.boardCoordinates = board.map((row, r) =>
      row.map((_p, f) =>
        GameUtils.coordToStringCode({ x: f, y: r }, this.boardSize)
      )
    )

    // getting board data from existing session
    if (this.sessionData.gameState)
      this.dataFromString(this.sessionData.gameState)

    // flip board orientation
    if (this.sessionData.orientation === "WHITE_TOP") {
      this.boardData.reverse().forEach((row) => row.reverse())
      this.boardCoordinates.reverse().forEach((row) => row.reverse())
      // 2024/12/11: Not reversing the formation:
      // - Reversing would look identical
      // - Using Abs left and right for battery, easier for bombard locations
      // this.boardFormation.reverse().forEach((row) => row.reverse())
    }
  }

  public dataFromString(inState: string): void {
    //todo: generate board data from a string
    console.log(inState)
  }

  public dataToString(): string {
    //todo: from board data  to string
    return ""
  }

  public printCurrentBoard(): void {
    let baseString = ""
    for (const row of this.boardData) {
      baseString += "|"
      for (const p of row) {
        if (!p) baseString += " -- "
        else baseString += " " + p.type + (p.hasCannon() ? " " : "  ")
      }
      baseString += "|\n"
    }
    console.log(baseString)
  }

  public decodeFromAndTo(fromCode: BoardCoord, toCode: BoardCoord) {
    const f = GameUtils.stringCodeToCoord(
      fromCode,
      this.boardSize,
      this.isBoardFlipped
    )
    const t = GameUtils.stringCodeToCoord(
      toCode,
      this.boardSize,
      this.isBoardFlipped
    )
    return {
      b0: f,
      b1: t,
      p0: this.boardData[f.y][f.x],
      p1: this.boardData[t.y][t.x],
    }
  }

  public coordXyToStr(xy: BoardCoordData): BoardCoord
  public coordXyToStr(x: number, y: number): BoardCoord
  public coordXyToStr(xy: BoardCoordData | number, y?: number): BoardCoord {
    return GameUtils.coordToStringCode(
      this._convertToPos(xy, y),
      this.boardSize,
      this.isBoardFlipped
    )
  }

  public coordStrToXy(coord: BoardCoord): BoardCoordData {
    return GameUtils.stringCodeToCoord(
      coord,
      this.boardSize,
      this.isBoardFlipped
    )
  }

  private _convertToPos(
    arg1: BoardCoord | BoardCoordData | number,
    arg2?: number
  ): BoardCoordData {
    if (typeof arg1 === "object") {
      return arg1
    } else if (typeof arg1 === "string") {
      return GameUtils.stringCodeToCoord(
        arg1,
        this.boardSize,
        this.isBoardFlipped
      )
    } else if (typeof arg1 === "number" && typeof arg2 === "number") {
      return { x: arg1, y: arg2 }
    } else {
      return { x: -99, y: -99 }
    }
  }

  public getPiece(coord: BoardCoord): Piece | null | undefined
  public getPiece(coordXY: BoardCoordData): Piece | null | undefined
  public getPiece(x: number, y: number): Piece | null | undefined
  public getPiece(
    coordOrPos: BoardCoord | BoardCoordData | number,
    y?: number
  ): Piece | null | undefined {
    const pos = this._convertToPos(coordOrPos, y)
    return this.isInBound(pos) ? this.boardData[pos.y][pos.x] : undefined
  }

  public isInBound(coord: BoardCoord): boolean
  public isInBound(coordXY: BoardCoordData): boolean
  public isInBound(x: number, y: number): boolean
  public isInBound(coordOrX: BoardCoord | BoardCoordData | number, y?: number) {
    const pos = this._convertToPos(coordOrX, y)
    return (
      0 <= pos.x &&
      pos.x < this.boardSize &&
      0 <= pos.y &&
      pos.y < this.boardSize
    )
  }

  public isSquareEmpty(coord: BoardCoord): boolean
  public isSquareEmpty(coordXY: BoardCoordData): boolean
  public isSquareEmpty(x: number, y: number): boolean
  public isSquareEmpty(
    coordOrX: BoardCoord | BoardCoordData | number,
    y?: number
  ): boolean {
    return !Boolean(this.getPiece(this._convertToPos(coordOrX, y)))
  }

  public isOpponentPiece(
    currentColor: PieceColor,
    testCoordOrX: BoardCoord | BoardCoordData | number,
    testY?: number
  ): boolean {
    const piece = this.getPiece(this._convertToPos(testCoordOrX, testY))
    return Boolean(piece && piece.color !== currentColor)
  }

  public isFriendlyPiece(
    currentColor: PieceColor,
    testCoordOrX: BoardCoord | BoardCoordData | number,
    testY?: number
  ): boolean {
    const piece = this.getPiece(this._convertToPos(testCoordOrX, testY))
    return Boolean(piece && piece.color === currentColor)
  }

  public isFriendlyBarePiece(
    currentColor: PieceColor,
    testCoordOrX: BoardCoord | BoardCoordData | number,
    testY?: number
  ): boolean {
    const piece = this.getPiece(this._convertToPos(testCoordOrX, testY))
    return Boolean(piece && piece.color === currentColor && piece.isBare())
  }

  public isCaptureEquipTarget(
    currentPiece: Piece<PieceTypePure>,
    testCoordOrX: BoardCoord | BoardCoordData | number,
    testY?: number
  ): boolean {
    const piece = this.getPiece(this._convertToPos(testCoordOrX, testY))
    return Boolean(
      piece &&
        (piece.hasCannon() || piece.isBareCannon()) &&
        currentPiece.isBare()
    )
  }

  public getSquareType(x: number, y: number): [SquareTrueType, SquareColor] {
    return [...SquareTypes[this.boardFormation[y][x]]]
  }

  public isBatterySquare(x: number, y: number): boolean {
    return this.getSquareType(x, y)[0] === "BATTERY"
  }

  public getAttackDirection(piece: PieceTypePure): AttackDirection {
    return GameUtils.isWhite(piece) === !this.isBoardFlipped ? -1 : 1
  }

  public getHomeFirstRow(piece: PieceTypePure): number {
    return GameUtils.isWhite(piece) === !this.isBoardFlipped
      ? this.boardSize - 1
      : 0
  }

  public getHomeSecondRow(piece: PieceTypePure): number {
    return GameUtils.isWhite(piece) === !this.isBoardFlipped
      ? this.boardSize - 2
      : 1
  }

  public logOperation({ op, c0, c1, p0, p1, p0t, p1t }: OperationLoggerProp) {
    let msg = ""
    if (p0) {
      if (op === "MOVE") {
        msg = `[ ${p0.getFullName()} ] #${op} ${c0} => ${c1}`
      } else if (op === "CAPTURE" && p1) {
        msg = `[ ${p0.getFullName()} ] #${op} [ ${p1.getFullName()} ] ${c0} => ${c1}`
      } else if (op === "CAPTURE_EQUIP" && p1) {
        msg = `[ ${p0.getFullName()} ] #${op} [ ${p1.getFullName()} ] ${c0} => ${c1}`
      } else if (op === "MOVE_EQUIP" && p1 && p1t) {
        let p1str = `${p1.getFullName()} >> ${p1t.getFullName()}`
        msg = `[ ${p0.getFullName()} ] #${op} [ ${p1str} ] ${c0} => ${c1}`
      } else if (op === "TRANSFER_EQUIP" && p1 && p1t && p0t) {
        let p0str = `${p0.getFullName()} >> ${p0t.getFullName()}`
        let p1str = `${p1.getFullName()} >> ${p1t.getFullName()}`
        msg = `[ ${p0str} ] #${op} [ ${p1str} ] ${c0} => ${c1}`
      } else if (op === "DUMP" && p0t) {
        msg = `[ ${p0} >> ${p0t} ] #DUMP ${c0} => ${c1}`
      } else if (op === "BOMBARD" && p0 && p1) {
        msg = `[ ${p0.getFullName()} ] #${op} [ ${p1.getFullName()} ] ${c0} => ${c1}`
      }
      console.log(msg)
      this.printCurrentBoard()
    }
  }

  ////                                           ////
  ////  OPERATIONS - CHANGE DATA AND VALIDATE    ////
  ////                                           ////

  public move(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && !p1) {
      this.boardData[b1.y][b1.x] = p0
      this.boardData[b0.y][b0.x] = null
      this.logOperation({
        op: "MOVE",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: null,
        p0t: null,
        p1t: p0,
      })
      return [null, p1]
    }
    return null
  }

  public capture(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && p1 && p0.color !== p1.color) {
      this.boardData[b1.y][b1.x] = p0
      this.boardData[b0.y][b0.x] = null
      this.logOperation({
        op: "CAPTURE",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: p1,
        p0t: null,
        p1t: p0,
      })
      return [null, p1]
    }
    return null
  }

  public captureEquip(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && p1 && p0.color !== p1.color) {
      if (p1.isBareCannon() || (p1.hasCannon() && !p1.isAdvancedCannon())) {
        // capture equip move...
        const p1c = new Piece(p0.getEquipCannonType(), p0.dir)
        this.boardData[b1.y][b1.x] = p1c
        this.boardData[b0.y][b0.x] = null
        this.logOperation({
          op: "CAPTURE_EQUIP",
          c0: fromCode,
          c1: toCode,
          p0: p0,
          p1: p1,
          p0t: null,
          p1t: p1c,
        })
        return [null, p1c]
      }
    }
    return null
  }

  public moveEquip(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && p1 && p0.color === p1.color && p0.isBareCannon() && p1.isBare()) {
      const p1c = new Piece(p1.getEquipCannonType(), p1.dir)
      this.boardData[b1.y][b1.x] = p1c
      this.boardData[b0.y][b0.x] = null
      this.logOperation({
        op: "MOVE_EQUIP",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: p1,
        p0t: null,
        p1t: p1c,
      })
      return [null, p1c]
    }
    return null
  }

  public transferEquip(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && p1 && p0.color === p1.color && p0.hasCannon() && p1.isBare()) {
      const p0n = new Piece(p0.getDumpCannonType(), p0.dir)
      const p1c = new Piece(p1.getEquipCannonType(), p1.dir)
      this.boardData[b1.y][b1.x] = p1c
      this.boardData[b0.y][b0.x] = p0n
      this.logOperation({
        op: "TRANSFER_EQUIP",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: p1,
        p0t: p0n,
        p1t: p1c,
      })
      return [p0n, p1c]
    }
    return null
  }

  public dump(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && !p1 && p0.hasCannon()) {
      const p0n = new Piece(p0.getDumpCannonType(), p0.dir)
      const p1c = new Piece(p0.isBlack() ? "c" : "C", p0.dir)
      this.boardData[b1.y][b1.x] = p1c
      this.boardData[b0.y][b0.x] = p0n

      this.logOperation({
        op: "DUMP",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: p1,
        p0t: p0n,
        p1t: p1c,
      })
      return [p0n, p1c]
    }
    return null
  }

  public bombard(fromCode: BoardCoord, toCode: BoardCoord): OpRes {
    const { b0, b1, p0, p1 } = this.decodeFromAndTo(fromCode, toCode)
    if (p0 && p1 && p0.hasCannon() && this.isBatterySquare(b0.x, b0.y)) {
      this.boardData[b1.y][b1.x] = null
      this.logOperation({
        op: "BOMBARD",
        c0: fromCode,
        c1: toCode,
        p0: p0,
        p1: p1,
        p0t: p0,
        p1t: null,
      })
      return [p0, null]
    }
    return null
  }
}
