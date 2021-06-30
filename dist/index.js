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


// const state = {
//   count: 0
// }
const state = {
    img: ["itagaki.png", "pien.png"],
    imgs: ["itagaki.png"],
    n: 0
};
// const actions: ActionTree<State> = {
//   increment: (state: State) => {
//     state.count += 1;
//     console.log(state.count)
//   }
// };
const actions = {
    increment: (state) => {
        if (state.n == 0) {
            state.n = 1;
            state.imgs.push(state.img[state.n]);
            return;
        }
        state.n = 0;
        state.imgs.push(state.img[state.n]);
        console.log(state.imgs);
        return;
    }
};
const view = (state, actions) => (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("div", { id: "countup" }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("button", {
    type: "button",
    id: "increment",
    onclick: () => { actions.increment(state); }
}, "change"), 
// h("img", { src: "images/" + state.img[state.n]}, state.img[state.n] )
(0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("ul", { class: "ul", style: " list-style: none;" }, ...state.imgs.map(a => {
    return (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("li", { class: "li" }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("img", { src: "images/" + a, style: "height: 50px; width: 50px;" }, state.img[state.n]), "");
})));
new _framework_controller__WEBPACK_IMPORTED_MODULE_1__.App({
    el: "#app",
    state,
    view,
    actions
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tLy4vc3JjL2ZyYW1ld29yay9jb250cm9sbGVyLnRzIiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvZnJhbWV3b3JrL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQWtFO0FBYzNELE1BQU0sR0FBRztJQWNkLFlBQVksTUFBc0M7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkYsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLFVBQVUsR0FBc0IsRUFBRTtRQUV4QyxLQUFLLE1BQU0sR0FBRyxJQUFJ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Q0FBQztRQUN2QixPQUFNO0lBQ1IsQ0FBQztDQUNGLENBQUM7QUFJRixNQUFNLElBQUksR0FBeUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxrREFBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFDL0Usa0RBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDVixJQUFJLEVBQUUsUUFBUTtJQUNkLEVBQUUsRUFBRSxXQUFXO0lBQ2YsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQUMsRUFDN0MsUUFBUSxDQUNUO0FBQ0Qsd0VBQXdFO0FBQ3hFLGtEQUFDLENBQUMsSUFBSSxFQUNKLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsb0JBQW9CLEVBQUMsRUFDekMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNwQixPQUFPLGtEQUFDLENBQ1IsSUFBSSxFQUNKLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxFQUNaLGtEQUFDLENBQUMsS0FBSyxFQUNQLEVBQUUsR0FBRyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLEVBQzNELEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ25CLEVBQUUsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUNILENBQ0YsQ0FBQztBQUVGLElBQUksc0RBQUcsQ0FBaUI7SUFDdEIsRUFBRSxFQUFFLE1BQU07SUFDVixLQUFLO0lBQ0wsSUFBSTtJQUNKLE9BQU87Q0FDUixDQUFDLENBQUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3LCBWTm9kZSwgdXBkYXRlRWxlbWVudCwgY3JlYXRlRWxlbWVudCB9IGZyb20gJy4vdmlldydcbmltcG9ydCB7IEFjdGlvblRyZWUgfSBmcm9tICcuL2FjdGlvbidcblxuaW50ZXJmYWNlIEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zIGV4dGVuZHMgQWN0aW9uVHJlZTxTdGF0ZT4+IHtcbiAgLyoqIOODoeOCpOODs05vZGUgKi9cbiAgZWw6IEVsZW1lbnQgfCBzdHJpbmdcbiAgLyoqIFZpZXfjga7lrprnvqkgKi9cbiAgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9ucz5cbiAgLyoqIOeKtuaFi+euoeeQhiAqL1xuICBzdGF0ZTogU3RhdGVcbiAgLyoqIEFjdGlvbuOBruWumue+qSAqL1xuICBhY3Rpb25zOiBBY3Rpb25zXG59XG5cbmV4cG9ydCBjbGFzcyBBcHA8U3RhdGUsIEFjdGlvbnMgZXh0ZW5kcyBBY3Rpb25UcmVlPFN0YXRlPj4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGVsOiBFbGVtZW50XG4gIHByaXZhdGUgcmVhZG9ubHkgdmlldzogQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnM+Wyd2aWV3J11cbiAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZTogQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnM+WydzdGF0ZSddXG4gIHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uczogQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnM+WydhY3Rpb25zJ11cblxuICAvKiog5Luu5oOzRE9N77yI5aSJ5pu05YmN55So77yJICovXG4gIHByaXZhdGUgb2xkTm9kZTogVk5vZGVcbiAgLyoqIOS7ruaDs0RPTe+8iOWkieabtOW+jOeUqO+8iSAqL1xuICBwcml2YXRlIG5ld05vZGU6IFZOb2RlXG5cbiAgLyoqIOmAo+e2muOBp+ODquOCouODq0RPTeaTjeS9nOOBjOi1sOOCieOBquOBhOOBn+OCgeOBruODleODqeOCsCAqL1xuICBwcml2YXRlIHNraXBSZW5kZXI6IGJvb2xlYW5cblxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPikge1xuICAgIHRoaXMuZWwgPSB0eXBlb2YgcGFyYW1zLmVsID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW1zLmVsKSA6IHBhcmFtcy5lbFxuICAgIHRoaXMudmlldyA9IHBhcmFtcy52aWV3XG4gICAgdGhpcy5zdGF0ZSA9IHBhcmFtcy5zdGF0ZVxuICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuZGlzcGF0Y2hBY3Rpb24ocGFyYW1zLmFjdGlvbnMpXG4gICAgdGhpcy5yZXNvbHZlTm9kZSgpXG4gIH1cblxuICAvKipcbiAgICog44Om44O844K244GM5a6a576p44GX44GfQWN0aW9uc+OBq+S7ruaDs0RPTeWGjeani+evieeUqOOBruODleODg+OCr+OCkuS7lei+vOOCgFxuICAgKiBAcGFyYW0gYWN0aW9uc1xuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaEFjdGlvbihhY3Rpb25zOiBBY3Rpb25zKTogQWN0aW9ucyB7XG4gICAgY29uc3QgZGlzcGF0Y2hlZDogQWN0aW9uVHJlZTxTdGF0ZT4gPSB7fVxuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gYWN0aW9ucykge1xuICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1trZXldXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgZGlzcGF0Y2hlZFtrZXldID0gKHN0YXRlOiBTdGF0ZSwgLi4uZGF0YTogYW55KTogYW55ID0+IHtcbiAgICAgICAgY29uc3QgcmV0ID0gYWN0aW9uKHN0YXRlLCAuLi5kYXRhKVxuICAgICAgICB0aGlzLnJlc29sdmVOb2RlKClcbiAgICAgICAgcmV0dXJuIHJldFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaXNwYXRjaGVkIGFzIEFjdGlvbnNcbiAgfVxuXG4gIC8qKlxuICAgKiDku67mg7NET03jgpLmp4vnr4njgZnjgotcbiAgICovXG4gIHByaXZhdGUgcmVzb2x2ZU5vZGUoKTogdm9pZCB7XG4gICAgLy8g5Luu5oOzRE9N44KS5YaN5qeL56+J44GZ44KLXG4gICAgdGhpcy5uZXdOb2RlID0gdGhpcy52aWV3KHRoaXMuc3RhdGUsIHRoaXMuYWN0aW9ucylcbiAgICB0aGlzLnNjaGVkdWxlUmVuZGVyKClcbiAgfVxuXG4gIC8qKlxuICAgKiByZW5kZXLjga7jgrnjgrHjgrjjg6Xjg7zjg6rjg7PjgrDjgpLooYzjgYZcbiAgICovXG4gIHByaXZhdGUgc2NoZWR1bGVSZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnNraXBSZW5kZXIpIHtcbiAgICAgIHRoaXMuc2tpcFJlbmRlciA9IHRydWVcbiAgICAgIC8vIHNldFRpbWVvdXTjgpLkvb/jgYbjgZPjgajjgafpnZ7lkIzmnJ/jgavjgarjgorjgIHjgYvjgaTlrp/ooYzjgpLmlbDjg5/jg6rnp5LpgYXlu7bjgafjgY3jgotcbiAgICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog44Oq44Ki44OrRE9N44Gr5Y+N5pig44GZ44KLXG4gICAqL1xuICBwcml2YXRlIHJlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5vbGROb2RlKSB7XG4gICAgICB1cGRhdGVFbGVtZW50KHRoaXMuZWwgYXMgSFRNTEVsZW1lbnQsIHRoaXMub2xkTm9kZSwgdGhpcy5uZXdOb2RlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsLmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQodGhpcy5uZXdOb2RlKSlcbiAgICB9XG5cbiAgICB0aGlzLm9sZE5vZGUgPSB0aGlzLm5ld05vZGVcbiAgICB0aGlzLnNraXBSZW5kZXIgPSBmYWxzZVxuICB9XG59XG4iLCIvKiogTm9kZeOBjOWPluOCiuOBhuOCizPnqK7jga7lnosgKi9cbnR5cGUgTm9kZVR5cGUgPSBWTm9kZSB8IHN0cmluZyB8IG51bWJlclxuLyoqIOWxnuaAp+OBruWeiyAqL1xudHlwZSBBdHRyaWJ1dGVUeXBlID0gc3RyaW5nIHwgRXZlbnRMaXN0ZW5lclxudHlwZSBBdHRyaWJ1dGVzID0ge1xuICBbYXR0cjogc3RyaW5nXTogQXR0cmlidXRlVHlwZSBcbn1cblxuLyoqXG4gKiDku67mg7NET03jga7jgbLjgajjgaTjga7jgqrjg5bjgrjjgqfjgq/jg4jjgpLooajjgZnlnotcbiAqL1xuZXhwb3J0IHR5cGUgVk5vZGUgPSB7XG4gIG5vZGVOYW1lOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBcbiAgYXR0cmlidXRlczogQXR0cmlidXRlc1xuICBjaGlsZHJlbjogTm9kZVR5cGVbXVxufVxuXG4vKipcbiAqIE5vZGXjgpLlj5fjgZHlj5bjgorjgIFWTm9kZeOBquOBruOBi1RleHTjgarjga7jgYvjgpLliKTlrprjgZnjgotcbiAqL1xuY29uc3QgaXNWTm9kZSA9IChub2RlOiBOb2RlVHlwZSk6IG5vZGUgaXMgVk5vZGUgPT4ge1xuICByZXR1cm4gdHlwZW9mIG5vZGUgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBub2RlICE9PSAnbnVtYmVyJ1xufVxuXG4vKipcbiAqIOWPl+OBkeWPluOBo+OBn+WxnuaAp+OBjOOCpOODmeODs+ODiOOBi+OBqeOBhuOBi+WIpOWumuOBmeOCi1xuICogQHBhcmFtIGF0dHJpYnV0ZSDlsZ7mgKdcbiAqL1xuY29uc3QgaXNFdmVudEF0dHIgPSAoYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgLy8gb27jgYvjgonjga/jgZjjgb7jgovlsZ7mgKflkI3jga/jgqTjg5njg7Pjg4jjgajjgZfjgabmibHjgYZcbiAgcmV0dXJuIC9eb24vLnRlc3QoYXR0cmlidXRlKVxufVxuXG4vKipcbiAqIFZpZXflsaTjga7lnovlrprnvqlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3PFN0YXRlLCBBY3Rpb25zPiB7XG4gIChzdGF0ZTogU3RhdGUsIGFjdGlvbnM6IEFjdGlvbnMpOiBWTm9kZVxufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOCkuS9nOaIkOOBmeOCi1xuICogQHBhcmFtIG5vZGVOYW1lIE5vZGXjga7lkI3liY3vvIhIVE1M44Gu44K/44Kw5ZCN77yJXG4gKiBAcGFyYW0gYXR0cmlidXRlcyBOb2Rl44Gu5bGe5oCn77yId2lkdGgvaGVpZ2h044KEc3R5bGXjgarjganvvIlcbiAqIEBwYXJhbSBjaGlsZHJlbiBOb2Rl44Gu5a2Q6KaB57Sg44Gu44Oq44K544OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoKG5vZGVOYW1lOiBWTm9kZVsnbm9kZU5hbWUnXSwgYXR0cmlidXRlczogVk5vZGVbJ2F0dHJpYnV0ZXMnXSwgLi4uY2hpbGRyZW46IFZOb2RlWydjaGlsZHJlbiddKTogVk5vZGUge1xuICByZXR1cm4ge1xuICAgIG5vZGVOYW1lLFxuICAgIGF0dHJpYnV0ZXMsXG4gICAgY2hpbGRyZW5cbiAgfVxufVxuXG4vKipcbiAqIOWxnuaAp+OCkuioreWumuOBmeOCi1xuICogQHBhcmFtIHRhcmdldCDmk43kvZzlr77osaHjga5FbGVtZW50XG4gKiBAcGFyYW0gYXR0cmlidXRlcyBFbGVtZW5044Gr6L+95Yqg44GX44Gf44GE5bGe5oCn44Gu44Oq44K544OIXG4gKi9cbmNvbnN0IHNldEF0dHJpYnV0ZXMgPSAodGFyZ2V0OiBIVE1MRWxlbWVudCwgYXR0cmlidXRlczogQXR0cmlidXRlcyk6IHZvaWQgPT4ge1xuICBmb3IgKGNvbnN0IGF0dHIgaW4gYXR0cmlidXRlcykge1xuICAgIGlmIChpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgLy8gb25jbGlja+OBquOBqeOBr+OCpOODmeODs+ODiOODquOCueODiuODvOOBq+eZu+mMsuOBmeOCi1xuICAgICAgLy8gb25jbGlja+OChG9uaW5wdXTjgIFvbmNoYW5nZeOBquOBqeOBrm9u44KS6Zmk44GE44Gf44Kk44OZ44Oz44OI5ZCN44KS5Y+W5b6X44GZ44KLXG4gICAgICBjb25zdCBldmVudE5hbWUgPSBhdHRyLnNsaWNlKDIpXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGF0dHJpYnV0ZXNbYXR0cl0gYXMgRXZlbnRMaXN0ZW5lcilcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g44Kk44OZ44Oz44OI44Oq44K544OK4oiS5Lul5aSW44Gv44Gd44Gu44G+44G+5bGe5oCn44Gr6Kit5a6a44GZ44KLXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJpYnV0ZXNbYXR0cl0gYXMgc3RyaW5nKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIOWxnuaAp+OCkuabtOaWsOOBmeOCi1xuICogQHBhcmFtIHRhcmdldCDmk43kvZzlr77osaHjga5FbGVtZW50XG4gKiBAcGFyYW0gb2xkQXR0cnMg5Y+k44GE5bGe5oCnXG4gKiBAcGFyYW0gbmV3QXR0cnMg5paw44GX44GE5bGe5oCnXG4gKi9cbmNvbnN0IHVwZGF0ZUF0dHJpYnV0ZXMgPSAodGFyZ2V0OiBIVE1MRWxlbWVudCwgb2xkQXR0cnM6IEF0dHJpYnV0ZXMsIG5ld0F0dHJzOiBBdHRyaWJ1dGVzKTogdm9pZCA9PiB7XG4gIC8vIOWHpueQhuOCkuOCt+ODs+ODl+ODq+OBq+OBmeOCi+OBn+OCgW9sZEF0dHJz44KS5YmK6Zmk5b6M44CBbmV3QXR0cnPjgaflho3oqK3lrprjgZnjgotcbiAgZm9yIChjb25zdCBhdHRyIGluIG9sZEF0dHJzKSB7XG4gICAgaWYgKCFpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShhdHRyKVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgYXR0ciBpbiBuZXdBdHRycykge1xuICAgIGlmICghaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgbmV3QXR0cnNbYXR0cl0gYXMgc3RyaW5nKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGlucHV06KaB57Sg44GudmFsdWXjgpLmm7TmlrDjgZnjgotcbiAqIEBwYXJhbSB0YXJnZXQg5pON5L2c5a++6LGh44GuaW5wdXTopoHntKBcbiAqIEBwYXJhbSBuZXdWYWx1ZSBpbnB1dOOBrnZhbHVl44Gr6Kit5a6a44GZ44KL5YCkXG4gKi9cbmNvbnN0IHVwZGF0ZVZhbHVlID0gKHRhcmdldDogSFRNTElucHV0RWxlbWVudCwgbmV3VmFsdWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICB0YXJnZXQudmFsdWUgPSBuZXdWYWx1ZVxufVxuXG4vKiog5beu5YiG44Gu44K/44Kk44OXICovXG5lbnVtIENoYW5nZWRUeXBlIHtcbiAgLyoqIOW3ruWIhuOBquOBlyAqL1xuICBOb25lLFxuICAvKiogTm9kZVR5cGXjgYznlbDjgarjgosgKi9cbiAgVHlwZSxcbiAgLyoqIOODhuOCreOCueODiE5vZGXjgYznlbDjgarjgosgKi9cbiAgVGV4dCxcbiAgLyoqIOimgee0oOWQjeOBjOeVsOOBquOCiyAqL1xuICBOb2RlLFxuICAvKiogdmFsdWXlsZ7mgKfjgYznlbDjgarjgovvvIhpbnB1dOimgee0oOeUqO+8iSAqL1xuICBWYWx1ZSxcbiAgLyoqIOWxnuaAp+OBjOeVsOOBquOCiyAqL1xuICBBdHRyXG59XG4vKipcbiAqIOW3ruWIhuaknOefpeOCkuihjOOBhlxuICogQHBhcmFtIGFcbiAqIEBwYXJhbSBiXG4gKi9cbmNvbnN0IGhhc0NoYW5nZWQgPSAoYTogTm9kZVR5cGUsIGI6IE5vZGVUeXBlKTogQ2hhbmdlZFR5cGUgPT4ge1xuICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XG4gICAgcmV0dXJuIENoYW5nZWRUeXBlLlR5cGVcbiAgfVxuXG4gIGlmICghaXNWTm9kZShhKSAmJiBhICE9PSBiKSB7XG4gICAgcmV0dXJuIENoYW5nZWRUeXBlLlRleHRcbiAgfVxuXG4gIGlmIChpc1ZOb2RlKGEpICYmIGlzVk5vZGUoYikpIHtcbiAgICBpZiAoYS5ub2RlTmFtZSAhPT0gYi5ub2RlTmFtZSkge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLk5vZGVcbiAgICB9XG5cbiAgICBpZiAoYS5hdHRyaWJ1dGVzLnZhbHVlICE9PSBiLmF0dHJpYnV0ZXMudmFsdWUpIHtcbiAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5WYWx1ZVxuICAgIH1cblxuICAgIGlmIChKU09OLnN0cmluZ2lmeShhLmF0dHJpYnV0ZXMpICE9PSBKU09OLnN0cmluZ2lmeShiLmF0dHJpYnV0ZXMpKSB7XG4gICAgICAvLyDmnKzmnaXjgarjgonjgqrjg5bjgrjjgqfjgq/jg4jjgbLjgajjgaTjgbLjgajjgaTjgpLmr5TovIPjgZnjgbnjgY3jgarjga7jgafjgZnjgYzjgIHjgrfjg7Pjg5fjg6vjgarlrp/oo4XjgavjgZnjgovjgZ/jgoHjgatKU09OLnN0cmluZ2lmeeOCkuS9v+OBo+OBpuOBhOOBvuOBmVxuICAgICAgLy8gSlNPTi5zdHJpbmdpZnnjgpLkvb/jgaPjgZ/jgqrjg5bjgrjjgqfjgq/jg4jjga7mr5TovIPjga/nvaDjgYzlpJrjgYTjga7jgafjgIHjgafjgY3jgovjgaDjgZHkvb/jgo/jgarjgYTjgbvjgYbjgYzoia/jgYTjgafjgZlcbiAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5BdHRyXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIENoYW5nZWRUeXBlLk5vbmVcbn1cblxuLyoqXG4gKiDjg6rjgqLjg6tET03jgpLkvZzmiJDjgZnjgotcbiAqIEBwYXJhbSBub2RlIOS9nOaIkOOBmeOCi05vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZTogTm9kZVR5cGUpOiBIVE1MRWxlbWVudCB8IFRleHQge1xuICBpZiAoIWlzVk5vZGUobm9kZSkpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZS50b1N0cmluZygpKVxuICB9XG5cbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGUubm9kZU5hbWUpXG4gIHNldEF0dHJpYnV0ZXMoZWwsIG5vZGUuYXR0cmlidXRlcylcbiAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IGVsLmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQoY2hpbGQpKSlcblxuICByZXR1cm4gZWxcbn1cblxuLyoqXG4gKiDku67mg7NET03jga7lt67liIbjgpLmpJznn6XjgZfjgIHjg6rjgqLjg6tET03jgavlj43mmKDjgZnjgotcbiAqIEBwYXJhbSBwYXJlbnQg6Kaq6KaB57SgXG4gKiBAcGFyYW0gb2xkTm9kZSDlj6TjgYROb2Rl5oOF5aCxXG4gKiBAcGFyYW0gbmV3Tm9kZSDmlrDjgZfjgYROb2Rl5oOF5aCxXG4gKiBAcGFyYW0gaW5kZXgg5a2Q6KaB57Sg44Gu6aCG55WqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVFbGVtZW50KHBhcmVudDogSFRNTEVsZW1lbnQsIG9sZE5vZGU6IE5vZGVUeXBlLCBuZXdOb2RlOiBOb2RlVHlwZSwgaW5kZXggPSAwKTogdm9pZCB7XG4gIC8vIG9sZE5vZGXjgYzjgarjgYTloLTlkIjjga/mlrDjgZfjgYROb2Rl44KS5L2c5oiQ44GZ44KLXG4gIGlmICghb2xkTm9kZSkge1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KG5ld05vZGUpKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gbmV3Tm9kZeOBjOOBquOBhOWgtOWQiOOBr+WJiumZpOOBleOCjOOBn+OBqOWIpOaWreOBl+OAgeOBneOBrk5vZGXjgpLliYrpmaTjgZnjgotcbiAgY29uc3QgdGFyZ2V0ID0gcGFyZW50LmNoaWxkTm9kZXNbaW5kZXhdXG4gIGlmICghbmV3Tm9kZSkge1xuICAgIHBhcmVudC5yZW1vdmVDaGlsZCh0YXJnZXQpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyDlt67liIbmpJznn6XjgZfjgIHjg5Hjg4Pjg4Hlh6bnkIbvvIjlpInmm7TnrofmiYDjgaDjgZHlj43mmKDvvInjgpLooYzjgYZcbiAgY29uc3QgY2hhbmdlVHlwZSA9IGhhc0NoYW5nZWQob2xkTm9kZSwgbmV3Tm9kZSlcbiAgc3dpdGNoIChjaGFuZ2VUeXBlKSB7XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5UeXBlOlxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVGV4dDpcbiAgICBjYXNlIENoYW5nZWRUeXBlLk5vZGU6XG4gICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSksIHRhcmdldClcbiAgICAgIHJldHVyblxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVmFsdWU6XG4gICAgICB1cGRhdGVWYWx1ZSh0YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCwgKG5ld05vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMudmFsdWUgYXMgc3RyaW5nKVxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5BdHRyOlxuICAgICAgdXBkYXRlQXR0cmlidXRlcyh0YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCwgKG9sZE5vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMsIChuZXdOb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzKVxuICAgICAgcmV0dXJuXG4gIH1cblxuICAvLyDlrZDopoHntKDjga7lt67liIbmpJznn6Xjg7vjg6rjgqLjg6tET03lj43mmKDjgpLlho3luLDnmoTjgavlrp/ooYzjgZnjgotcbiAgaWYgKGlzVk5vZGUob2xkTm9kZSkgJiYgaXNWTm9kZShuZXdOb2RlKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3Tm9kZS5jaGlsZHJlbi5sZW5ndGggfHwgaSA8IG9sZE5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnQodGFyZ2V0IGFzIEhUTUxFbGVtZW50LCBvbGROb2RlLmNoaWxkcmVuW2ldLCBuZXdOb2RlLmNoaWxkcmVuW2ldLCBpKVxuICAgIH1cbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBBY3Rpb25UcmVlIH0gZnJvbSAnLi9mcmFtZXdvcmsvYWN0aW9uJ1xuaW1wb3J0IHsgVmlldywgaCB9IGZyb20gJy4vZnJhbWV3b3JrL3ZpZXcnXG5pbXBvcnQgeyBBcHAgfSBmcm9tICcuL2ZyYW1ld29yay9jb250cm9sbGVyJ1xuXG50eXBlIFN0YXRlID0gdHlwZW9mIHN0YXRlO1xudHlwZSBBY3Rpb25zID0gdHlwZW9mIGFjdGlvbnM7XG5cbi8vIGNvbnN0IHN0YXRlID0ge1xuLy8gICBjb3VudDogMFxuLy8gfVxuY29uc3Qgc3RhdGUgPSB7XG4gIGltZzogW1wiaXRhZ2FraS5wbmdcIixcInBpZW4ucG5nXCJdLFxuICBpbWdzOiBbXCJpdGFnYWtpLnBuZ1wiXSxcbiAgbjogMFxufTtcblxuXG4vLyBjb25zdCBhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPiA9IHtcbi8vICAgaW5jcmVtZW50OiAoc3RhdGU6IFN0YXRlKSA9PiB7XG4vLyAgICAgc3RhdGUuY291bnQgKz0gMTtcbi8vICAgICBjb25zb2xlLmxvZyhzdGF0ZS5jb3VudClcbi8vICAgfVxuLy8gfTtcblxuY29uc3QgYWN0aW9uczogQWN0aW9uVHJlZSA8U3RhdGU+PSB7XG4gIGluY3JlbWVudDogKHN0YXRlOiBTdGF0ZSkgPT4ge1xuICAgIGlmIChzdGF0ZS5uID09IDApe1xuICAgICAgc3RhdGUubiA9IDFcbiAgICAgIHN0YXRlLmltZ3MucHVzaChzdGF0ZS5pbWdbc3RhdGUubl0pXG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIHN0YXRlLm4gPSAwXG4gICAgc3RhdGUuaW1ncy5wdXNoKHN0YXRlLmltZ1tzdGF0ZS5uXSlcbiAgICBjb25zb2xlLmxvZyhzdGF0ZS5pbWdzKVxuICAgIHJldHVyblxuICB9XG59O1xuXG5cblxuY29uc3QgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9ucz4gPSAoc3RhdGUsIGFjdGlvbnMpID0+IGgoXCJkaXZcIiwgeyBpZDogXCJjb3VudHVwXCIgfSxcbiAgaChcImJ1dHRvblwiLCB7XG4gICAgdHlwZTogXCJidXR0b25cIixcbiAgICBpZDogXCJpbmNyZW1lbnRcIixcbiAgICBvbmNsaWNrOiAoKSA9PiB7IGFjdGlvbnMuaW5jcmVtZW50KHN0YXRlKTsgfX0sXG4gICAgXCJjaGFuZ2VcIiBcbiAgKSxcbiAgLy8gaChcImltZ1wiLCB7IHNyYzogXCJpbWFnZXMvXCIgKyBzdGF0ZS5pbWdbc3RhdGUubl19LCBzdGF0ZS5pbWdbc3RhdGUubl0gKVxuICBoKFwidWxcIixcbiAgICB7Y2xhc3M6IFwidWxcIiwgc3R5bGU6XCIgbGlzdC1zdHlsZTogbm9uZTtcIn0sXG4gICAgLi4uc3RhdGUuaW1ncy5tYXAoYSA9PiB7XG4gICAgICByZXR1cm4gaChcbiAgICAgIFwibGlcIiwgXG4gICAgICB7Y2xhc3M6XCJsaVwifSwgXG4gICAgICBoKFwiaW1nXCIsIFxuICAgICAgeyBzcmM6IFwiaW1hZ2VzL1wiICsgYSwgc3R5bGU6IFwiaGVpZ2h0OiA1MHB4OyB3aWR0aDogNTBweDtcIiB9LCBcbiAgICAgIHN0YXRlLmltZ1tzdGF0ZS5uXSksIFxuICAgICAgXCJcIilcbiAgICB9KVxuICApXG4pO1xuXG5uZXcgQXBwPFN0YXRlLCBBY3Rpb25zPih7XG4gIGVsOiBcIiNhcHBcIixcbiAgc3RhdGUsXG4gIHZpZXcsXG4gIGFjdGlvbnNcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==