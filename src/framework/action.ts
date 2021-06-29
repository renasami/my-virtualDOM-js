export type ActionType<State> = (state: State, ...data: any) => void | any

/**
 * Action層の型定義
 */
export interface ActionTree<State> {
  [action: string]: ActionType<State>
}
