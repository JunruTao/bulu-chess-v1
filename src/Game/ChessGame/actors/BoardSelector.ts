import { BoardCoord, MoveActionStrip, MoveType, MoveUnit } from "../../../../amplify/shared/game"
import { SpriteActor } from "../../TowelEngine/engine"
import { BuluChessGame } from "../main"

interface BoardMoveSelectorProp {
  game: BuluChessGame
  coordName: BoardCoord
}

type ColorRGB = [number, number, number]
type ClearColorMap = {
  readonly [key in MoveType]: ColorRGB
}

export class BoardMoveSelector extends SpriteActor {
  // TODO: use this actor float above as semi-ui element,
  public coord: BoardCoord
  public moveType: MoveType
  private actionStrip: MoveActionStrip

  static readonly COL_CLEAR: ColorRGB = [0, 100, 0]
  static readonly COL_HOVER: ColorRGB = [3, 3, 10]

  static readonly COLS_CLEAR: ClearColorMap = {
    BATTERY: [0, 100, 0],
    BOMBARD: [100, 0, 0],
    CAPTURE: [0, 100, 0],
    CAPTURE_EQUIP: [0, 100, 0],
    DUMP: [100, 90, 0],
    MOVE: [0, 100, 0],
    MOVE_EQUIP: [100, 90, 0],
    PROMOTE: [10, 120, 10],
    TRANSFER_EQUIP: [100, 90, 0],
  }

  static readonly COLS_HOVER: ClearColorMap = {
    BATTERY: [3, 3, 10],
    BOMBARD: [10, 3, 3],
    CAPTURE: [3, 3, 10],
    CAPTURE_EQUIP: [3, 3, 10],
    DUMP: [10, 10, 3],
    MOVE: [3, 3, 10],
    MOVE_EQUIP: [10, 10, 3],
    PROMOTE: [4, 4, 13],
    TRANSFER_EQUIP: [10, 10, 3],
  }

  constructor({ game, coordName }: BoardMoveSelectorProp) {
    super({ engine: game.engine, idname: coordName + "_selector", width: game.squareSize })
    this.coord = coordName
    this.moveType = "MOVE"
    this.setTexture(`mv_move`, true)
    this.bindMouseHover(
      () => this.setColorRGB(BoardMoveSelector.COLS_HOVER[this.moveType]),
      () => this.setColorRGB(BoardMoveSelector.COLS_CLEAR[this.moveType])
    )
    this.bindPointerClicked(() => {
      game.onClickedMoveSelector(this)
    })
    this.hide()
    this.deactivate()
    this.actionStrip = []
  }

  public activateDefaultMoves(moveActions: MoveActionStrip) {
    this.actionStrip = moveActions
    let mvType = this.actionStrip[0][0]
    if (this.actionStrip.length > 1) {
      mvType = this.actionStrip.at(-1)![0]
    }
    this.setColorRGB(BoardMoveSelector.COLS_CLEAR[mvType])
    if (mvType !== this.moveType) {
      this.setTexture(`mv_${mvType.toLowerCase()}`, true)
      this.moveType = mvType
    }
    this.bindToPointerQuery("CLICK")
    this.bindToPointerQuery("HOVER")
    this.show()
  }

  public activateCannonMoves(cannonAction: MoveUnit) {
    this.actionStrip = [cannonAction]
    let mvType = cannonAction[0]
    this.setColorRGB(BoardMoveSelector.COLS_CLEAR[mvType])
    if (mvType !== this.moveType) {
      this.setTexture(`mv_${mvType.toLowerCase()}`, true)
      this.moveType = mvType
    }
    this.bindToPointerQuery("CLICK")
    this.bindToPointerQuery("HOVER")
    this.show()
  }

  public activateBombardTarget() {
    this.actionStrip = [["BOMBARD", this.coord]]
    let mvType = "BOMBARD" as MoveType
    this.setColorRGB(BoardMoveSelector.COLS_CLEAR[mvType])
    if (mvType !== this.moveType) {
      this.setTexture("mv_bombard", true)
      this.moveType = mvType
    }
    this.bindToPointerQuery("CLICK")
    this.bindToPointerQuery("HOVER")
    this.show()
  }

  public getActionStrip(): MoveActionStrip {
    return this.actionStrip.map((values) => [...values])
  }

  public deactivate() {
    // hide.
    this.hide()
    this.unbindFromPointerQuery("*")
  }
}
