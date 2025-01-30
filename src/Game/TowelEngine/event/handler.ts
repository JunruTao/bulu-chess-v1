import { TowelEngine } from "../engine"
import { TowelSubsystem } from "../utils/subsystem"

type CallbackFunction = () => void
type CallbackName = string
interface Callbacks {
  [callbackName: CallbackName]: {
    callback: CallbackFunction
    doOnce: boolean
    done: boolean
  }
}

export abstract class EventHandler extends TowelSubsystem {
  private enabled: boolean
  protected CallbackHandle: {
    bind: (name: CallbackName, callback: CallbackFunction, doOnce: boolean) => void
    unbind: (name: CallbackName) => void
    reset: (name: CallbackName) => void
    trigger: (name: CallbackName) => void
  }

  public enable() { this.enabled = true } // prettier-ignore
  public disable() { this.enabled = false } // prettier-ignore
  public isEnabled() { return this.enabled } // prettier-ignore
  public isDisabled() { return !this.enabled } // prettier-ignore

  // create a an implementation
  public abstract initEventBindings(): void

  constructor(engineRef: TowelEngine) {
    super(engineRef)
    this.enabled = true
    this.callbacks = {}
    this.CallbackHandle = {
      bind: (...props) => this.__bindCallback(...props),
      unbind: (...props) => this.__unbindCallback(...props),
      reset: (...props) => this.__resetCallback(...props),
      trigger: (...props) => this.__triggerCallback(...props),
    }
  }

  protected callbacks: Callbacks
  protected __bindCallback(
    name: CallbackName,
    callback: CallbackFunction,
    doOnce: boolean = false
  ) {
    this.callbacks[name] = {
      callback: callback,
      doOnce: doOnce,
      done: false,
    }
  }
  protected __unbindCallback(name: CallbackName) {
    if (name in this.callbacks) delete this.callbacks[name]
  }
  protected __resetCallback(name: CallbackName) {
    if (this.callbacks[name]) {
      this.callbacks[name].done = false
    }
  }
  protected __triggerCallback(name: CallbackName) {
    if (!this.callbacks[name]) return
    if (!this.callbacks[name].doOnce) return this.callbacks[name].callback()
    if (this.callbacks[name].done) return
    this.callbacks[name].callback()
    this.callbacks[name].done = true
  }
}
