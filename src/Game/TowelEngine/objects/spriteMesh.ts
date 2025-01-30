import { ActorMesh, ActorMeshProps } from "./actorMesh"
import { ResourceManager } from "../managers/resource"
import * as THREE from "three"

export class SpriteMesh extends ActorMesh {
  private static RC = new ResourceManager()
  constructor(props: ActorMeshProps) {
    super(props)
  }

  public setColor(color: THREE.ColorRepresentation) {
    ;(this.material as THREE.MeshBasicMaterial).color.set(color)
  }

  public setOpacity(opacity: number) {
    ;(this.material as THREE.MeshBasicMaterial).transparent = true
    ;(this.material as THREE.MeshBasicMaterial).opacity = opacity
  }

  public setColorRGB(r: number, g: number, b: number): void
  public setColorRGB(colorRGB: [number, number, number]): void
  public setColorRGB(colorLike: { r: number; g: number; b: number }): void
  public setColorRGB(
    arg0: number | [number, number, number] | { r: number; g: number; b: number },
    arg1?: number,
    arg2?: number
  ): void {
    let r: number, g: number, b: number
    if (Array.isArray(arg0)) {
      r = arg0[0]
      g = arg0[1]
      b = arg0[2]
    } else if (typeof arg0 === "object") {
      r = arg0.r
      g = arg0.g
      b = arg0.b
    } else if (typeof arg0 === "number" && arg1 && arg2) {
      r = arg0
      g = arg1
      b = arg2
    } else {
      return
    }

    if (r > 2 || g > 2 || b > 2) {
      r = r / 255
      g = g / 255
      b = b / 255
    }
    ;(this.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b, THREE.SRGBColorSpace)
  }

  public setTexture(textureId: string, useAlpha: boolean) {
    const mat = this.material as THREE.MeshBasicMaterial
    const texture = SpriteMesh.RC.getTexture(textureId)
    if (texture) {
      mat.map = texture
      mat.transparent = useAlpha
      mat.needsUpdate = true
    } else {
      console.log(`invalid texture id: ${textureId}`)
    }
  }
}
