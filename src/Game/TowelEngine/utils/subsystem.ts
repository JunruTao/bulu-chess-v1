import { TowelEngine } from "../engine"

type DomEventListenerEntry = {
  target: HTMLElement
  type: keyof HTMLElementEventMap
  listener: ((event: any) => void) | EventListenerOrEventListenerObject
}

type WindowEventListenerEntry = {
  type: keyof WindowEventMap
  listener: ((event: any) => void) | EventListenerOrEventListenerObject
}

export abstract class TowelSubsystem {
  protected engine: TowelEngine
  protected _domListener: DomEventListenerEntry[]
  protected _winListener: WindowEventListenerEntry[]

  constructor(engineRef: TowelEngine) {
    this.engine = engineRef
    this._domListener = []
    this._winListener = []
  }

  public bindDomEventListener<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options)
    this._domListener.push({ target, type, listener })
  }

  public bindWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    window.addEventListener(type, listener, options)
    this._winListener.push({ type, listener })
  }

  //MUST implement this
  protected abstract onDispose(): void

  public dispose() {
    this.onDispose()
    // auto remove all event listeners
    this._domListener.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener)
    })
    this._winListener.forEach(({ type, listener }) => {
      window.removeEventListener(type, listener)
    })
  }
}
