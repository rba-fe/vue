/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    console.log(mixin, 1109)
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
