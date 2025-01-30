import {
  AttackDirection,
  PieceColor,
  PieceColorLabel,
  PieceTypePure,
} from "./game-types"
import { GameUtils } from "./game-utils"

export class Piece<T extends PieceTypePure = PieceTypePure> {
  public type: T
  public readonly color: PieceColor
  public readonly colorName: PieceColorLabel
  public readonly dir: AttackDirection
  public userdata: { [key: string]: any }

  constructor(pieceType: T, attackDir: AttackDirection) {
    this.type = pieceType
    this.color = GameUtils.getPieceColor(this.type)
    this.colorName = GameUtils.getPieceColorLabel(this.type)
    this.dir = attackDir
    this.userdata = {}
  }

  public getFullName() {
    return `${this.colorName} : ${GameUtils.getPieceName(this.type)}`
  }

  public hasCannon() {
    return this.type.length === 2
  }

  public isBare() {
    return this.type.length === 1
  }

  public isBareCannon() {
    return this.type.toLowerCase() === "c"
  }

  public isAdvancedCannon() {
    return this.type.toLowerCase() === "cc"
  }

  public isWhite() {
    return this.color === "w"
  }

  public isBlack() {
    return this.color === "b"
  }

  public getEquipCannonType() {
    if (this.isBare()) {
      return (this.type + (this.color === "b" ? "c" : "C")) as T
    }
    return this.type as T
  }

  public getDumpCannonType() {
    if (this.hasCannon()) {
      return this.type[0] as T
    }
    return this.type as T
  }
}
