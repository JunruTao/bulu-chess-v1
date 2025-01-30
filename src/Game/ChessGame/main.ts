import * as THREE from "three"
import { SpriteActor, TowelEngine } from "../TowelEngine/engine"
import {
  GameData,
  GameSessionData,
  GameSessionDataMutable,
  BoardCoord,
  GameRules,
  MoveActionStrip,
  MoveUnit,
  AvailableMoves,
  Piece,
} from "../../../amplify/shared/game"
import { updateSessionData } from "../../Hooks/session"
import { getTextureSheet } from "./resources"
import { BoardActor } from "./actors/BoardActor"
import { PieceActor } from "./actors/PieceActor"
import { BoardMoveSelector } from "./actors/BoardSelector"
import { ActiveCursor, PrevPosCursor } from "./actors/CursorActors"

/**
 * Game Instance
 * Higher Level for game logics
 */
export class BuluChessGame {
  public readonly engine: TowelEngine
  public readonly gameData: GameData
  public readonly squareSize: number

  private boards: {
    [coord: string]: {
      readonly base: BoardActor
      readonly selector: BoardMoveSelector
      readonly drawPosition: { x: number; y: number }
    }
  }
  private pieces: {
    [id: string]: PieceActor
  }

  private _pieceMovesMap: {
    [pieceId: string]: AvailableMoves
  }

  private _pieceActive: string | null
  private _pieceActiveMode: 0 | 1 | 2
  private _activeCursor: ActiveCursor
  private _prevPosCursor: PrevPosCursor
  private _clockHandle: number
  private _actionQueue: MoveActionStrip

  private _canvasActor: SpriteActor

  constructor(domRef: HTMLElement, gameDataProps: GameSessionData) {
    this.engine = new TowelEngine(domRef)
    this.gameData = new GameData(gameDataProps)

    const viewSizeWidth = 10.0
    const viewPadding = 0.2
    const halfUnit = (viewSizeWidth + viewPadding) / 2

    const cameraUpdate = (camera: THREE.OrthographicCamera) => {
      const iRto = domRef.clientHeight / domRef.clientWidth
      if (iRto >= 1) {
        camera.left = -halfUnit
        camera.right = halfUnit
        camera.top = halfUnit * iRto
        camera.bottom = -halfUnit * iRto
      } else {
        camera.left = -halfUnit / iRto
        camera.right = halfUnit / iRto
        camera.top = halfUnit
        camera.bottom = -halfUnit
      }
    }

    this.engine.Renderer.setupRender((renderer) => {
      // setting up the renderer & camera
      renderer.setClearColor("#000000", 0.0)
    })

    this.engine.Renderer.setupCamera((camera) => {
      // creating a TOP-LEFT as-origin based camera view
      cameraUpdate(camera)
      camera.near = 0.1
      camera.far = 500
      camera.position.set(viewSizeWidth / 2, -viewSizeWidth / 2, 99)
    })

    this.engine.Renderer.onResize = (_renderer, camera) => {
      cameraUpdate(camera)
    }

    this.squareSize = viewSizeWidth / this.gameData.boardSize
    this.boards = {}
    this.pieces = {}
    this._pieceActive = null
    this._pieceActiveMode = 0
    this._clockHandle = -99.99
    this._actionQueue = []
    this._pieceMovesMap = {}

    this._activeCursor = new ActiveCursor(this)
    this._prevPosCursor = new PrevPosCursor(this)

    // canvas actor
    this._canvasActor = new SpriteActor({
      engine: this.engine,
      idname: "canvas-plane",
      width: 1000,
    })
    this._canvasActor.setColor("#FF0000")
    this._canvasActor.root.setOpacity(0.05)
    this._canvasActor.setVisibility(false)
    this._canvasActor.setActorPosition(0, 0, 1.3)
  }

  public async initialise() {
    await this.engine.initialise({ textures: getTextureSheet() })

    const __makePos = (fileX: number, rowY: number, zLift: number) => {
      return { x: this.squareSize * (fileX + 0.5), y: -this.squareSize * (rowY + 0.5), z: zLift }
    }

    const __initBoard = () => {
      const formation = this.gameData.boardFormation
      for (let i = 0; i < formation.length; i++) {
        for (let j = 0; j < formation[i].length; j++) {
          const coordName = this.gameData.boardCoordinates[i][j]
          const boardActor = new BoardActor({
            game: this,
            squareType: formation[i][j],
            coordName: coordName,
          })
          const boardSelector = new BoardMoveSelector({
            game: this,
            coordName: coordName,
          })

          boardActor.setActorPosition(__makePos(j, i, 0))
          boardSelector.setActorPosition(__makePos(j, i, 3))
          this.boards[coordName] = {
            base: boardActor,
            selector: boardSelector,
            drawPosition: boardActor.getDrawPosition(),
          }
        }
      }
    }

    const __initPieces = () => {
      const data = this.gameData.boardData
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const piece = data[i][j]
          if (!piece) continue
          const coordCode = this.gameData.boardCoordinates[i][j]
          const pieceActor = new PieceActor({
            game: this,
            piece: piece,
            coord: coordCode,
          })

          pieceActor.setActorPosition(__makePos(j, i, 1))
          this.pieces[pieceActor.idname] = pieceActor
        }
      }
    }

    const __initCursors = () => {
      this._activeCursor.loadTexture()
      this._prevPosCursor.loadTexture()
    }

    __initBoard()
    __initPieces()
    __initCursors()
    this.nextTurn(true)
    this.startClock()
  }

  public dispose() {
    console.log("GameInstance: Dispose Game Resource")
    this.engine.dispose()
    this.stopClock()
  }

  public getPositionFromCoord(coord: BoardCoord) {
    return { ...this.boards[coord].drawPosition }
  }

  public getPiece(pieceId: string) {
    return this.pieces[pieceId]
  }

  public getPieceAtLocation(coord: BoardCoord) {
    for (const [_pid, pieceActor] of Object.entries(this.pieces)) {
      if (pieceActor.coord === coord) return pieceActor
    }
    return null
  }

  public cursorMarkPrevLocation(prevCoord: BoardCoord) {
    this._activeCursor.hide()
    this._prevPosCursor.update(prevCoord)
    this._prevPosCursor.show()
  }

  public cursorMarkSelected(selectedCoord: BoardCoord) {
    this._prevPosCursor.hide()
    this._activeCursor.update(selectedCoord)
    this._activeCursor.show()
  }

  private deactivateAllSelectors() {
    Object.keys(this.boards).forEach((boardId) => {
      this.boards[boardId].selector.deactivate()
    })
  }

  private startClock() {
    this._clockHandle = window.setInterval(() => {
      this.setSessionData({ timeTotal: this.gameData.sessionData.timeTotal + 1 })
    }, 1000)
  }

  private stopClock() {
    window.clearInterval(this._clockHandle)
  }

  public setSessionData(sessionData: Partial<GameSessionDataMutable>) {
    this.gameData.sessionData = {
      ...this.gameData.sessionData,
      ...sessionData,
    }
    updateSessionData(sessionData)
  }

  public nextTurn(isFirstTime: boolean = false) {
    if (!isFirstTime) {
      this.setSessionData({ playerTurn: this.gameData.sessionData.playerTurn === "b" ? "w" : "b" })
    }
    // clear moves map
    this._pieceMovesMap = {}
    for (const actorName in this.pieces) {
      const p = this.pieces[actorName]
      if (p.piece.color === this.gameData.sessionData.playerTurn) {
        p.activate()
        // gather moves
        this._pieceMovesMap[actorName] = GameRules.getAvailableMoves(
          p.piece,
          p.coord,
          this.gameData
        )
      } else {
        this.pieces[actorName].deactivate()
      }
    }
    this.engine.draw()
  }

  public onEnterBattery(p: PieceActor) {
    // clear moves map
    this._pieceMovesMap = {}
    // activate current piece
    const moves = GameRules.getAvailableMoves(p.piece, p.coord, this.gameData)
    if (!moves.bombard || moves.bombard.length === 0) {
      return false
    }

    p.activate()
    this._pieceMovesMap[p.idname] = { default: [], cannon: [], bombard: moves.bombard }
    this.onClickedPiece(p, 2)
    this._canvasActor.show()
    this._canvasActor.bindPointerClicked(() => {
      this.endActionQueue()
    })
    return true
  }

  private startActionQueue(inStrip: MoveActionStrip, activePiece: PieceActor) {
    this._actionQueue = inStrip
    this.cursorMarkPrevLocation(activePiece.coord)
    activePiece.deactivate()
    this.engine.Pointer.disable()
    // start processing
    this.processActionQueue(activePiece)
  }

  private processActionQueue(activePiece: PieceActor) {
    if (this._actionQueue.length > 0) {
      // disable inputs
      const startCoord = activePiece.coord
      const [move, target] = this._actionQueue.at(0) as MoveUnit
      // move
      if (move === "MOVE") {
        // update data
        this.gameData.move(startCoord, target)

        activePiece.MoveTo(target, () => {
          this._actionQueue.splice(0, 1)
          this.processActionQueue(activePiece)
        })
      } else if (move === "CAPTURE") {
        // update data
        this.gameData.capture(startCoord, target)
        const targetPc = this.getPieceAtLocation(target)!
        const targetPcId = targetPc.idname
        activePiece.MoveTo(target, () => {
          targetPc.destroy()
          delete this.pieces[targetPcId]
          this._actionQueue.splice(0, 1)
          this.processActionQueue(activePiece)
        })
      } else if (move === "CAPTURE_EQUIP") {
        const opRes = this.gameData.captureEquip(startCoord, target)
        const targetPc = this.getPieceAtLocation(target)!
        const targetPcId = targetPc.idname
        activePiece.MoveTo(target, () => {
          this._actionQueue.splice(0, 1)
          // create new piece
          const newPiece = new PieceActor({
            game: this,
            piece: opRes![1]!,
            coord: target,
          })
          newPiece.updatePositionFromCoord(target)
          // assign a new piece
          this.pieces[newPiece.idname] = newPiece

          // delete old piece
          targetPc.destroy()
          delete this.pieces[targetPcId]
          activePiece.destroy()
          delete this.pieces[activePiece.idname]

          this.processActionQueue(newPiece)
        })
      } else if (move === "MOVE_EQUIP") {
        // update data
        const opRes = this.gameData.moveEquip(startCoord, target)
        const targetPc = this.getPieceAtLocation(target)!
        const targetPcId = targetPc.idname
        activePiece.MoveTo(target, () => {
          this._actionQueue.splice(0, 1)
          // create new piece
          const newPiece = new PieceActor({
            game: this,
            piece: opRes![1]!,
            coord: target,
          })
          newPiece.updatePositionFromCoord(target)
          // delete old piece
          activePiece.destroy()
          delete this.pieces[activePiece.idname]
          targetPc.destroy()
          delete this.pieces[targetPcId]
          // assign a new piece
          this.pieces[newPiece.idname] = newPiece
          this.processActionQueue(newPiece)
        })
      } else if (move === "TRANSFER_EQUIP") {
        // update data
        const opRes = this.gameData.transferEquip(startCoord, target)
        const targetPc = this.getPieceAtLocation(target)!
        // create new piece
        const newPiece0 = new PieceActor({
          game: this,
          piece: opRes![0]!,
          coord: startCoord,
        })
        newPiece0.updatePositionFromCoord(startCoord)
        this.pieces[newPiece0.idname] = newPiece0

        const pTemp = new PieceActor({
          game: this,
          piece: new Piece(activePiece.piece.type[1] as "C" | "c", activePiece.piece.dir),
          coord: startCoord,
        })
        pTemp.updatePositionFromCoord(startCoord)
        // delete old piece
        activePiece.destroy()
        delete this.pieces[activePiece.idname]

        pTemp.MoveTo(target, () => {
          // new
          pTemp.destroy()

          const newPiece1 = new PieceActor({
            game: this,
            piece: opRes![1]!,
            coord: target,
          })

          newPiece1.updatePositionFromCoord(target)
          this.pieces[newPiece1.idname] = newPiece1

          targetPc.destroy()
          delete this.pieces[targetPc.idname]

          // run next in queue
          this._actionQueue.splice(0, 1)
          this.processActionQueue(newPiece1)
        })
      } else if (move === "DUMP") {
        // update data
        const opRes = this.gameData.dump(startCoord, target)
        // create new piece
        const newPiece0 = new PieceActor({
          game: this,
          piece: opRes![0]!,
          coord: startCoord,
        })
        newPiece0.updatePositionFromCoord(startCoord)

        const newPiece1 = new PieceActor({
          game: this,
          piece: opRes![1]!,
          coord: startCoord,
        })
        newPiece1.updatePositionFromCoord(startCoord)
        // assign a new piece
        this.pieces[newPiece0.idname] = newPiece0
        this.pieces[newPiece1.idname] = newPiece1

        // delete old piece
        activePiece.destroy()
        delete this.pieces[activePiece.idname]

        newPiece1.MoveTo(target, () => {
          // run next in queue
          this._actionQueue.splice(0, 1)
          this.processActionQueue(newPiece1)
        })
      } else if (move === "BATTERY") {
        // TODO
        if (this.onEnterBattery(activePiece)) {
          this.engine.Pointer.enable()
          this._actionQueue = []
        } else {
          this._actionQueue.splice(0, 1)
          this.processActionQueue(activePiece)
        }
      } else if (move === "BOMBARD") {
        // update data
        this.gameData.bombard(startCoord, target)
        const targetPc = this.getPieceAtLocation(target)!

        const pTemp = new PieceActor({
          game: this,
          piece: activePiece.piece,
          coord: startCoord,
        })

        pTemp.setTexture(`ball_${activePiece.piece.color}`, true)
        pTemp.setActorScale(0.4)
        pTemp.updatePositionFromCoord(startCoord)

        pTemp.MoveTo(
          target,
          () => {
            // new
            pTemp.destroy()
            targetPc.destroy()
            delete this.pieces[targetPc.idname]
            this._actionQueue.splice(0, 1)
            this.processActionQueue(activePiece)
          },
          2,
          "LINEAR"
        )
      } else if (move === "PROMOTE") {
        // TODO
        this._actionQueue.splice(0, 1)
        this.processActionQueue(activePiece)
      } else {
        // Other uncaught
        this._actionQueue.splice(0, 1)
        this.processActionQueue(activePiece)
      }
    } else {
      this.endActionQueue()
    }
  }

  private endActionQueue() {
    this.deactivateAllSelectors()
    this._canvasActor.hide()
    this._canvasActor.unbindFromPointerQuery("*")
    this._activeCursor.hide()
    this.engine.Pointer.enable()
    this._pieceActive = null
    this.nextTurn()
  }

  public onClickedMoveSelector(selector: BoardMoveSelector) {
    this.deactivateAllSelectors()
    if (this._pieceActive) {
      this.startActionQueue(selector.getActionStrip(), this.getPiece(this._pieceActive))
    }
  }

  public onClickedInvalidPiece(pieceActor: PieceActor) {
    // trigger anim
    const shakeWeight = this.squareSize * 0.1
    this.engine.Animation.MoveToTarget({
      actor: pieceActor.idname,
      to: pieceActor.getActorPosition(),
      duration: 100,
      zLift: 2,
      onGoing(pos, elapsed) {
        return { ...pos, x: pos.x + shakeWeight * Math.sin(elapsed * 30) }
      },
    })
  }

  public onClickedPiece(pieceActor: PieceActor, stepOverride?: 0 | 1 | 2) {
    const moves = this._pieceMovesMap[pieceActor.idname]
    // if no moves:
    const availability = {
      0: moves.default !== undefined && moves.default.length > 0,
      1: moves.cannon !== undefined && moves.cannon.length > 0,
      2: moves.bombard !== undefined && moves.bombard.length > 0,
    }

    if (!availability[0] && !availability[1] && !availability[2]) {
      this.onClickedInvalidPiece(pieceActor)
      return
    }

    let pAm: number

    if (pieceActor.idname === this._pieceActive) {
      pAm = (this._pieceActiveMode + 1) % 3
    } else {
      // switching to first mode
      pAm = 2
      // reset old active piece
      if (this._pieceActive) {
        this.pieces[this._pieceActive].resetToActivated()
      }
      // assign this as active
      this._pieceActive = pieceActor.idname
      this.cursorMarkSelected(pieceActor.coord)
      pieceActor.setAsSelected()
    }
    if (stepOverride !== undefined) {
      pAm = stepOverride
      // assign this as active
      this._pieceActive = pieceActor.idname
      this.cursorMarkSelected(pieceActor.coord)
      pieceActor.setAsSelected()
    }

    // loop through availability
    while (!availability[pAm as 0 | 1 | 2]) {
      pAm = (pAm + 1) % 3
    }

    this._pieceActiveMode = pAm as 0 | 1 | 2

    this.deactivateAllSelectors()
    if (this._pieceActiveMode === 0 && moves.default && moves.default.length) {
      // DEFAULT
      this._activeCursor.setAsMoveMode()
      for (const moveSeq of moves.default) {
        this.boards[moveSeq.holder].selector.activateDefaultMoves(moveSeq.actions)
      }
    } else if (this._pieceActiveMode === 1 && moves.cannon && moves.cannon.length) {
      // CANNON
      this._activeCursor.setAsCannonMode()
      for (const move of moves.cannon) {
        this.boards[move.holder].selector.activateCannonMoves(move.action)
      }
    } else if (this._pieceActiveMode === 2 && moves.bombard && moves.bombard.length) {
      // BATTERY / AIM
      this._activeCursor.setAsAimMode()
      for (const target of moves.bombard) {
        this.boards[target].selector.activateBombardTarget()
      }
    }

    this.engine.draw()
  }
}
