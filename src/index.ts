import { ActionTree } from './framework/action'
import { View, h } from './framework/view'
import { App } from './framework/controller'

type State = typeof state;
type Actions = typeof actions;

const state = {
  count: 0
}
// const state = {
//   img: ["itagaki.png","pien.png"],
//   n: 0
// };


const actions: ActionTree<State> = {
  increment: (state: State) => {
    state.count++;
    console.log(state.count)
  }
};

// const actions: ActionTree <State>= {
//   increment: (state: State) => {
//     if (state.n == 0){
//       state.n = 1
//       state.img[state.n]
//       return 
//     }
//     state.n = 0
//     state.img[state.n]
//     return
//   }
// };

// const view: View<State, Actions> = (state, actions) => {
//   return h(
//     "div",
//     null,
//     h("img", {src: "./images/" + state.img[state.n] }, ""),
//     h(
//       "button",
//       { type: "button", onclick: () => actions.increment(state) },
//       "change"
//     )
//   );
// };

const view: View<State, Actions> = (state, actions) => h("div", { id: "app" },
  h("p", { id: "counter" }, state.count ),
  h("button", {
    type: "button",
    id: "increment",
    onclick: () => { actions.increment(state); }},
    "+1" 
  )
);

new App<State, Actions>({
  el: "#app",
  state,
  view,
  actions
});
