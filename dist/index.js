/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/framework/controller.ts":
/*!*************************************!*\
  !*** ./src/framework/controller.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "App": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./view */ "./src/framework/view.ts");

class App {
    constructor(params) {
        this.el = typeof params.el === 'string' ? document.querySelector(params.el) : params.el;
        this.view = params.view;
        this.state = params.state;
        this.actions = this.dispatchAction(params.actions);
        this.resolveNode();
    }
    /**
     * ユーザが定義したActionsに仮想DOM再構築用のフックを仕込む
     * @param actions
     */
    dispatchAction(actions) {
        const dispatched = {};
        for (const key in actions) {
            const action = actions[key];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatched[key] = (state, ...data) => {
                const ret = action(state, ...data);
                this.resolveNode();
                return ret;
            };
        }
        return dispatched;
    }
    /**
     * 仮想DOMを構築する
     */
    resolveNode() {
        // 仮想DOMを再構築する
        this.newNode = this.view(this.state, this.actions);
        this.scheduleRender();
    }
    /**
     * renderのスケジューリングを行う
     */
    scheduleRender() {
        if (!this.skipRender) {
            this.skipRender = true;
            // setTimeoutを使うことで非同期になり、かつ実行を数ミリ秒遅延できる
            setTimeout(this.render.bind(this));
        }
    }
    /**
     * リアルDOMに反映する
     */
    render() {
        if (this.oldNode) {
            (0,_view__WEBPACK_IMPORTED_MODULE_0__.updateElement)(this.el, this.oldNode, this.newNode);
        }
        else {
            this.el.appendChild((0,_view__WEBPACK_IMPORTED_MODULE_0__.createElement)(this.newNode));
        }
        this.oldNode = this.newNode;
        this.skipRender = false;
    }
}


/***/ }),

/***/ "./src/framework/view.ts":
/*!*******************************!*\
  !*** ./src/framework/view.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "h": () => (/* binding */ h),
/* harmony export */   "createElement": () => (/* binding */ createElement),
/* harmony export */   "updateElement": () => (/* binding */ updateElement)
/* harmony export */ });
/**
 * Nodeを受け取り、VNodeなのかTextなのかを判定する
 */
const isVNode = (node) => {
    return typeof node !== 'string' && typeof node !== 'number';
};
/**
 * 受け取った属性がイベントかどうか判定する
 * @param attribute 属性
 */
const isEventAttr = (attribute) => {
    // onからはじまる属性名はイベントとして扱う
    return /^on/.test(attribute);
};
/**
 * 仮想DOMを作成する
 * @param nodeName Nodeの名前（HTMLのタグ名）
 * @param attributes Nodeの属性（width/heightやstyleなど）
 * @param children Nodeの子要素のリスト
 */
function h(nodeName, attributes, ...children) {
    return {
        nodeName,
        attributes,
        children
    };
}
/**
 * 属性を設定する
 * @param target 操作対象のElement
 * @param attributes Elementに追加したい属性のリスト
 */
const setAttributes = (target, attributes) => {
    for (const attr in attributes) {
        if (isEventAttr(attr)) {
            // onclickなどはイベントリスナーに登録する
            // onclickやoninput、onchangeなどのonを除いたイベント名を取得する
            const eventName = attr.slice(2);
            target.addEventListener(eventName, attributes[attr]);
        }
        else {
            // イベントリスナ−以外はそのまま属性に設定する
            target.setAttribute(attr, attributes[attr]);
        }
    }
};
/**
 * 属性を更新する
 * @param target 操作対象のElement
 * @param oldAttrs 古い属性
 * @param newAttrs 新しい属性
 */
const updateAttributes = (target, oldAttrs, newAttrs) => {
    // 処理をシンプルにするためoldAttrsを削除後、newAttrsで再設定する
    for (const attr in oldAttrs) {
        if (!isEventAttr(attr)) {
            target.removeAttribute(attr);
        }
    }
    for (const attr in newAttrs) {
        if (!isEventAttr(attr)) {
            target.setAttribute(attr, newAttrs[attr]);
        }
    }
};
/**
 * input要素のvalueを更新する
 * @param target 操作対象のinput要素
 * @param newValue inputのvalueに設定する値
 */
const updateValue = (target, newValue) => {
    target.value = newValue;
};
/** 差分のタイプ */
var ChangedType;
(function (ChangedType) {
    /** 差分なし */
    ChangedType[ChangedType["None"] = 0] = "None";
    /** NodeTypeが異なる */
    ChangedType[ChangedType["Type"] = 1] = "Type";
    /** テキストNodeが異なる */
    ChangedType[ChangedType["Text"] = 2] = "Text";
    /** 要素名が異なる */
    ChangedType[ChangedType["Node"] = 3] = "Node";
    /** value属性が異なる（input要素用） */
    ChangedType[ChangedType["Value"] = 4] = "Value";
    /** 属性が異なる */
    ChangedType[ChangedType["Attr"] = 5] = "Attr";
})(ChangedType || (ChangedType = {}));
/**
 * 差分検知を行う
 * @param a
 * @param b
 */
const hasChanged = (a, b) => {
    if (typeof a !== typeof b) {
        return ChangedType.Type;
    }
    if (!isVNode(a) && a !== b) {
        return ChangedType.Text;
    }
    if (isVNode(a) && isVNode(b)) {
        if (a.nodeName !== b.nodeName) {
            return ChangedType.Node;
        }
        if (a.attributes.value !== b.attributes.value) {
            return ChangedType.Value;
        }
        if (JSON.stringify(a.attributes) !== JSON.stringify(b.attributes)) {
            // 本来ならオブジェクトひとつひとつを比較すべきなのですが、シンプルな実装にするためにJSON.stringifyを使っています
            // JSON.stringifyを使ったオブジェクトの比較は罠が多いので、できるだけ使わないほうが良いです
            return ChangedType.Attr;
        }
    }
    return ChangedType.None;
};
/**
 * リアルDOMを作成する
 * @param node 作成するNode
 */
function createElement(node) {
    if (!isVNode(node)) {
        return document.createTextNode(node.toString());
    }
    const el = document.createElement(node.nodeName);
    setAttributes(el, node.attributes);
    node.children.forEach(child => el.appendChild(createElement(child)));
    return el;
}
/**
 * 仮想DOMの差分を検知し、リアルDOMに反映する
 * @param parent 親要素
 * @param oldNode 古いNode情報
 * @param newNode 新しいNode情報
 * @param index 子要素の順番
 */
function updateElement(parent, oldNode, newNode, index = 0) {
    // oldNodeがない場合は新しいNodeを作成する
    if (!oldNode) {
        parent.appendChild(createElement(newNode));
        return;
    }
    // newNodeがない場合は削除されたと判断し、そのNodeを削除する
    const target = parent.childNodes[index];
    if (!newNode) {
        parent.removeChild(target);
        return;
    }
    // 差分検知し、パッチ処理（変更箇所だけ反映）を行う
    const changeType = hasChanged(oldNode, newNode);
    switch (changeType) {
        case ChangedType.Type:
        case ChangedType.Text:
        case ChangedType.Node:
            parent.replaceChild(createElement(newNode), target);
            return;
        case ChangedType.Value:
            updateValue(target, newNode.attributes.value);
            return;
        case ChangedType.Attr:
            updateAttributes(target, oldNode.attributes, newNode.attributes);
            return;
    }
    // 子要素の差分検知・リアルDOM反映を再帰的に実行する
    if (isVNode(oldNode) && isVNode(newNode)) {
        for (let i = 0; i < newNode.children.length || i < oldNode.children.length; i++) {
            updateElement(target, oldNode.children[i], newNode.children[i], i);
        }
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./framework/view */ "./src/framework/view.ts");
/* harmony import */ var _framework_controller__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./framework/controller */ "./src/framework/controller.ts");


const state = {
    count: 0
};
// const state = {
//   img: ["itagaki.png","pien.png"],
//   n: 0
// };
const actions = {
    increment: (state) => {
        state.count++;
        console.log(state.count);
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
const view = (state, actions) => (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("div", { id: "app" }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("p", { id: "counter" }, state.count), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("button", {
    type: "button",
    id: "increment",
    onclick: () => { actions.increment(state); }
}, "+1"));
new _framework_controller__WEBPACK_IMPORTED_MODULE_1__.App({
    el: "#app",
    state,
    view,
    actions
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tLy4vc3JjL2ZyYW1ld29yay9jb250cm9sbGVyLnRzIiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvZnJhbWV3b3JrL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQWtFO0FBYzNELE1BQU0sR0FBRztJQWNkLFlBQVksTUFBc0M7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkYsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLFVBQVUsR0FBc0IsRUFBRTtRQUV4QyxLQUFLLE1BQU0sR0FBRyxJQUFJ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QUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFDM0Usa0RBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBRSxFQUN2QyxrREFBQyxDQUFDLFFBQVEsRUFBRTtJQUNWLElBQUksRUFBRSxRQUFRO0lBQ2QsRUFBRSxFQUFFLFdBQVc7SUFDZixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FBQyxFQUM3QyxJQUFJLENBQ0wsQ0FDRixDQUFDO0FBRUYsSUFBSSxzREFBRyxDQUFpQjtJQUN0QixFQUFFLEVBQUUsTUFBTTtJQUNWLEtBQUs7SUFDTCxJQUFJO0lBQ0osT0FBTztDQUNSLENBQUMsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcsIFZOb2RlLCB1cGRhdGVFbGVtZW50LCBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi92aWV3J1xuaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gJy4vYWN0aW9uJ1xuXG5pbnRlcmZhY2UgQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnMgZXh0ZW5kcyBBY3Rpb25UcmVlPFN0YXRlPj4ge1xuICAvKiog44Oh44Kk44OzTm9kZSAqL1xuICBlbDogRWxlbWVudCB8IHN0cmluZ1xuICAvKiogVmlld+OBruWumue+qSAqL1xuICB2aWV3OiBWaWV3PFN0YXRlLCBBY3Rpb25zPlxuICAvKiog54q25oWL566h55CGICovXG4gIHN0YXRlOiBTdGF0ZVxuICAvKiogQWN0aW9u44Gu5a6a576pICovXG4gIGFjdGlvbnM6IEFjdGlvbnNcbn1cblxuZXhwb3J0IGNsYXNzIEFwcDxTdGF0ZSwgQWN0aW9ucyBleHRlbmRzIEFjdGlvblRyZWU8U3RhdGU+PiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZWw6IEVsZW1lbnRcbiAgcHJpdmF0ZSByZWFkb25seSB2aWV3OiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ3ZpZXcnXVxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ3N0YXRlJ11cbiAgcHJpdmF0ZSByZWFkb25seSBhY3Rpb25zOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ2FjdGlvbnMnXVxuXG4gIC8qKiDku67mg7NET03vvIjlpInmm7TliY3nlKjvvIkgKi9cbiAgcHJpdmF0ZSBvbGROb2RlOiBWTm9kZVxuICAvKiog5Luu5oOzRE9N77yI5aSJ5pu05b6M55So77yJICovXG4gIHByaXZhdGUgbmV3Tm9kZTogVk5vZGVcblxuICAvKiog6YCj57aa44Gn44Oq44Ki44OrRE9N5pON5L2c44GM6LWw44KJ44Gq44GE44Gf44KB44Gu44OV44Op44KwICovXG4gIHByaXZhdGUgc2tpcFJlbmRlcjogYm9vbGVhblxuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnM+KSB7XG4gICAgdGhpcy5lbCA9IHR5cGVvZiBwYXJhbXMuZWwgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbXMuZWwpIDogcGFyYW1zLmVsXG4gICAgdGhpcy52aWV3ID0gcGFyYW1zLnZpZXdcbiAgICB0aGlzLnN0YXRlID0gcGFyYW1zLnN0YXRlXG4gICAgdGhpcy5hY3Rpb25zID0gdGhpcy5kaXNwYXRjaEFjdGlvbihwYXJhbXMuYWN0aW9ucylcbiAgICB0aGlzLnJlc29sdmVOb2RlKClcbiAgfVxuXG4gIC8qKlxuICAgKiDjg6bjg7zjgrbjgYzlrprnvqnjgZfjgZ9BY3Rpb25z44Gr5Luu5oOzRE9N5YaN5qeL56+J55So44Gu44OV44OD44Kv44KS5LuV6L6844KAXG4gICAqIEBwYXJhbSBhY3Rpb25zXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoQWN0aW9uKGFjdGlvbnM6IEFjdGlvbnMpOiBBY3Rpb25zIHtcbiAgICBjb25zdCBkaXNwYXRjaGVkOiBBY3Rpb25UcmVlPFN0YXRlPiA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhY3Rpb25zKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25zW2tleV1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBkaXNwYXRjaGVkW2tleV0gPSAoc3RhdGU6IFN0YXRlLCAuLi5kYXRhOiBhbnkpOiBhbnkgPT4ge1xuICAgICAgICBjb25zdCByZXQgPSBhY3Rpb24oc3RhdGUsIC4uLmRhdGEpXG4gICAgICAgIHRoaXMucmVzb2x2ZU5vZGUoKVxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpc3BhdGNoZWQgYXMgQWN0aW9uc1xuICB9XG5cbiAgLyoqXG4gICAqIOS7ruaDs0RPTeOCkuani+evieOBmeOCi1xuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlTm9kZSgpOiB2b2lkIHtcbiAgICAvLyDku67mg7NET03jgpLlho3mp4vnr4njgZnjgotcbiAgICB0aGlzLm5ld05vZGUgPSB0aGlzLnZpZXcodGhpcy5zdGF0ZSwgdGhpcy5hY3Rpb25zKVxuICAgIHRoaXMuc2NoZWR1bGVSZW5kZXIoKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlbmRlcuOBruOCueOCseOCuOODpeODvOODquODs+OCsOOCkuihjOOBhlxuICAgKi9cbiAgcHJpdmF0ZSBzY2hlZHVsZVJlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2tpcFJlbmRlcikge1xuICAgICAgdGhpcy5za2lwUmVuZGVyID0gdHJ1ZVxuICAgICAgLy8gc2V0VGltZW91dOOCkuS9v+OBhuOBk+OBqOOBp+mdnuWQjOacn+OBq+OBquOCiuOAgeOBi+OBpOWun+ihjOOCkuaVsOODn+ODquenkumBheW7tuOBp+OBjeOCi1xuICAgICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDjg6rjgqLjg6tET03jgavlj43mmKDjgZnjgotcbiAgICovXG4gIHByaXZhdGUgcmVuZGVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm9sZE5vZGUpIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnQodGhpcy5lbCBhcyBIVE1MRWxlbWVudCwgdGhpcy5vbGROb2RlLCB0aGlzLm5ld05vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudCh0aGlzLm5ld05vZGUpKVxuICAgIH1cblxuICAgIHRoaXMub2xkTm9kZSA9IHRoaXMubmV3Tm9kZVxuICAgIHRoaXMuc2tpcFJlbmRlciA9IGZhbHNlXG4gIH1cbn1cbiIsIi8qKiBOb2Rl44GM5Y+W44KK44GG44KLM+eoruOBruWeiyAqL1xudHlwZSBOb2RlVHlwZSA9IFZOb2RlIHwgc3RyaW5nIHwgbnVtYmVyXG4vKiog5bGe5oCn44Gu5Z6LICovXG50eXBlIEF0dHJpYnV0ZVR5cGUgPSBzdHJpbmcgfCBFdmVudExpc3RlbmVyXG50eXBlIEF0dHJpYnV0ZXMgPSB7XG4gIFthdHRyOiBzdHJpbmddOiBBdHRyaWJ1dGVUeXBlIFxufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOBruOBsuOBqOOBpOOBruOCquODluOCuOOCp+OCr+ODiOOCkuihqOOBmeWei1xuICovXG5leHBvcnQgdHlwZSBWTm9kZSA9IHtcbiAgbm9kZU5hbWU6IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcFxuICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVzXG4gIGNoaWxkcmVuOiBOb2RlVHlwZVtdXG59XG5cbi8qKlxuICogTm9kZeOCkuWPl+OBkeWPluOCiuOAgVZOb2Rl44Gq44Gu44GLVGV4dOOBquOBruOBi+OCkuWIpOWumuOBmeOCi1xuICovXG5jb25zdCBpc1ZOb2RlID0gKG5vZGU6IE5vZGVUeXBlKTogbm9kZSBpcyBWTm9kZSA9PiB7XG4gIHJldHVybiB0eXBlb2Ygbm9kZSAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIG5vZGUgIT09ICdudW1iZXInXG59XG5cbi8qKlxuICog5Y+X44GR5Y+W44Gj44Gf5bGe5oCn44GM44Kk44OZ44Oz44OI44GL44Gp44GG44GL5Yik5a6a44GZ44KLXG4gKiBAcGFyYW0gYXR0cmlidXRlIOWxnuaAp1xuICovXG5jb25zdCBpc0V2ZW50QXR0ciA9IChhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAvLyBvbuOBi+OCieOBr+OBmOOBvuOCi+WxnuaAp+WQjeOBr+OCpOODmeODs+ODiOOBqOOBl+OBpuaJseOBhlxuICByZXR1cm4gL15vbi8udGVzdChhdHRyaWJ1dGUpXG59XG5cbi8qKlxuICogVmlld+WxpOOBruWei+Wumue+qVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXc8U3RhdGUsIEFjdGlvbnM+IHtcbiAgKHN0YXRlOiBTdGF0ZSwgYWN0aW9uczogQWN0aW9ucyk6IFZOb2RlXG59XG5cbi8qKlxuICog5Luu5oOzRE9N44KS5L2c5oiQ44GZ44KLXG4gKiBAcGFyYW0gbm9kZU5hbWUgTm9kZeOBruWQjeWJje+8iEhUTUzjga7jgr/jgrDlkI3vvIlcbiAqIEBwYXJhbSBhdHRyaWJ1dGVzIE5vZGXjga7lsZ7mgKfvvIh3aWR0aC9oZWlnaHTjgoRzdHlsZeOBquOBqe+8iVxuICogQHBhcmFtIGNoaWxkcmVuIE5vZGXjga7lrZDopoHntKDjga7jg6rjgrnjg4hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGgobm9kZU5hbWU6IFZOb2RlWydub2RlTmFtZSddLCBhdHRyaWJ1dGVzOiBWTm9kZVsnYXR0cmlidXRlcyddLCAuLi5jaGlsZHJlbjogVk5vZGVbJ2NoaWxkcmVuJ10pOiBWTm9kZSB7XG4gIHJldHVybiB7XG4gICAgbm9kZU5hbWUsXG4gICAgYXR0cmlidXRlcyxcbiAgICBjaGlsZHJlblxuICB9XG59XG5cbi8qKlxuICog5bGe5oCn44KS6Kit5a6a44GZ44KLXG4gKiBAcGFyYW0gdGFyZ2V0IOaTjeS9nOWvvuixoeOBrkVsZW1lbnRcbiAqIEBwYXJhbSBhdHRyaWJ1dGVzIEVsZW1lbnTjgavov73liqDjgZfjgZ/jgYTlsZ7mgKfjga7jg6rjgrnjg4hcbiAqL1xuY29uc3Qgc2V0QXR0cmlidXRlcyA9ICh0YXJnZXQ6IEhUTUxFbGVtZW50LCBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVzKTogdm9pZCA9PiB7XG4gIGZvciAoY29uc3QgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKGlzRXZlbnRBdHRyKGF0dHIpKSB7XG4gICAgICAvLyBvbmNsaWNr44Gq44Gp44Gv44Kk44OZ44Oz44OI44Oq44K544OK44O844Gr55m76Yyy44GZ44KLXG4gICAgICAvLyBvbmNsaWNr44KEb25pbnB1dOOAgW9uY2hhbmdl44Gq44Gp44Gub27jgpLpmaTjgYTjgZ/jgqTjg5njg7Pjg4jlkI3jgpLlj5blvpfjgZnjgotcbiAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGF0dHIuc2xpY2UoMilcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgYXR0cmlidXRlc1thdHRyXSBhcyBFdmVudExpc3RlbmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyDjgqTjg5njg7Pjg4jjg6rjgrnjg4riiJLku6XlpJbjga/jgZ3jga7jgb7jgb7lsZ7mgKfjgavoqK3lrprjgZnjgotcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgYXR0cmlidXRlc1thdHRyXSBhcyBzdHJpbmcpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICog5bGe5oCn44KS5pu05paw44GZ44KLXG4gKiBAcGFyYW0gdGFyZ2V0IOaTjeS9nOWvvuixoeOBrkVsZW1lbnRcbiAqIEBwYXJhbSBvbGRBdHRycyDlj6TjgYTlsZ7mgKdcbiAqIEBwYXJhbSBuZXdBdHRycyDmlrDjgZfjgYTlsZ7mgKdcbiAqL1xuY29uc3QgdXBkYXRlQXR0cmlidXRlcyA9ICh0YXJnZXQ6IEhUTUxFbGVtZW50LCBvbGRBdHRyczogQXR0cmlidXRlcywgbmV3QXR0cnM6IEF0dHJpYnV0ZXMpOiB2b2lkID0+IHtcbiAgLy8g5Yem55CG44KS44K344Oz44OX44Or44Gr44GZ44KL44Gf44KBb2xkQXR0cnPjgpLliYrpmaTlvozjgIFuZXdBdHRyc+OBp+WGjeioreWumuOBmeOCi1xuICBmb3IgKGNvbnN0IGF0dHIgaW4gb2xkQXR0cnMpIHtcbiAgICBpZiAoIWlzRXZlbnRBdHRyKGF0dHIpKSB7XG4gICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKGF0dHIpXG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBhdHRyIGluIG5ld0F0dHJzKSB7XG4gICAgaWYgKCFpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShhdHRyLCBuZXdBdHRyc1thdHRyXSBhcyBzdHJpbmcpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogaW5wdXTopoHntKDjga52YWx1ZeOCkuabtOaWsOOBmeOCi1xuICogQHBhcmFtIHRhcmdldCDmk43kvZzlr77osaHjga5pbnB1dOimgee0oFxuICogQHBhcmFtIG5ld1ZhbHVlIGlucHV044GudmFsdWXjgavoqK3lrprjgZnjgovlgKRcbiAqL1xuY29uc3QgdXBkYXRlVmFsdWUgPSAodGFyZ2V0OiBIVE1MSW5wdXRFbGVtZW50LCBuZXdWYWx1ZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIHRhcmdldC52YWx1ZSA9IG5ld1ZhbHVlXG59XG5cbi8qKiDlt67liIbjga7jgr/jgqTjg5cgKi9cbmVudW0gQ2hhbmdlZFR5cGUge1xuICAvKiog5beu5YiG44Gq44GXICovXG4gIE5vbmUsXG4gIC8qKiBOb2RlVHlwZeOBjOeVsOOBquOCiyAqL1xuICBUeXBlLFxuICAvKiog44OG44Kt44K544OITm9kZeOBjOeVsOOBquOCiyAqL1xuICBUZXh0LFxuICAvKiog6KaB57Sg5ZCN44GM55Ww44Gq44KLICovXG4gIE5vZGUsXG4gIC8qKiB2YWx1ZeWxnuaAp+OBjOeVsOOBquOCi++8iGlucHV06KaB57Sg55So77yJICovXG4gIFZhbHVlLFxuICAvKiog5bGe5oCn44GM55Ww44Gq44KLICovXG4gIEF0dHJcbn1cbi8qKlxuICog5beu5YiG5qSc55+l44KS6KGM44GGXG4gKiBAcGFyYW0gYVxuICogQHBhcmFtIGJcbiAqL1xuY29uc3QgaGFzQ2hhbmdlZCA9IChhOiBOb2RlVHlwZSwgYjogTm9kZVR5cGUpOiBDaGFuZ2VkVHlwZSA9PiB7XG4gIGlmICh0eXBlb2YgYSAhPT0gdHlwZW9mIGIpIHtcbiAgICByZXR1cm4gQ2hhbmdlZFR5cGUuVHlwZVxuICB9XG5cbiAgaWYgKCFpc1ZOb2RlKGEpICYmIGEgIT09IGIpIHtcbiAgICByZXR1cm4gQ2hhbmdlZFR5cGUuVGV4dFxuICB9XG5cbiAgaWYgKGlzVk5vZGUoYSkgJiYgaXNWTm9kZShiKSkge1xuICAgIGlmIChhLm5vZGVOYW1lICE9PSBiLm5vZGVOYW1lKSB7XG4gICAgICByZXR1cm4gQ2hhbmdlZFR5cGUuTm9kZVxuICAgIH1cblxuICAgIGlmIChhLmF0dHJpYnV0ZXMudmFsdWUgIT09IGIuYXR0cmlidXRlcy52YWx1ZSkge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLlZhbHVlXG4gICAgfVxuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGEuYXR0cmlidXRlcykgIT09IEpTT04uc3RyaW5naWZ5KGIuYXR0cmlidXRlcykpIHtcbiAgICAgIC8vIOacrOadpeOBquOCieOCquODluOCuOOCp+OCr+ODiOOBsuOBqOOBpOOBsuOBqOOBpOOCkuavlOi8g+OBmeOBueOBjeOBquOBruOBp+OBmeOBjOOAgeOCt+ODs+ODl+ODq+OBquWun+ijheOBq+OBmeOCi+OBn+OCgeOBq0pTT04uc3RyaW5naWZ544KS5L2/44Gj44Gm44GE44G+44GZXG4gICAgICAvLyBKU09OLnN0cmluZ2lmeeOCkuS9v+OBo+OBn+OCquODluOCuOOCp+OCr+ODiOOBruavlOi8g+OBr+e9oOOBjOWkmuOBhOOBruOBp+OAgeOBp+OBjeOCi+OBoOOBkeS9v+OCj+OBquOBhOOBu+OBhuOBjOiJr+OBhOOBp+OBmVxuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLkF0dHJcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQ2hhbmdlZFR5cGUuTm9uZVxufVxuXG4vKipcbiAqIOODquOCouODq0RPTeOCkuS9nOaIkOOBmeOCi1xuICogQHBhcmFtIG5vZGUg5L2c5oiQ44GZ44KLTm9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChub2RlOiBOb2RlVHlwZSk6IEhUTUxFbGVtZW50IHwgVGV4dCB7XG4gIGlmICghaXNWTm9kZShub2RlKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlLnRvU3RyaW5nKCkpXG4gIH1cblxuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZS5ub2RlTmFtZSlcbiAgc2V0QXR0cmlidXRlcyhlbCwgbm9kZS5hdHRyaWJ1dGVzKVxuICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudChjaGlsZCkpKVxuXG4gIHJldHVybiBlbFxufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOBruW3ruWIhuOCkuaknOefpeOBl+OAgeODquOCouODq0RPTeOBq+WPjeaYoOOBmeOCi1xuICogQHBhcmFtIHBhcmVudCDopqropoHntKBcbiAqIEBwYXJhbSBvbGROb2RlIOWPpOOBhE5vZGXmg4XloLFcbiAqIEBwYXJhbSBuZXdOb2RlIOaWsOOBl+OBhE5vZGXmg4XloLFcbiAqIEBwYXJhbSBpbmRleCDlrZDopoHntKDjga7poIbnlapcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQocGFyZW50OiBIVE1MRWxlbWVudCwgb2xkTm9kZTogTm9kZVR5cGUsIG5ld05vZGU6IE5vZGVUeXBlLCBpbmRleCA9IDApOiB2b2lkIHtcbiAgLy8gb2xkTm9kZeOBjOOBquOBhOWgtOWQiOOBr+aWsOOBl+OBhE5vZGXjgpLkvZzmiJDjgZnjgotcbiAgaWYgKCFvbGROb2RlKSB7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSkpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBuZXdOb2Rl44GM44Gq44GE5aC05ZCI44Gv5YmK6Zmk44GV44KM44Gf44Go5Yik5pat44GX44CB44Gd44GuTm9kZeOCkuWJiumZpOOBmeOCi1xuICBjb25zdCB0YXJnZXQgPSBwYXJlbnQuY2hpbGROb2Rlc1tpbmRleF1cbiAgaWYgKCFuZXdOb2RlKSB7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHRhcmdldClcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIOW3ruWIhuaknOefpeOBl+OAgeODkeODg+ODgeWHpueQhu+8iOWkieabtOeuh+aJgOOBoOOBkeWPjeaYoO+8ieOCkuihjOOBhlxuICBjb25zdCBjaGFuZ2VUeXBlID0gaGFzQ2hhbmdlZChvbGROb2RlLCBuZXdOb2RlKVxuICBzd2l0Y2ggKGNoYW5nZVR5cGUpIHtcbiAgICBjYXNlIENoYW5nZWRUeXBlLlR5cGU6XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5UZXh0OlxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuTm9kZTpcbiAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoY3JlYXRlRWxlbWVudChuZXdOb2RlKSwgdGFyZ2V0KVxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5WYWx1ZTpcbiAgICAgIHVwZGF0ZVZhbHVlKHRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50LCAobmV3Tm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcy52YWx1ZSBhcyBzdHJpbmcpXG4gICAgICByZXR1cm5cbiAgICBjYXNlIENoYW5nZWRUeXBlLkF0dHI6XG4gICAgICB1cGRhdGVBdHRyaWJ1dGVzKHRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50LCAob2xkTm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcywgKG5ld05vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMpXG4gICAgICByZXR1cm5cbiAgfVxuXG4gIC8vIOWtkOimgee0oOOBruW3ruWIhuaknOefpeODu+ODquOCouODq0RPTeWPjeaYoOOCkuWGjeW4sOeahOOBq+Wun+ihjOOBmeOCi1xuICBpZiAoaXNWTm9kZShvbGROb2RlKSAmJiBpc1ZOb2RlKG5ld05vZGUpKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdOb2RlLmNoaWxkcmVuLmxlbmd0aCB8fCBpIDwgb2xkTm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgdXBkYXRlRWxlbWVudCh0YXJnZXQgYXMgSFRNTEVsZW1lbnQsIG9sZE5vZGUuY2hpbGRyZW5baV0sIG5ld05vZGUuY2hpbGRyZW5baV0sIGkpXG4gICAgfVxuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEFjdGlvblRyZWUgfSBmcm9tICcuL2ZyYW1ld29yay9hY3Rpb24nXG5pbXBvcnQgeyBWaWV3LCBoIH0gZnJvbSAnLi9mcmFtZXdvcmsvdmlldydcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vZnJhbWV3b3JrL2NvbnRyb2xsZXInXG5cbnR5cGUgU3RhdGUgPSB0eXBlb2Ygc3RhdGU7XG50eXBlIEFjdGlvbnMgPSB0eXBlb2YgYWN0aW9ucztcblxuY29uc3Qgc3RhdGUgPSB7XG4gIGNvdW50OiAwXG59XG4vLyBjb25zdCBzdGF0ZSA9IHtcbi8vICAgaW1nOiBbXCJpdGFnYWtpLnBuZ1wiLFwicGllbi5wbmdcIl0sXG4vLyAgIG46IDBcbi8vIH07XG5cblxuY29uc3QgYWN0aW9uczogQWN0aW9uVHJlZTxTdGF0ZT4gPSB7XG4gIGluY3JlbWVudDogKHN0YXRlOiBTdGF0ZSkgPT4ge1xuICAgIHN0YXRlLmNvdW50Kys7XG4gICAgY29uc29sZS5sb2coc3RhdGUuY291bnQpXG4gIH1cbn07XG5cbi8vIGNvbnN0IGFjdGlvbnM6IEFjdGlvblRyZWUgPFN0YXRlPj0ge1xuLy8gICBpbmNyZW1lbnQ6IChzdGF0ZTogU3RhdGUpID0+IHtcbi8vICAgICBpZiAoc3RhdGUubiA9PSAwKXtcbi8vICAgICAgIHN0YXRlLm4gPSAxXG4vLyAgICAgICBzdGF0ZS5pbWdbc3RhdGUubl1cbi8vICAgICAgIHJldHVybiBcbi8vICAgICB9XG4vLyAgICAgc3RhdGUubiA9IDBcbi8vICAgICBzdGF0ZS5pbWdbc3RhdGUubl1cbi8vICAgICByZXR1cm5cbi8vICAgfVxuLy8gfTtcblxuLy8gY29uc3QgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9ucz4gPSAoc3RhdGUsIGFjdGlvbnMpID0+IHtcbi8vICAgcmV0dXJuIGgoXG4vLyAgICAgXCJkaXZcIixcbi8vICAgICBudWxsLFxuLy8gICAgIGgoXCJpbWdcIiwge3NyYzogXCIuL2ltYWdlcy9cIiArIHN0YXRlLmltZ1tzdGF0ZS5uXSB9LCBcIlwiKSxcbi8vICAgICBoKFxuLy8gICAgICAgXCJidXR0b25cIixcbi8vICAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgb25jbGljazogKCkgPT4gYWN0aW9ucy5pbmNyZW1lbnQoc3RhdGUpIH0sXG4vLyAgICAgICBcImNoYW5nZVwiXG4vLyAgICAgKVxuLy8gICApO1xuLy8gfTtcblxuY29uc3QgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9ucz4gPSAoc3RhdGUsIGFjdGlvbnMpID0+IGgoXCJkaXZcIiwgeyBpZDogXCJhcHBcIiB9LFxuICBoKFwicFwiLCB7IGlkOiBcImNvdW50ZXJcIiB9LCBzdGF0ZS5jb3VudCApLFxuICBoKFwiYnV0dG9uXCIsIHtcbiAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgIGlkOiBcImluY3JlbWVudFwiLFxuICAgIG9uY2xpY2s6ICgpID0+IHsgYWN0aW9ucy5pbmNyZW1lbnQoc3RhdGUpOyB9fSxcbiAgICBcIisxXCIgXG4gIClcbik7XG5cbm5ldyBBcHA8U3RhdGUsIEFjdGlvbnM+KHtcbiAgZWw6IFwiI2FwcFwiLFxuICBzdGF0ZSxcbiAgdmlldyxcbiAgYWN0aW9uc1xufSk7XG4iXSwic291cmNlUm9vdCI6IiJ9