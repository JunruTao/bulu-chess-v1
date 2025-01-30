import * as THREE from "three"

export interface ActorMeshProps {
  name: string
  geometry?: THREE.BufferGeometry
  material?: THREE.Material | THREE.Material[]
}

export class ActorMesh extends THREE.Mesh {
  /** this is a unique name for ray test */
  public actorUniqueName: string
  /** if TRUE will ignore the show/hide command from visibility toggle */
  public visibleDisregard: boolean
  constructor({ name, geometry, material }: ActorMeshProps) {
    super(geometry, material)
    this.actorUniqueName = name
    this.visibleDisregard = false
  }

  public override clone(recursive?: boolean): this {
    return new (this.constructor as new (prop: ActorMeshProps) => this)({
      name: this.actorUniqueName,
    }).copy(this, recursive)
  }

  public makeClone(): this {
    return new (this.constructor as new (prop: ActorMeshProps) => this)({
      name: this.actorUniqueName,
      geometry: this.geometry.clone(),
      material: Array.isArray(this.material)
        ? this.material.map((m) => m.clone())
        : this.material.clone(),
    })
  }
}
