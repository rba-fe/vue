/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

/*
{
  expectHTML: true, // 是否期望HTML，不知道是啥反正web中的是true
  modules, // klass和style，对模板中类和样式的解析
  directives, // v-model、v-html、v-text
  isPreTag, // v-pre标签
  isUnaryTag, // 单标签，比如img、input、iframe
  mustUseProp, // 需要使用props绑定的属性，比如value、selected等
  canBeLeftOpenTag, // 可以不闭合的标签，比如tr、td等
  isReservedTag, // 是否是保留标签，html标签和SVG标签
  getTagNamespace, // 命名空间，svg和math
  staticKeys: genStaticKeys(modules) // staticClass,staticStyle。
}

*/

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
