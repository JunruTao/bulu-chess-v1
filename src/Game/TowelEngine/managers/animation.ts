import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"
import { Actor, ActorIdName } from "../objects/actor"
import { TowelEngine } from "../engine"
import { TowelSubsystem } from "../utils/subsystem"


export type InterpolationType = "EASE_IN" | "EASE_OUT" | "EASE_INOUT" | "LINEAR"
type EasingFunction = (amount: number) => number
const InterpolationMap: { [key in InterpolationType]: EasingFunction } = {
  EASE_IN: TWEEN.Easing.Quadratic.In,
  EASE_OUT: TWEEN.Easing.Quadratic.Out,
  EASE_INOUT: TWEEN.Easing.Quadratic.InOut,
  LINEAR: TWEEN.Easing.Linear.None,
}

interface ActorMoveToTargetProps {
  actor: ActorIdName | Actor
  to: THREE.Vector3Like | THREE.Vector3
  duration: number
  from?: THREE.Vector3Like | THREE.Vector3
  zLift?: number
  onStart?: (pos?: THREE.Vector3Like | THREE.Vector3) => void
  onGoing?: (
    pos: THREE.Vector3Like | THREE.Vector3,
    elapsed: number
  ) => THREE.Vector3Like | THREE.Vector3
  onFinished?: (pos?: THREE.Vector3Like | THREE.Vector3) => void
  interpolation?: InterpolationType
}

export class AnimationManager extends TowelSubsystem {
  private _animGroup: TWEEN.Group
  private _animStats: "NONE" | "STOP" | "PLAYING"

  constructor(engineRef: TowelEngine) {
    super(engineRef)

    // animation environment
    this._animGroup = new TWEEN.Group()
    this._animStats = "NONE"
  }

  public MoveToTarget({
    actor,
    to,
    from,
    duration,
    zLift,
    onStart,
    onGoing,
    onFinished,
    interpolation = "EASE_OUT",
  }: ActorMoveToTargetProps) {
    // TODO: make better implementations
    const a = this.engine.Scene.getActor(actor)
    if (!a) return
    const subject = a.root

    if (!from) from = subject.position.clone()
    const tweenAnim = new TWEEN.Tween(from, this._animGroup)
      .to(to, duration)
      .easing(InterpolationMap[interpolation])
      .onStart((pos) => {
        if (onStart) onStart(pos)
      })
      .onUpdate((pos, elapsed) => {
        if (onGoing) pos = { ...onGoing(pos, elapsed) }
        subject.position.set(pos.x, pos.y, zLift ? zLift : pos.z)
      })
      .onComplete((pos) => {
        if (onFinished) onFinished(pos)
        this._animGroup.remove(tweenAnim)
        subject.position.set(to.x, to.y, to.z)
      })
      .start()

    this.play()
  }

  public play() {
    // trigger the loop
    if (this._animStats !== "PLAYING") {
      this._animStats = "PLAYING"
      this.update(performance.now())
    }
  }

  private update: FrameRequestCallback = (time) => {
    if (this._animGroup.getAll().length === 0) {
      this._animStats = "STOP"
    }
    if (this._animStats === "PLAYING") {
      this._animGroup.update(time)
      this.engine.Renderer.draw()
      requestAnimationFrame(this.update.bind(this))
    }
  }

  protected onDispose() {
    // if any
    return
  }
}
