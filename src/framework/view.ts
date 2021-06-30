
type NodeType = VNode | string | number
type AttributeType = string | EventListener
type Attributes = {
  [attr: string]: AttributeType 
}


export type VNode = {
  nodeName: keyof HTMLElementTagNameMap
  attributes: Attributes
  children: NodeType[]
}


const isVNode = (node: NodeType): node is VNode => {
  return typeof node !== 'string' && typeof node !== 'number'
}

/**
 * 受け取った属性がイベントかどうか判定する
 * @param attribute 属性
 */
const isEventAttr = (attribute: string): boolean => {
  // onからはじまる属性名はイベントとして扱う
  return /^on/.test(attribute)
}

/**
 * View層の型定義
 */
export interface View<State, Actions> {
  (state: State, actions: Actions): VNode
}

/**
 * 仮想DOMの作成
 * @param nodeName Nodeの名前（HTMLのタグ名）
 * @param attributes Nodeの属性（width/heightやstyleなど）
 * @param children Nodeの子要素のリスト
 */
export function h(nodeName: VNode['nodeName'], attributes: VNode['attributes'], ...children: VNode['children']): VNode {
  return {
    nodeName,
    attributes,
    children
  }
}

/**
 * 属性を設定する
 * @param target 操作対象のElement
 * @param attributes Elementに追加したい属性のリスト
 */
const setAttributes = (target: HTMLElement, attributes: Attributes): void => {
  for (const attr in attributes) {
    if (isEventAttr(attr)) {
      const eventName = attr.slice(2)
      target.addEventListener(eventName, attributes[attr] as EventListener)
    } else {
      target.setAttribute(attr, attributes[attr] as string)
    }
  }
}

/**
 * 属性を更新する
 * @param target 操作対象のElement
 * @param oldAttrs 古い属性
 * @param newAttrs 新しい属性
 */
const updateAttributes = (target: HTMLElement, oldAttrs: Attributes, newAttrs: Attributes): void => {
  for (const attr in oldAttrs) {
    if (!isEventAttr(attr)) {
      target.removeAttribute(attr)
    }
  }

  for (const attr in newAttrs) {
    if (!isEventAttr(attr)) {
      target.setAttribute(attr, newAttrs[attr] as string)
    }
  }
}

/**
 * input要素のvalueを更新する
 * @param target 操作対象のinput要素
 * @param newValue inputのvalueに設定する値
 */
const updateValue = (target: HTMLInputElement, newValue: string): void => {
  target.value = newValue
}

enum ChangedType {
  None,
  Type,
  Text,
  Node,
  Value,
  Attr
}
/**
 * 差分検知を行う
 * @param a
 * @param b
 */
const hasChanged = (a: NodeType, b: NodeType): ChangedType => {
  if (typeof a !== typeof b) {
    return ChangedType.Type
  }

  if (!isVNode(a) && a !== b) {
    return ChangedType.Text
  }

  if (isVNode(a) && isVNode(b)) {
    if (a.nodeName !== b.nodeName) {
      return ChangedType.Node
    }

    if (a.attributes.value !== b.attributes.value) {
      return ChangedType.Value
    }

    if (JSON.stringify(a.attributes) !== JSON.stringify(b.attributes)) {
      return ChangedType.Attr
    }
  }

  return ChangedType.None
}

/**
 * リアルDOMを作成する
 * @param node 作成するNode
 */
export function createElement(node: NodeType): HTMLElement | Text {
  if (!isVNode(node)) {
    return document.createTextNode(node.toString())
  }

  const el = document.createElement(node.nodeName)
  setAttributes(el, node.attributes)
  node.children.forEach(child => el.appendChild(createElement(child)))

  return el
}

/**
 * 仮想DOMの差分を検知し、リアルDOMに反映する
 * @param parent 親要素
 * @param oldNode 古いNode情報
 * @param newNode 新しいNode情報
 * @param index 子要素の順番
 */
export function updateElement(parent: HTMLElement, oldNode: NodeType, newNode: NodeType, index = 0): void {
  if (!oldNode) {
    parent.appendChild(createElement(newNode))
    return
  }


  const target = parent.childNodes[index]
  if (!newNode) {
    parent.removeChild(target)
    return
  }

  const changeType = hasChanged(oldNode, newNode)
  switch (changeType) {
    case ChangedType.Type:
    case ChangedType.Text:
    case ChangedType.Node:
      parent.replaceChild(createElement(newNode), target)
      return
    case ChangedType.Value:
      updateValue(target as HTMLInputElement, (newNode as VNode).attributes.value as string)
      return
    case ChangedType.Attr:
      updateAttributes(target as HTMLInputElement, (oldNode as VNode).attributes, (newNode as VNode).attributes)
      return
  }

  if (isVNode(oldNode) && isVNode(newNode)) {
    for (let i = 0; i < newNode.children.length || i < oldNode.children.length; i++) {
      updateElement(target as HTMLElement, oldNode.children[i], newNode.children[i], i)
    }
  }
}
