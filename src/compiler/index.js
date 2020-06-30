/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
/*
createCompilerCreator是个高阶函数，
接受一个函数baseCompile，
返回了一个函数createCompiler，
createCompiler函数里又有一个compile函数，
里面调用了baseCompile和最初传入的baseOptions，
最后返回compile函数和compileToFunctions函数。

*/
/*
parse -> optimize -> generate
解析-优化-生成
step 1 ：先对template进行parse得到抽象语法树AST

step 2 ：将AST进行静态优化

step 3 ：由AST生成render
*/

export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  //CompiledResult 看一下这个返回结构 flow
  // 编译转化为ast
  const ast = parse(template.trim(), options)
    // 优化 ast
    // 判断动静态节点
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  // ast 生成render
  const code = generate(ast, options)
  /*
  _c createElement方法，创建一个元素，它的第一个参数是要定义的元素标签名、第二个参数是元素上添加的属性，第三个参数是子元素数组，第四个参数是子元素数组进行归一化处理的级别
  _v 本文节点
  _s 需解析的文本，之前在parser阶段已经有所修饰
  _m 渲染静态内容
  _o v-once静态组件
  _l v-for节点
  _e 注释节点
  _t slot节点

  */

  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
