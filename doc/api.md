# VueEventBus

这是一个 Vue 的插件，基于 Vue 实现的事件发布订阅中心

通过 mixin 注入 beforeDestroy 自动注销组件注册的事件

## API

### on

> 注册事件
> 
> `on(eventName: string, callback: function, vueComponent?: vueComponent): void`

| Parameter	| Description |
| --- | --- |
| eventName: string | 注册的事件名 |
| callback: string | 回调事件 参数由 `emit`方法传入 |
| vueComponent?: vueComponent | 组件实例 |

### emit

> 触发事件
> 
> `emit(eventName: string, ...args: any[]): void`

| Parameter	| Description |
| --- | --- |
| eventName: string | 触发的事件名 |
| args: any[] | `on`方法 回调函数 接受的参数 不定项 |

### off

> 注销事件
> 
> `off(eventName: string, callback?: function): boolean`

| Parameter	| Description |
| --- | --- |
| eventName: string | 触发的事件名 |
| callback?: function | 只注销指定的回调函数 |

| Returns	| Description |
| --- | --- |
| boolean | 是否注销成功 作用不到 |

## 使用

### 初始化

```js
import VueEventBus from 'vue-event-bus'

// 1. 默认选项
// {
//   name: '$eventBus'
// }
Vue.use(VueEventBus)
// 在组件内使用
this.$eventBus.on('eventName', callback, this)


// 2. 自定义挂载到实例上的对象名
Vue.use(VueEventBus, { name: 'bus' })
// 在组件内使用
this.bus.on('eventName', callback, this)
```

### 全局使用

> 全局使用 订阅的事件 不会自动注销

```js
// 代码
// 全局注册
const vm = new Vue(...)
vm.$eventBus.on('globalEventName', (...args) => console.log(args))

// 通过vue实例使用
vm.$eventBus.emit('globalEventName', 1,2,3) // [1,2,3]

// 组件内使用
// start: A Component
created() {
  this.$eventBus.emit('globalEventName', 1, 2) // [1,2]
},
methods: {
  handleClick() {
    this.$eventBus.emit('globalEventName', 1) // [1]
  }
},
// end: A Component
```

### 组件内使用

> 组件内使用 订阅的事件会自动在 组件 beforeDestroy 时注销

```js
// start: A Component
created() {
  // 注册事件
  this.$eventBus.on('eventName', (...args) => console.log(args), this)
},
methods: {
  handleClick() {
    this.$eventBus.emit('eventName', 1) // [1]
  }
},
// end: A Component

// 在其他组件内触发事件
// start: B Component
created() {
  this.$eventBus.emit('eventName', 1, 2) // [1,2]
},
methods: {
  handleClick() {
    this.$eventBus.emit('eventName', 1, 2, 3) // [1,2,3]
  }
},
// end: B Component
```
