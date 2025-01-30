import * as THREE from "three"
import { TowelEngine } from "../engine"
import { EventHandler } from "./handler"
import { Actor, ActorIdName } from "../objects/actor"
import { ActorMesh } from "../objects/actorMesh"

export type PointerQueryType = "ClickQuery" | "HoverQuery" | "DragQuery"
export type PointerQueryCategory = "CLICK" | "HOVER" | "DRAG"
export const isPointerEventType = (value: string): value is PointerQueryType =>
  ["ClickQuery", "HoverQuery", "DragQuery"].includes(value)

export class PointerHandler extends EventHandler {
  private raycaster: THREE.Raycaster
  private states: {
    ActiveActor: Actor | null
    Location: THREE.Vector2
    LocationDown: THREE.Vector2
    Time: DOMHighResTimeStamp
    TimeDown: DOMHighResTimeStamp
    ButtonState: "UP" | "DOWN"
    MovingState: "STILL" | "MOVING"
    QueryPool: { [key in PointerQueryType]: Array<ActorMesh> }
  }

  constructor(engineRef: TowelEngine) {
    super(engineRef)

    // mouse/touch interactions
    this.raycaster = new THREE.Raycaster()
    this.states = {
      ActiveActor: null,
      Location: new THREE.Vector2(),
      LocationDown: new THREE.Vector2(),
      Time: 0,
      TimeDown: 0,
      ButtonState: "UP",
      MovingState: "STILL",
      QueryPool: {
        ClickQuery: [],
        HoverQuery: [],
        DragQuery: [],
      },
    }
  }

  public bindActorEvent(callbackType: PointerQueryType, inActor: Actor | ActorIdName) {
    const actor = this.engine.Scene.getActor(inActor)
    if (actor) {
      for (const mesh of actor.meshes) {
        if (!this.states.QueryPool[callbackType].includes(mesh)) {
          this.states.QueryPool[callbackType].push(mesh)
        }
      }
    }
  }

  public unbindActorEvent(callbackType: PointerQueryType, inActor: Actor | ActorIdName) {
    const actor = this.engine.Scene.getActor(inActor)
    if (actor) {
      for (const mesh of actor.meshes) {
        const index = this.states.QueryPool[callbackType].indexOf(mesh)
        if (index >= 0) {
          this.states.QueryPool[callbackType].splice(index, 1)
        }
      }
    }
  }

  public clearActorEventBindings(inActor: Actor | ActorIdName) {
    this.unbindActorEvent("ClickQuery", inActor)
    this.unbindActorEvent("HoverQuery", inActor)
    this.unbindActorEvent("DragQuery", inActor)
  }

  private pointerLocationUpdate(event: PointerEvent) {
    this.states.Location.setX(
      ((event.clientX - this.engine.Rect.left) / this.engine.Rect.width) * 2 - 1
    )
    this.states.Location.setY(
      -((event.clientY - this.engine.Rect.top) / this.engine.Rect.height) * 2 + 1
    )
  }

  private pointerGetRaycast(sectObjects: THREE.Object3D[]) {
    // always return the object closer to camera
    this.raycaster.setFromCamera(this.states.Location, this.engine.getCamera())
    const intersects = this.raycaster.intersectObjects(sectObjects, false)
    if (intersects.length > 0) {
      return intersects[0]
    }
    return null
  }

  public initEventBindings() {
    // POINTER [ MOUSE RMB MENU ]
    const evalCallbacks = (callbackName: PointerQueryType) => {
      // actor related events
      if (this.states.QueryPool[callbackName].length > 0) {
        if (this.states.ActiveActor && callbackName === "DragQuery") {
          // do other type of raycasts.
          this.states.ActiveActor.triggerCallback("onDrag")
          return
        }

        // get current raycast (on Query Objects)
        const intersect = this.pointerGetRaycast(this.states.QueryPool[callbackName])
        if (!intersect) {
          if (this.states.ActiveActor) {
            this.states.ActiveActor.triggerCallback("onHoverExit")
            this.states.ActiveActor.triggerCallback("onPointerUp")
          }
          this.states.ActiveActor = null
          return
        }
        // get other info
        const mesh = intersect.object

        if (mesh instanceof ActorMesh) {
          const actor = this.engine.Scene.getActor(mesh.actorUniqueName)
          if (actor) {
            if (callbackName === "ClickQuery") {
              if (this.states.ButtonState === "DOWN") {
                actor.triggerCallback("onPointerDown")
              } else {
                actor.triggerCallback("onPointerUp")
                actor.triggerCallback("onClicked")
                this.states.ActiveActor = null
                return
              }
            }
            if (callbackName === "HoverQuery") {
              if (actor !== this.states.ActiveActor) {
                if (this.states.ActiveActor) {
                  this.states.ActiveActor.triggerCallback("onHoverExit")
                }
                actor.triggerCallback("onHoverEnter")
              } else {
                actor.triggerCallback("onHovering")
              }
            }
            this.states.ActiveActor = actor
          }
        }
      } else {
      }
    }

    const handleMouseDefault = (event: MouseEvent) => {
      event.preventDefault()
    }

    // POINTER [ DOWN ]
    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault()
      if (this.isDisabled()) return
      this.pointerLocationUpdate(event)
      this.states.TimeDown = performance.now()
      this.states.LocationDown.copy(this.states.Location)
      this.states.ButtonState = "DOWN"
      this.states.MovingState = "STILL"
      evalCallbacks("ClickQuery")
    }

    // POINTER [ MOVE ]
    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault()
      if (this.isDisabled()) return
      this.pointerLocationUpdate(event)
      if (this.states.MovingState === "STILL") {
        const dist = this.states.LocationDown.distanceTo(this.states.Location)
        if (dist < 0.03) return // movement threshold
      }

      this.states.MovingState = "MOVING"
      if (this.states.ButtonState === "DOWN") {
        evalCallbacks("DragQuery")
      } else {
        evalCallbacks("HoverQuery")
      }
    }

    // POINTER [ UP / LEAVE ]
    const handlePointerEndAll = (event: PointerEvent) => {
      event.preventDefault()
      if (this.isDisabled()) return
      this.states.ButtonState = "UP"
      this.pointerLocationUpdate(event)

      if (this.states.MovingState === "STILL") {
        // is clicked, use the initial location
        this.states.Location.copy(this.states.LocationDown)
        evalCallbacks("ClickQuery")
      } else {
        // handle drag finish
        this.states.MovingState = "STILL"
      }
    }

    this.bindDomEventListener(this.engine.Dom, "pointerdown", handlePointerDown)
    this.bindDomEventListener(this.engine.Dom, "pointermove", handlePointerMove)
    this.bindDomEventListener(this.engine.Dom, "pointerup", handlePointerEndAll)
    this.bindDomEventListener(this.engine.Dom, "pointercancel", handlePointerEndAll)
    this.bindDomEventListener(this.engine.Dom, "pointerleave", handlePointerEndAll)
    this.bindDomEventListener(this.engine.Dom, "contextmenu", handleMouseDefault)
  }

  protected onDispose() {
    // binding automatic completed
  }
}
