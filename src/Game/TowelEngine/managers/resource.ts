import * as THREE from "three"

export interface TextureLookupType {
  [key: string]: string
}

export class ResourceManager {
  private static textureLoader: THREE.TextureLoader
  private static texturesToLoad: TextureLookupType
  private static textures: { [key: string]: THREE.Texture }

  constructor() {
    if (!ResourceManager.textureLoader) {
      ResourceManager.textureLoader = new THREE.TextureLoader()
      ResourceManager.texturesToLoad = {}
      ResourceManager.textures = {}
    }
  }

  public addTextureLoadTasks(texLookUpSheet: TextureLookupType) {
    ResourceManager.texturesToLoad = {
      ...ResourceManager.texturesToLoad,
      ...texLookUpSheet,
    }
  }

  public async loadTextures() {
    for (const key of Object.keys(ResourceManager.texturesToLoad)) {
      try {
        const tex = await ResourceManager.textureLoader.loadAsync(
          ResourceManager.texturesToLoad[key]
        )
        tex.minFilter = THREE.LinearMipMapNearestFilter
        tex.magFilter = THREE.LinearFilter
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        ResourceManager.textures[key] = tex
      } catch (error) {
        console.log(`Error: cannot load <${key}> texture`)
      }
    }
  }

  public getTexture(key: string) {
    return ResourceManager.textures[key]
  }

  public dispose() {
    Object.keys(ResourceManager.textures).forEach((key) => {
      ResourceManager.textures[key].dispose()
      delete ResourceManager.textures[key]
    })
  }
}
