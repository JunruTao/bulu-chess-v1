import * as THREE from "three"
import { ActorMesh } from "./actorMesh"
import { TowelEngine } from "../engine"
import type { PointerQueryCategory } from "../event/pointer"

export type ActorPointerEventType = "onPointerDown"| "onPointerUp"| "onClicked"| "onDrag" // prettier-ignore
export const ActorPointerEventMap = ["onPointerDown", "onPointerUp", "onClicked", "onDrag"] // prettier-ignore
export type ActorMouseEventType = "onHoverEnter" | "onHoverExit" | "onHovering" | "onContextMenu"
export const ActorMouseEventMap = ["onHoverEnter", "onHoverExit", "onHovering", "onContextMenu"]

export type ActorEventCallbackType = ActorPointerEventType | ActorMouseEventType // | (string & {})
export type ActorEventCallback = (thisUid?: string) => void
export type ActorIdName = string

interface ActorConstructor {
  engine: TowelEngine
  idname: string
  rootMesh: ActorMesh
  addToScene?: boolean
}

export class Actor {
  protected readonly engine: TowelEngine
  public readonly idname: ActorIdName
  public readonly root: ActorMesh
  public readonly meshes: ActorMesh[]
  public enabled: boolean
  private _otherObjects: THREE.Object3D[]

  public callbacks: {
    [callbackName in ActorEventCallbackType]?: ActorEventCallback
  }

  constructor({ engine, idname, rootMesh, addToScene = true }: ActorConstructor) {
    this.engine = engine
    this.idname = idname
    this.root = rootMesh
    this.meshes = [rootMesh]
    this.enabled = true
    this._otherObjects = []
    this.callbacks = {}

    if (addToScene) {
      this.engine.Scene.addActor(this)
    }
  }

  public hasCallback(name: ActorEventCallbackType) {
    return name in this.callbacks
  }

  public bindCallback(name: ActorEventCallbackType, callback: ActorEventCallback) {
    this.callbacks[name] = callback
  }

  public unbindCallback(name: ActorEventCallbackType) {
    if (name in this.callbacks) delete this.callbacks[name]
  }

  public unbindCallbacks(names: ActorEventCallbackType[]) {
    names.forEach((name) => {
      if (name in this.callbacks) delete this.callbacks[name]
    })
  }

  public clearCallbacks() {
    Object.keys(this.callbacks).forEach((name) => {
      delete this.callbacks[name as ActorEventCallbackType]
    })
  }

  public triggerCallback(name: ActorEventCallbackType) {
    if (name in this.callbacks) {
      if (this.callbacks[name]) {
        if (this.enabled) {
          this.callbacks[name](this.idname)
          this.engine.draw()
        }
      }
    }
  }

  public hasPointerCallback(name: ActorMouseEventType | ActorPointerEventType) {
    return this.hasCallback(name)
  }

  // pointer event actor bindings
  public bindPointerClicked(
    onClicked: ActorEventCallback,
    onPointerDown?: ActorEventCallback,
    onPointerUp?: ActorEventCallback
  ) {
    this.engine.Pointer.bindActorEvent("ClickQuery", this)
    this.bindCallback("onClicked", onClicked)
    if (onPointerDown) this.bindCallback("onPointerDown", onPointerDown)
    if (onPointerUp) this.bindCallback("onPointerUp", onPointerUp)
  }

  // pointer event actor bindings
  public bindMouseHover(
    onHoverEnter: ActorEventCallback,
    onHoverExit: ActorEventCallback,
    onHovering?: ActorEventCallback
  ) {
    this.engine.Pointer.bindActorEvent("HoverQuery", this)
    this.bindCallback("onHoverEnter", onHoverEnter)
    this.bindCallback("onHoverExit", onHoverExit)
    if (onHovering) this.bindCallback("onHovering", onHovering)
  }

  // pointer event actor bindings
  public bindPointerOnDrag(
    onDrag: ActorEventCallback,
    onPointerDown?: ActorEventCallback,
    onPointerUp?: ActorEventCallback
  ) {
    this.engine.Pointer.bindActorEvent("DragQuery", this)
    this.bindCallback("onDrag", onDrag)
    if (onPointerDown) this.bindCallback("onPointerDown", onPointerDown)
    if (onPointerUp) this.bindCallback("onPointerUp", onPointerUp)
  }

  public unbindFromPointerQuery(category: PointerQueryCategory | "*" = "*") {
    if (category === "*") {
      this.engine.Pointer.unbindActorEvent("ClickQuery", this)
      this.engine.Pointer.unbindActorEvent("HoverQuery", this)
      this.engine.Pointer.unbindActorEvent("DragQuery", this)
      return
    }

    if (category === "CLICK") return this.engine.Pointer.unbindActorEvent("ClickQuery", this)
    if (category === "HOVER") return this.engine.Pointer.unbindActorEvent("HoverQuery", this)
    if (category === "DRAG") return this.engine.Pointer.unbindActorEvent("DragQuery", this)
  }

  public bindToPointerQuery(category: PointerQueryCategory | "*" = "*") {
    if (category === "*") {
      this.engine.Pointer.bindActorEvent("ClickQuery", this)
      this.engine.Pointer.bindActorEvent("HoverQuery", this)
      this.engine.Pointer.bindActorEvent("DragQuery", this)
      return
    }
    if (category === "CLICK") return this.engine.Pointer.bindActorEvent("ClickQuery", this)
    if (category === "HOVER") return this.engine.Pointer.bindActorEvent("HoverQuery", this)
    if (category === "DRAG") return this.engine.Pointer.bindActorEvent("DragQuery", this)
  }

  public getActorPosition() {
    return this.root.position.clone()
  }
  setActorPosition(position: THREE.Vector3 | THREE.Vector3Like): void
  setActorPosition(x: number, y: number, z: number): void
  public setActorPosition(
    positionOrX: THREE.Vector3 | THREE.Vector3Like | number,
    y?: number,
    z?: number
  ) {
    if (typeof positionOrX === "number") {
      this.root.position.set(positionOrX, y!, z!)
    } else {
      this.root.position.copy(positionOrX)
    }
  }

  public addChildComponent(child: THREE.Object3D) {
    if (child instanceof ActorMesh) {
      child.actorUniqueName = this.root.actorUniqueName
      this.meshes.push(child)
    } else {
      this._otherObjects.push(child)
    }
    this.root.add(child)
    // this.engine.Scene.scene.add()
  }

  public setVisibility(show: boolean) {
    for (const mesh of this.meshes) {
      if (!mesh.visibleDisregard) mesh.visible = show
    }
    this.engine.draw()
  }
  public show() {
    this.setVisibility(true)
  }
  public hide() {
    this.setVisibility(false)
  }

  public setActorScale(sx: number, sy?: number, sz?: number) {
    this.root.scale.set(sx, sy ? sy : sx, sz ? sz : sx)
  }

  public resetActorScale() {
    this.root.scale.set(1, 1, 1)
  }

  public destroy(textureProperties?: string[]) {
    // unbind from managers
    this.unbindFromPointerQuery("*")
    this.clearCallbacks()
    // ORDER MATTERS
    this.engine.Scene.removeActor(this)

    // release resources
    for (const mesh of this.meshes) {
      if (mesh.material instanceof THREE.Material) {
        if (textureProperties) {
          // dispose stored textures in this shader
          for (const texPropName of textureProperties) {
            if (texPropName in mesh.material) {
              const map = mesh.material[texPropName as keyof THREE.Material]
              if (map instanceof THREE.Texture) map.dispose()
            }
          }
        }
        mesh.material.dispose()
      }
      mesh.geometry.dispose()
    }
  }
}
