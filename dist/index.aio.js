/*!
 * vue-ts-bus 1.0.2 (https://github.com/zjhcn/vue-event-bus)
 * API https://github.com/zjhcn/vue-event-bus/blob/master/doc/api.md
 * Copyright 2017-2019 zjhcn. All Rights Reserved
 * Licensed under MIT (https://github.com/zjhcn/vue-event-bus/blob/master/LICENSE)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['vue-event-bus'] = factory());
}(this, (function () { 'use strict';

  /**
   * 事件发布订阅
   */
  var Bus = /** @class */ (function () {
      function Bus(Vue) {
          this.Vue = Vue;
          this.handles = {
          // 'event': []
          };
          this.eventUidMap = {
          // 'uid': {
          //     'event': []
          // }
          };
      }
      /**
       * 根据uid缓存事件及回调函数
       * @param {string} uid vue 实例的 _uid
       * @param {string} event 事件名
       * @param {THandles} callback 回调函数
       */
      Bus.prototype.setEventUidMap = function (uid, event, callback) {
          // 初始化 防止异常
          if (!this.eventUidMap[uid]) {
              this.eventUidMap[uid] = {};
          }
          if (!this.eventUidMap[uid][event]) {
              this.eventUidMap[uid][event] = [];
          }
          // 缓存回调
          this.eventUidMap[uid][event].push(callback);
      };
      /**
       * 回收对应的事件、回调函数
       * @param {string} event 事件名
       * @param {function} callback 回调函数
       * @returns {boolean} 是否注销成功 作用不到
       */
      Bus.prototype.off = function (event, callback) {
          if (!this.handles[event])
              return false;
          if (!callback) {
              delete this.handles[event];
          }
          else if (callback instanceof Function) {
              var i = this.handles[event].length;
              while (i--) {
                  var cb = this.handles[event][i];
                  if (cb === callback) {
                      this.handles[event].splice(i, 1);
                      // break
                  }
              }
          }
          return true;
      };
      /**
       * 根据 uid 清理缓存的事件
       * @param {string} uid vue 实例的 _uid
       */
      Bus.prototype.offByUid = function (uid) {
          var _this = this;
          var eventObj = this.eventUidMap[uid] || {};
          var _loop_1 = function (event_1) {
              if (eventObj.hasOwnProperty(event_1)) {
                  eventObj[event_1].forEach(function (cb) {
                      _this.off(event_1, cb);
                  });
                  delete eventObj[event_1];
              }
          };
          for (var event_1 in eventObj) {
              _loop_1(event_1);
          }
          delete this.eventUidMap[uid];
      };
      /**
       * vue 组件 监听事件
       * @param {string} event 事件
       * @param {THandles} callback 回调事件
       * @param {object} vm 监听事件的 vue 组件
       */
      Bus.prototype.on = function (event, callback, vm) {
          if (!this.handles[event])
              this.handles[event] = [];
          if (callback instanceof Function)
              this.handles[event].push(callback);
          if (vm instanceof this.Vue)
              this.setEventUidMap(vm._uid, event, callback);
      };
      /**
       * 触发事件
       * @param {string} event 事件名
       * @param {any[]} args 执行回调时的参数 传参方式 类似fn.call
       */
      Bus.prototype.emit = function (event) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          if (this.handles[event]) {
              var len = this.handles[event].length;
              for (var i = 0; i < len; i++) {
                  this.handles[event][i].apply(null, args);
              }
          }
      };
      return Bus;
  }());
  /**
   * Vue Plugin EventBus
   */
  var index = {
      install: function (Vue, options) {
          if (options === void 0) { options = {}; }
          var _a;
          var bus = new Bus(Vue);
          var finalName = !options.name ? '$bus' : options.name;
          Object.defineProperties(Vue.prototype, (_a = {}, _a[finalName] = {
                  get: function () {
                      return bus;
                  }
              }, _a));
          Vue.mixin({
              beforeDestroy: function () {
                  this[finalName].offByUid(this._uid);
              }
          });
      }
  };

  return index;

})));
