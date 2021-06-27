var vDomEx = {
  nodeName: "div",
  attributes: { id: "app" },
  children:[
    {
      nodeName: 'p',
      attributes: { class: "text" },
      children: ["Hello Virtual DOM!!"]
    }
  ]
}


const app = document.getElementById('app');

const p = document.createElement('h2');
p.innerText = 'ラーメン食べたい';

app.appendChild(p);


var vDomNext = {
  nodeName: "div",
  attributes: { id: "app" },
  children:[
    {
      nodeName: 'p',
      attributes: { class: "text" },
      children: ["Hello Virtual DOM!!"]
    },
    {
      nodeName: 'h2',
      attributes: {},
      children: ["ラーメン食べたい"]
    }
  ]
}