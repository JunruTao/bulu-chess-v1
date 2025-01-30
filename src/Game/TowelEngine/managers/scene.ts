import * as THREE from "three"
import { TowelEngine } from "../engine"
import { Actor, ActorIdName } from "../objects/actor"
import { TowelSubsystem } from "../utils/subsystem"

export class SceneManager extends TowelSubsystem {
  public scene: THREE.Scene
  public actors: { [actorId: string]: Actor }

  constructor(engineRef: TowelEngine) {
    super(engineRef)
    this.scene = new THREE.Scene()
    this.actors = {}
  }

  public addActor(inActor: Actor) {
    if (this.hasActor(inActor)) return false
    this.actors[inActor.idname] = inActor
    this.scene.add(inActor.root)
    return true
  }

  public removeActor(inActor: Actor) {
    if (this.hasActor(inActor)) {
      this.scene.remove(inActor.root)
      delete this.actors[inActor.idname]
    }
  }

  public deleteActorFromScene(inActor: ActorIdName | Actor) {
    const actor = this.getActor(inActor)
    if (actor) {
      this.scene.remove(actor.root)
      this.clearActorEventBindings(actor)
      actor.destroy()
      delete this.actors[actor.idname]
    }
  }

  public clearActorEventBindings(actor: Actor | ActorIdName) {
    this.engine.Pointer.clearActorEventBindings(actor)
    // todo: other event bindings
    // ...
  }

  protected onDispose() {
    // dispose actor
    Object.keys(this.actors).forEach((name) => {
      this.deleteActorFromScene(name)
    })
  }

  public getActor(actor: Actor | ActorIdName): Actor | null {
    return this.hasActor(actor) ? (actor instanceof Actor ? actor : this.actors[actor]) : null
  }
  public hasActor(actor: Actor | ActorIdName): boolean {
    return (actor instanceof Actor ? actor.idname : actor) in this.actors
  }
}
