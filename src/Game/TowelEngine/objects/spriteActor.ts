import * as THREE from "three"
import { Actor } from "./actor"
import { SpriteMesh } from "./spriteMesh"
import { TowelEngine } from "../engine"


interface SpriteActorConstructor {
  engine: TowelEngine
  idname: string
  addToScene?: boolean
  width: number
  height?: number
}

export class SpriteActor extends Actor {
  public root: SpriteMesh
  private _clearColor: THREE.Color | THREE.ColorRepresentation
  constructor({ engine, idname, addToScene = true, width, height }: SpriteActorConstructor) {
    const geo = new THREE.PlaneGeometry(width, height ? height : width)
    const rootMesh = new SpriteMesh({
      name: idname,
      geometry: geo,
      material: new THREE.MeshBasicMaterial({ side: THREE.FrontSide, depthTest: true }),
    })
    super({ engine, idname, rootMesh, addToScene })
    this.root = rootMesh
    this._clearColor = "#FFFFFF"
  }

  public setTexture(textureId: string, useAlpha: boolean) {
    this.root.setTexture(textureId, useAlpha)
  }

  public setColor(color: THREE.ColorRepresentation) {
    this.root.setColor(color)
  }

  public setColorRGB(r: number, g: number, b: number): void
  public setColorRGB(colorRGB: [number, number, number]): void
  public setColorRGB(colorLike: { r: number; g: number; b: number }): void
  public setColorRGB(
    arg0: number | [number, number, number] | { r: number; g: number; b: number },
    arg1?: number,
    arg2?: number
  ): void {
    if (typeof arg0 === "number" && arg1 && arg2) {
      this.root.setColorRGB(arg0, arg1, arg2)
    } else if (Array.isArray(arg0)) {
      this.root.setColorRGB(arg0)
    } else if (typeof arg0 === "object") {
      this.root.setColorRGB(arg0)
    }
  }

  public setClearColor(col: THREE.Color | THREE.ColorRepresentation) {
    this._clearColor = col
  }

  public clearColor() {
    this.setColor(this._clearColor)
  }

  public destroy(): void {
    super.destroy(["map"])
  }
}
