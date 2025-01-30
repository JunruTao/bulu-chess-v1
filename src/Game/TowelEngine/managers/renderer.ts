import * as THREE from "three"
import { TowelEngine } from "../engine"
import { TowelSubsystem } from "../utils/subsystem"

type RendererSetup = (renderer: THREE.WebGLRenderer) => void
type CameraOrthographic = THREE.OrthographicCamera
type CameraPerspective = THREE.PerspectiveCamera
type CameraType = CameraOrthographic | CameraPerspective
type CameraClass = new () => CameraType
type CameraSetup<T extends CameraType> = (camera: T) => void
type OnResizeCallback<T extends CameraType> = (renderer: THREE.WebGLRenderer, camera: T) => void

export class RenderManager<T extends CameraType = CameraOrthographic> extends TowelSubsystem {
  public readonly camera: T
  public readonly renderer: THREE.WebGLRenderer
  public onResize?: OnResizeCallback<T>

  constructor(engineRef: TowelEngine, CamClass: CameraClass = THREE.OrthographicCamera) {
    super(engineRef)

    // default renderer setups
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio * 1.5)
    this.renderer.setSize(this.engine.Rect.width, this.engine.Rect.height)
    this.engine.Dom.appendChild(this.renderer.domElement)

    // empty camera with type
    this.camera = new CamClass() as T
  }

  public setupRender(setup: RendererSetup) {
    setup(this.renderer)
  }

  public setupCamera(setup: CameraSetup<T>) {
    setup(this.camera)
    this.camera.updateProjectionMatrix()
  }

  public draw() {
    this.renderer.render(this.engine.Scene.scene, this.camera)
  }

  // resize / switch screen / rotate device

  public initEventBindings() {
    const handleOnResize = () => {
      this.engine.Rect = this.engine.Dom.getBoundingClientRect()
      this.renderer.setSize(this.engine.Rect.width, this.engine.Rect.height)
      this.renderer.setPixelRatio(window.devicePixelRatio * 1.5)
      if (this.onResize) this.onResize(this.renderer, this.camera)
      this.camera.updateProjectionMatrix()
      this.draw()
    }
    this.bindWindowEventListener("deviceorientation", handleOnResize)
    this.bindWindowEventListener("resize", handleOnResize)
  }

  protected onDispose() {
    this.renderer.dispose()
    this.engine.Dom.removeChild(this.renderer.domElement)
  }
}
