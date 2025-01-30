import { BoardCoord, Piece, PieceTypePure } from "../../../../amplify/shared/game"
import { SpriteActor } from "../../TowelEngine/engine"
import { InterpolationType } from "../../TowelEngine/managers/animation"
import { BuluChessGame } from "../main"
import { nanoid } from "nanoid"
import * as THREE from "three"

interface PieceActorConstructor {
  game: BuluChessGame
  piece: Piece<PieceTypePure>
  coord: BoardCoord
}

type PostMoveFn = (fromCoord: BoardCoord, toCoord: BoardCoord) => void
type PostMoveFnWithPiece = (fromCoord: BoardCoord, toCoord: BoardCoord, piece: PieceActor) => void
type PostMoveFnNoArg = () => void

export class PieceActor extends SpriteActor {
  public coord: BoardCoord
  public piece: Piece<PieceTypePure>
  private game: BuluChessGame
  private isActivated = false

  constructor({ game, piece, coord }: PieceActorConstructor) {
    const actorName = `piece-${coord}-a-${piece.type}-${nanoid(12)}`
    const textureId = `piece_${piece.type}_lod${game.gameData.boardSize === 13 ? 1 : 0}`
    super({ engine: game.engine, idname: actorName, width: game.squareSize })
    this.coord = coord
    this.piece = piece
    this.game = game
    this.setTexture(textureId, true)
    this.setClearColor("#DDDDDD")
    this.bindMouseHover(
      () => {
        this.setColor("#FFFFFF")
        this.setActorScale(0.97)
      },
      () => {
        this.clearColor()
        this.resetActorScale()
      }
    )
    this.bindPointerClicked(
      () => {}, // clicked
      () => {
        // mouse down
        return this.isActivated
          ? this.game.onClickedPiece(this)
          : this.game.onClickedInvalidPiece(this)
      }
    )

    this.deactivate()
  }

  public activate() {
    this.clearColor()
    this.resetActorScale()
    this.isActivated = true
    this.bindToPointerQuery("HOVER")
  }

  public resetToActivated() {
    this.activate()
  }

  public deactivate() {
    this.clearColor()
    this.isActivated = false
    this.unbindFromPointerQuery("HOVER")
  }

  public setAsSelected() {
    this.root.scale.set(1, 1, 1)
    this.setColor("#FFFFFF")
    this.unbindFromPointerQuery("HOVER")
  }

  public updatePositionFromCoord(coord: BoardCoord) {
    const { x, y } = this.game.getPositionFromCoord(coord)
    this.setActorPosition({ x, y, z: 1.0 })
  }

  public MoveTo(
    targetCoord: BoardCoord,
    postOnFinish?: PostMoveFn | PostMoveFnWithPiece | PostMoveFnNoArg,
    speedScalar?: number,
    interpolation: InterpolationType = "EASE_OUT"
  ) {
    // trigger anim
    const fromCoord = this.coord
    const target = new THREE.Vector3().copy({
      ...this.game.getPositionFromCoord(targetCoord),
      z: 1,
    })
    let dist = Math.sqrt(this.getActorPosition().distanceTo(target) / this.game.squareSize)
    if (speedScalar) dist /= speedScalar
    this.engine.Animation.MoveToTarget({
      actor: this,
      to: target,
      duration: 400 * dist,
      zLift: 2,
      onFinished: () => {
        // semantics when finishing
        this.coord = targetCoord
        if (postOnFinish) postOnFinish(fromCoord, targetCoord, this)
      },
      interpolation: interpolation,
    })
  }
}
