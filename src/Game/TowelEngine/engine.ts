import { ResourceManager } from "./managers/resource"
import { PointerHandler } from "./event/pointer"
import { SceneManager } from "./managers/scene"
import { RenderManager } from "./managers/renderer"
import { AnimationManager } from "./managers/animation"

/**
 * Game Engine Instance ( THREE.JS Layer )
 * Handling Low Level such as rendering, camera, device events etc.
 */

interface GameEngineInitProps {
  textures?: { [key: string]: string }
  models?: { [key: string]: string }
}

export class TowelEngine {
  public Dom: HTMLElement
  public Rect: DOMRect
  public Animation: AnimationManager
  public Pointer: PointerHandler
  public Resource: ResourceManager
  public Scene: SceneManager
  public Renderer: RenderManager

  constructor(domRef: HTMLElement) {
    this.Dom = domRef
    this.Rect = this.Dom.getBoundingClientRect()

    this.Renderer = new RenderManager(this)
    this.Scene = new SceneManager(this)
    this.Resource = new ResourceManager()
    this.Pointer = new PointerHandler(this)
    this.Animation = new AnimationManager(this)
  }

  public async initialise({ textures, models }: GameEngineInitProps) {
    // async function has to be called to load resources
    if (textures) {
      this.Resource.addTextureLoadTasks(textures)
      await this.Resource.loadTextures()
    }
    if (models) {
      // todo: load models
    }
    this.Renderer.initEventBindings()
    this.Pointer.initEventBindings()
  }

  public getRenderer = () => this.Renderer.renderer
  public getCamera = () => this.Renderer.camera
  public getResourceManager = () => this.Resource

  public draw() {
    this.Renderer.draw()
  }

  public dispose() {
    this.Scene.dispose()
    this.Pointer.dispose()
    this.Renderer.dispose()
    this.Resource.dispose()
  }
}

// OBJECTS
export * from "./objects/actor"
export * from "./objects/actorMesh"
export * from "./objects/spriteActor"
