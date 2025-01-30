import { BoardCoord } from "../../../../amplify/shared/game"
import { SpriteActor } from "../../TowelEngine/engine"
import { SpriteMesh } from "../../TowelEngine/objects/spriteMesh"
import { BuluChessGame } from "../main"

interface CursorConstructor {
  game: BuluChessGame
  idname: string
}

abstract class Cursor extends SpriteActor {
  protected game: BuluChessGame
  protected currentCoord: BoardCoord
  constructor({ game, idname }: CursorConstructor) {
    super({ engine: game.engine, idname: idname, width: game.squareSize })
    this.game = game
    this.currentCoord = "a1"
    this.hide()
  }

  public abstract loadTexture(): void

  public update(coord: BoardCoord) {
    this.currentCoord = coord
    this.setActorPosition({ ...this.game.getPositionFromCoord(coord), z: this.getUpdateZ() })
  }

  protected abstract getUpdateZ(): number
}

export class PrevPosCursor extends Cursor {
  constructor(game: BuluChessGame) {
    super({ game, idname: "prev-pos-cursor" })
  }

  public loadTexture(): void {
    this.setTexture("cs_prev", true)
    this.setColor("#6b3220")
  }

  protected override getUpdateZ(): number {
    return 0.5
  }
}

export class ActiveCursor extends Cursor {
  private moveCrs: SpriteMesh
  private cannonCrs: SpriteMesh
  private aimCrs: SpriteMesh
  constructor(game: BuluChessGame) {
    super({
      game,
      idname: "active-cursor",
    })

    this.moveCrs = this.root.makeClone()
    this.moveCrs.position.set(0, 0, 0.1)
    this.moveCrs.scale.multiplyScalar(1.1)
    this.addChildComponent(this.moveCrs)

    this.cannonCrs = this.root.makeClone()
    this.cannonCrs.position.set(0, 0, 0.2)
    this.cannonCrs.scale.multiplyScalar(1.1)
    this.addChildComponent(this.cannonCrs)

    this.aimCrs = this.root.makeClone()
    this.aimCrs.position.set(0, 0, 0.3)
    this.aimCrs.scale.multiplyScalar(1.1)
    this.addChildComponent(this.aimCrs)
  }

  public loadTexture(): void {
    this.root.setOpacity(0.0)
    this.cannonCrs.setTexture("cs_cannon", true)
    this.cannonCrs.setColor("#FFDD00")
    this.aimCrs.setTexture("cs_aim", true)
    this.aimCrs.setColor("#FF1100")
    this.moveCrs.setTexture("cs_active", true)
    this.moveCrs.setColor("#00FF11")
  }

  public override update(coord: BoardCoord) {
    super.update(coord)
  }

  public setAsMoveMode() {
    this.moveCrs.visible = true
    this.cannonCrs.visible = false
    this.aimCrs.visible = false
  }

  public setAsCannonMode() {
    this.moveCrs.visible = false
    this.cannonCrs.visible = true
    this.aimCrs.visible = false
  }

  public setAsAimMode() {
    this.moveCrs.visible = false
    this.cannonCrs.visible = false
    this.aimCrs.visible = true
  }

  protected override getUpdateZ(): number {
    return 4.0
  }
}
