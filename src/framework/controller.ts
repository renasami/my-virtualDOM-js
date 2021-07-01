import { View, VNode, updateElement, createElement } from './view'
import { ActionTree } from './action'

interface AppConstructor<State, Actions extends ActionTree<State>> {
  /** メインNode */
  el: Element | string
  /** Viewの定義 */
  view: View<State, Actions>
  /** 状態管理 */
  state: State
  /** Actionの定義 */
  actions: Actions
}

export class App<State, Actions extends ActionTree<State>> {
  private readonly el: Element
  private readonly view: AppConstructor<State, Actions>['view']
  private readonly state: AppConstructor<State, Actions>['state']
  private readonly actions: AppConstructor<State, Actions>['actions']

  private oldNode: VNode
  private newNode: VNode
  private skipRender: boolean //差分検知における評価用

  constructor(params: AppConstructor<State, Actions>) {
    this.el = typeof params.el === 'string' ? document.querySelector(params.el) : params.el
    this.view = params.view
    this.state = params.state
    this.actions = this.dispatchAction(params.actions)
    this.resolveNode()
  }

  /**
   * ユーザが定義したActionsに仮想DOM再構築用のフックを仕込む
   * @param actions
   */
  private dispatchAction(actions: Actions): Actions {
    const dispatched: ActionTree<State> = {}

    for (const key in actions) {
      const action = actions[key]
      dispatched[key] = (state: State, ...data: any): any => {
        const ret = action(state, ...data)
        this.resolveNode()
        return ret
      }
    }

    return dispatched as Actions
  }

  /**
   * 仮想DOMを構築する
   */
  private resolveNode(): void {
    this.newNode = this.view(this.state, this.actions)
    this.scheduleRender()
  }

  /**
   * renderのスケジューリングを行う
   */
  private scheduleRender(): void {
    if (!this.skipRender) {
      this.skipRender = true
      setTimeout(this.render.bind(this))//再帰的な処理
    }
  }

  /**
   * リアルDOMに反映する
   */
  private render(): void {
    if (this.oldNode) {
      updateElement(this.el as HTMLElement, this.oldNode, this.newNode)
    } else {
      this.el.appendChild(createElement(this.newNode))
    }

    this.oldNode = this.newNode
    this.skipRender = false
  }
}
