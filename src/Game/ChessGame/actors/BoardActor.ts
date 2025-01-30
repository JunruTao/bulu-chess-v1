import { BoardCoord, SquareType } from "../../../../amplify/shared/game"
import { SpriteActor } from "../../TowelEngine/engine"
import { BuluChessGame } from "../main"

interface BoardActorConstructorProp {
  game: BuluChessGame
  squareType: SquareType
  coordName: BoardCoord
}

export class BoardActor extends SpriteActor {
  boardType: SquareType
  constructor({ game, squareType: boardType, coordName }: BoardActorConstructorProp) {
    super({ engine: game.engine, idname: coordName, width: game.squareSize })
    this.setTexture(`board${boardType}`, false)
    this.boardType = boardType
  }

  public getDrawPosition() {
    return {
      x: this.root.position.x,
      y: this.root.position.y,
    }
  }
}
