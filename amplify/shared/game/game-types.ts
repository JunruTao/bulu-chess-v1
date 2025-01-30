/** ## BULU-CHESS Piece Types:
 * #### Standard Chess Pieces:
 * - K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
 * - null/_X_ as empty field
 *
 * #### Extras from Bulu-chess
 * - G=Guard (only exists on 11x and 13x game modes)
 * - c or C=Cannon (standalone)
 * - KC, QC, RC, KC, PC, CC, GC are pieces equipped with cannons
 */

// Piece Definitions -----------------------------------------------------------
export type KING = "k" | "kc" | "K" | "KC"
export type QUEEN = "q" | "qc" | "Q" | "QC"
export type ROOK = "r" | "rc" | "R" | "RC"
export type BISHOP = "b" | "bc" | "B" | "BC"
export type KNIGHT = "n" | "nc" | "N" | "NC"
export type PAWN = "p" | "pc" | "P" | "PC"
export type CANNON = "c" | "cc" | "C" | "CC"
export type GUARD = "g" | "gc" | "G" | "GC"

// prettier-ignore
export type PieceTypePure =
  | KING | QUEEN | ROOK | BISHOP | KNIGHT | PAWN | CANNON | GUARD

export const Kings: KING[] = ["k", "kc", "K", "KC"]
export const Queens: QUEEN[] = ["q", "qc", "Q", "QC"]
export const Rooks: ROOK[] = ["r", "rc", "R", "RC"]
export const Bishops: BISHOP[] = ["b", "bc", "B", "BC"]
export const Knights: KNIGHT[] = ["n", "nc", "N", "NC"]
export const Pawns: PAWN[] = ["p", "pc", "P", "PC"]
export const Cannons: CANNON[] = ["c", "cc", "C", "CC"]
export const Guards: GUARD[] = ["g", "gc", "G", "GC"]

export const PieceList: readonly PieceTypePure[] = [
  ...Kings, ...Queens, ...Rooks, ...Bishops, 
  ...Knights, ...Pawns, ...Cannons, ...Guards,
]

// prettier-ignore
export type PieceFullName =
  | "King"   | "Queen" | "Rook"  | "Bishop"
  | "Knight" | "Pawn"  | "Cannon"| "Guard"
// prettier-ignore
export type PiecePrimType = "k" | "q" | "r" | "b" | "n" | "p" | "c" | "g"
// prettier-ignore
export const PieceNamesLookup: { [key in PiecePrimType]: PieceFullName } = {
  k: "King",   q: "Queen", r: "Rook",   b: "Bishop",
  n: "Knight", p: "Pawn",  c: "Cannon", g: "Guard",
}

export type PieceType = null | PieceTypePure
export type PieceColorLabel = "Black" | "White"
export type PieceColor = "b" | "w"

// Board Definitions -----------------------------------------------------------
export type AttackDirection = /* UP */ -1 | 1 /* DOWN */
export type SquareType = 0 | 1 | 10 | 11 | 66 | 99
export type BoardFormation = SquareType[][]
export type SquareTrueType = "SQUARE" | "SHELTER" | "BATTERY"
export type SquareColor = "B" | "W" | "L" | "R"
// prettier-ignore
export const SquareTypes: { [key in SquareType]: readonly [SquareTrueType, SquareColor] } = {
  0: ["SQUARE", "B"],    1: ["SQUARE", "W"],
  10: ["SHELTER", "B"],  11: ["SHELTER", "W"],
  66: ["BATTERY", "L"], 99: ["BATTERY", "R"],
}
export const getSquareTrueType = (t: SquareType) => SquareTypes[t][0]
export const getBatteryFace = (g: 66 | 99) => (g === 66 ? "L" : "R")
export type BoardSize = 10 | 11 | 13
export type BoardGameMode = "10x" | "11x" | "13x"
export type BoardStringTable = PieceType[][]
export const BoardFileStringCode = "abcdefghijklm"
// prettier-ignore
export type BoardFileDigits = 
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' 
  | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
// prettier-ignore
export type BoardRowDigits = 
  | "1" | "2" | "3" |  "4" |  "5" |  "6" 
  | "7" | "8" | "9" | "10" | "11" | "12" | "13"

export type BoardCoord = `${BoardFileDigits}${BoardRowDigits}`
export type BoardCoordData = { x: number; y: number }
export type BoardCoordinates = BoardCoord[][]

// Move Definitions -----------------------------------------------------------
export type MoveType =
  | "BATTERY"
  | "BOMBARD"
  | "CAPTURE"
  | "CAPTURE_EQUIP"
  | "DUMP"
  | "MOVE"
  | "MOVE_EQUIP"
  | "PROMOTE"
  | "TRANSFER_EQUIP" 
export const MoveTypes = [
  "BATTERY",
  "BOMBARD",
  "CAPTURE",
  "CAPTURE_EQUIP",
  "DUMP",
  "MOVE",
  "MOVE_EQUIP",
  "PROMOTE",
  "TRANSFER_EQUIP",
]
export type MoveUnit = [MoveType, BoardCoord]
export type MoveActionStrip = Array<MoveUnit>
export type MoveSequence = { holder: BoardCoord; actions: MoveActionStrip }
export type CannonSequence = { holder: BoardCoord; action: MoveUnit }
export type MoveCategory = "default" | "cannon" | "bombard"
export type AvailableMoves = {
  default?: Array<MoveSequence>
  cannon?: Array<CannonSequence>
  bombard?: Array<BoardCoord>
}