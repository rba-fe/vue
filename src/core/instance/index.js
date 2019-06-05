import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import { prototype } from 'mocha';
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  console.log('_init')
  this._init(options)
}
console.log('init')
initMixin(Vue)
console.log('state')
stateMixin(Vue)
console.log('事件')
eventsMixin(Vue)
console.log('生命周期')
lifecycleMixin(Vue)
console.log('渲染')
renderMixin(Vue)
export default Vue