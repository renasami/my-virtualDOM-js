import { ActionTree } from './framework/action'
import { View, h } from './framework/view'
import { App } from './framework/controller'

type State = typeof state;
type Actions = typeof actions;

const state = {
  img: ["itagaki.png","pien.png"],
  imgs: ["itagaki.png"],
  n: 0
};

const actions: ActionTree <State>= {
  increment: (state: State) => {
    if (state.n == 0){
      state.n = 1
      state.imgs.push(state.img[state.n])
      return 
    }
    state.n = 0
    state.imgs.push(state.img[state.n])
    return
  }
};

const view: View<State, Actions> = (state, actions) => h("div", { id: "countup" },
  h("button", {
    type: "button",
    id: "increment",
    onclick: () => { actions.increment(state); }},
    "change" 
  ),
  h("ul",
    {class: "ul", style:" list-style: none;"},
    ...state.imgs.map(a => {
      return h(
      "li", 
      {class:"li"}, 
      h("img", 
      { src: "images/" + a, style: "height: 50px; width: 50px;" }, 
      state.img[state.n]), 
      "")
    })
  )
);

new App<State, Actions>({
  el: "#app",
  state,
  view,
  actions
});
