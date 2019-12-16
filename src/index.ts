import Vue from 'vue'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type THandles = (...arg: any) => any

/** Vue组件 */
interface EXComponent extends Vue.VueConstructor {
  _uid: string
}

/**
 * 事件发布订阅
 */
class Bus {
  /** Vue构造器 */
  private Vue: Vue.VueConstructor

  /** 缓存事件名对应的回调数组 */
  private handles: {
    [event: string]: THandles[]
  }

  /** 通过 vue实例的_uid对应的 handles */
  private eventUidMap: {
    [uid: string]: {
      [event: string]: THandles[]
    }
  }

  public constructor(Vue: Vue.VueConstructor) {
    this.Vue = Vue

    this.handles = {
      // 'event': []
    }
    this.eventUidMap = {
      // 'uid': {
      //     'event': []
      // }
    }
  }

  /**
   * 根据uid缓存事件及回调函数
   * @param {string} uid vue 实例的 _uid
   * @param {string} event 事件名
   * @param {THandles} callback 回调函数
   */
  private setEventUidMap(uid: string, event: string, callback: THandles): void {
    // 初始化 防止异常
    if (!this.eventUidMap[uid]) {
      this.eventUidMap[uid] = {}
    }
    if (!this.eventUidMap[uid][event]) {
      this.eventUidMap[uid][event] = []
    }

    // 缓存回调
    this.eventUidMap[uid][event].push(callback)
  }

  /**
   * 回收对应的事件、回调函数
   * @param {string} event 事件名
   * @param {function} callback 回调函数
   * @returns {boolean} 是否注销成功 作用不到
   */
  public off(event: string, callback: THandles): boolean {
    if (!this.handles[event]) return false

    if (!callback) {
      delete this.handles[event]
    } else if (callback instanceof Function) {
      let i = this.handles[event].length
      while (i--) {
        const cb = this.handles[event][i]
        if (cb === callback) {
          this.handles[event].splice(i, 1)
          // break
        }
      }
    }

    return true
  }

  /**
   * 根据 uid 清理缓存的事件
   * @param {string} uid vue 实例的 _uid
   */
  public offByUid(uid: string): void {
    const eventObj = this.eventUidMap[uid] || {}
    for (const event in eventObj) {
      if (eventObj.hasOwnProperty(event)) {
        eventObj[event].forEach(cb => {
          this.off(event, cb)
        })
        delete eventObj[event]
      }
    }
    delete this.eventUidMap[uid]
  }

  /**
   * vue 组件 监听事件
   * @param {string} event 事件
   * @param {THandles} callback 回调事件
   * @param {object} vm 监听事件的 vue 组件
   */
  public on(event: string, callback: THandles, vm: EXComponent): void {
    if (!this.handles[event]) this.handles[event] = []
    if (callback instanceof Function) this.handles[event].push(callback)
    if (vm instanceof this.Vue) this.setEventUidMap(vm._uid, event, callback)
  }

  /**
   * 触发事件
   * @param {string} event 事件名
   * @param {any[]} args 执行回调时的参数 传参方式 类似fn.call
   */
  public emit(event: string, ...args: any[]) {
    if (this.handles[event]) {
      const len = this.handles[event].length
      for (let i = 0; i < len; i++) {
        this.handles[event][i].apply(null, args)
      }
    }
  }
}

/**
 * Vue Plugin EventBus
 */
export default {
  install(Vue: Vue.VueConstructor, options: { name?: string } = {}): void {
    const bus = new Bus(Vue)
    const finalName = !options.name ? '$eventBus' : options.name

    Object.defineProperties(Vue.prototype, {
      [finalName]: {
        get(): typeof bus {
          return bus
        }
      }
    })
    Vue.mixin({
      beforeDestroy(): void {
        this[finalName].offByUid(this._uid)
      }
    })
  }
}
