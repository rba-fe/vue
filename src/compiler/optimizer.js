/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */

/**
  *优化器的目标：遍历生成的模板AST树
  *并检测纯静态的子树，即部分的
  *永远不需要改变的DOM。
 *
  *一旦我们检测到这些子树，我们就可以：
 *
  * 1.将它们提升为常数，这样我们就不再需要了
  *在每次重新渲染时为它们创建新的节点;
  * 2.在修补过程中完全跳过它们。
 */
// 说明一下纯静态树
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes. 标记所有非静态节点
  markStatic(root)
  // second pass: mark static roots.  标记静态子树
  markStaticRoots(root, false)
  // console.log(root,420)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  node.static = isStatic(node)
  // 然后再对type为1的节点进行递归操作，只要有一个它的子树不是静态的话它就不是静态的。
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading

    //不要将组件槽内容设为静态。 这避免了
     // 1.无法改变插槽节点的组件
     // 2.静态插槽内容无法进行热重新加载
    if (
      //// 不是保留标签
      !isPlatformReservedTag(node.tag) &&
      // 不是slot
      node.tag !== 'slot' &&
       // 不是一个内联模板容器
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
       // 只要有一个子树不是静态的话整个都不是静态
      if (!child.static) {
        node.static = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 对于一个静态根结点，它不应该只包含静态文本，否则消耗会超过获得的收益，更好的做法让它每次渲染时都刷新
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || ( //v-pre指令,结点的子内容是不做编译
    !node.hasBindings && // no dynamic bindings // 无动态绑定
    !node.if && !node.for && // not v-if or v-for or v-else 无 v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in 不是内置的标签，内置的标签有slot和component
    isPlatformReservedTag(node.tag) && // not a component  是平台保留标签
    !isDirectChildOfTemplateFor(node) && // 不是template标签的直接子元素且没有包含在for循环中
    Object.keys(node).every(isStaticKey) //结点包含的属性只能有isStaticKey中指定的几个
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
