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
    img: ["itagaki.png", "pien.png"],
    imgs: ["itagaki.png"],
    n: 0
};
const actions = {
    increment: (state) => {
        if (state.n == 0) {
            state.n = 1;
            state.imgs.push(state.img[state.n]);
            return;
        }
        state.n = 0;
        state.imgs.push(state.img[state.n]);
        return;
    }
};
const view = (state, actions) => (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("div", { id: "countup" }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("button", {
    type: "button",
    id: "increment",
    onclick: () => { actions.increment(state); }
}, "change"), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("ul", { class: "ul", style: " list-style: none;" }, ...state.imgs.map(a => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tLy4vc3JjL2ZyYW1ld29yay9jb250cm9sbGVyLnRzIiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvZnJhbWV3b3JrL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQWtFO0FBYzNELE1BQU0sR0FBRztJQWNkLFlBQVksTUFBc0M7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkYsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLFVBQVUsR0FBc0IsRUFBRTtRQUV4QyxLQUFLLE1BQU0sR0FBRyxJQUFJ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QUFDLFFBQVEsRUFBRTtJQUNWLElBQUksRUFBRSxRQUFRO0lBQ2QsRUFBRSxFQUFFLFdBQVc7SUFDZixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FBQyxFQUM3QyxRQUFRLENBQ1QsRUFDRCxrREFBQyxDQUFDLElBQUksRUFDSixFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLG9CQUFvQixFQUFDLEVBQ3pDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDcEIsT0FBTyxrREFBQyxDQUNSLElBQUksRUFDSixFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFDWixrREFBQyxDQUFDLEtBQUssRUFDUCxFQUFFLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxFQUMzRCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNuQixFQUFFLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FDSCxDQUNGLENBQUM7QUFFRixJQUFJLHNEQUFHLENBQWlCO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsS0FBSztJQUNMLElBQUk7SUFDSixPQUFPO0NBQ1IsQ0FBQyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldywgVk5vZGUsIHVwZGF0ZUVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQgfSBmcm9tICcuL3ZpZXcnXG5pbXBvcnQgeyBBY3Rpb25UcmVlIH0gZnJvbSAnLi9hY3Rpb24nXG5cbmludGVyZmFjZSBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucyBleHRlbmRzIEFjdGlvblRyZWU8U3RhdGU+PiB7XG4gIC8qKiDjg6HjgqTjg7NOb2RlICovXG4gIGVsOiBFbGVtZW50IHwgc3RyaW5nXG4gIC8qKiBWaWV344Gu5a6a576pICovXG4gIHZpZXc6IFZpZXc8U3RhdGUsIEFjdGlvbnM+XG4gIC8qKiDnirbmhYvnrqHnkIYgKi9cbiAgc3RhdGU6IFN0YXRlXG4gIC8qKiBBY3Rpb27jga7lrprnvqkgKi9cbiAgYWN0aW9uczogQWN0aW9uc1xufVxuXG5leHBvcnQgY2xhc3MgQXBwPFN0YXRlLCBBY3Rpb25zIGV4dGVuZHMgQWN0aW9uVHJlZTxTdGF0ZT4+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBlbDogRWxlbWVudFxuICBwcml2YXRlIHJlYWRvbmx5IHZpZXc6IEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPlsndmlldyddXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU6IEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPlsnc3RhdGUnXVxuICBwcml2YXRlIHJlYWRvbmx5IGFjdGlvbnM6IEFwcENvbnN0cnVjdG9yPFN0YXRlLCBBY3Rpb25zPlsnYWN0aW9ucyddXG5cbiAgLyoqIOS7ruaDs0RPTe+8iOWkieabtOWJjeeUqO+8iSAqL1xuICBwcml2YXRlIG9sZE5vZGU6IFZOb2RlXG4gIC8qKiDku67mg7NET03vvIjlpInmm7TlvoznlKjvvIkgKi9cbiAgcHJpdmF0ZSBuZXdOb2RlOiBWTm9kZVxuXG4gIC8qKiDpgKPntprjgafjg6rjgqLjg6tET03mk43kvZzjgYzotbDjgonjgarjgYTjgZ/jgoHjga7jg5Xjg6njgrAgKi9cbiAgcHJpdmF0ZSBza2lwUmVuZGVyOiBib29sZWFuXG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz4pIHtcbiAgICB0aGlzLmVsID0gdHlwZW9mIHBhcmFtcy5lbCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtcy5lbCkgOiBwYXJhbXMuZWxcbiAgICB0aGlzLnZpZXcgPSBwYXJhbXMudmlld1xuICAgIHRoaXMuc3RhdGUgPSBwYXJhbXMuc3RhdGVcbiAgICB0aGlzLmFjdGlvbnMgPSB0aGlzLmRpc3BhdGNoQWN0aW9uKHBhcmFtcy5hY3Rpb25zKVxuICAgIHRoaXMucmVzb2x2ZU5vZGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIOODpuODvOOCtuOBjOWumue+qeOBl+OBn0FjdGlvbnPjgavku67mg7NET03lho3mp4vnr4nnlKjjga7jg5Xjg4Pjgq/jgpLku5XovrzjgoBcbiAgICogQHBhcmFtIGFjdGlvbnNcbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hBY3Rpb24oYWN0aW9uczogQWN0aW9ucyk6IEFjdGlvbnMge1xuICAgIGNvbnN0IGRpc3BhdGNoZWQ6IEFjdGlvblRyZWU8U3RhdGU+ID0ge31cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGFjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbnNba2V5XVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIGRpc3BhdGNoZWRba2V5XSA9IChzdGF0ZTogU3RhdGUsIC4uLmRhdGE6IGFueSk6IGFueSA9PiB7XG4gICAgICAgIGNvbnN0IHJldCA9IGFjdGlvbihzdGF0ZSwgLi4uZGF0YSlcbiAgICAgICAgdGhpcy5yZXNvbHZlTm9kZSgpXG4gICAgICAgIHJldHVybiByZXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGF0Y2hlZCBhcyBBY3Rpb25zXG4gIH1cblxuICAvKipcbiAgICog5Luu5oOzRE9N44KS5qeL56+J44GZ44KLXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVOb2RlKCk6IHZvaWQge1xuICAgIC8vIOS7ruaDs0RPTeOCkuWGjeani+evieOBmeOCi1xuICAgIHRoaXMubmV3Tm9kZSA9IHRoaXMudmlldyh0aGlzLnN0YXRlLCB0aGlzLmFjdGlvbnMpXG4gICAgdGhpcy5zY2hlZHVsZVJlbmRlcigpXG4gIH1cblxuICAvKipcbiAgICogcmVuZGVy44Gu44K544Kx44K444Ol44O844Oq44Oz44Kw44KS6KGM44GGXG4gICAqL1xuICBwcml2YXRlIHNjaGVkdWxlUmVuZGVyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5za2lwUmVuZGVyKSB7XG4gICAgICB0aGlzLnNraXBSZW5kZXIgPSB0cnVlXG4gICAgICAvLyBzZXRUaW1lb3V044KS5L2/44GG44GT44Go44Gn6Z2e5ZCM5pyf44Gr44Gq44KK44CB44GL44Gk5a6f6KGM44KS5pWw44Of44Oq56eS6YGF5bu244Gn44GN44KLXG4gICAgICBzZXRUaW1lb3V0KHRoaXMucmVuZGVyLmJpbmQodGhpcykpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOODquOCouODq0RPTeOBq+WPjeaYoOOBmeOCi1xuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMub2xkTm9kZSkge1xuICAgICAgdXBkYXRlRWxlbWVudCh0aGlzLmVsIGFzIEhUTUxFbGVtZW50LCB0aGlzLm9sZE5vZGUsIHRoaXMubmV3Tm9kZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KHRoaXMubmV3Tm9kZSkpXG4gICAgfVxuXG4gICAgdGhpcy5vbGROb2RlID0gdGhpcy5uZXdOb2RlXG4gICAgdGhpcy5za2lwUmVuZGVyID0gZmFsc2VcbiAgfVxufVxuIiwiLyoqIE5vZGXjgYzlj5bjgorjgYbjgosz56iu44Gu5Z6LICovXG50eXBlIE5vZGVUeXBlID0gVk5vZGUgfCBzdHJpbmcgfCBudW1iZXJcbi8qKiDlsZ7mgKfjga7lnosgKi9cbnR5cGUgQXR0cmlidXRlVHlwZSA9IHN0cmluZyB8IEV2ZW50TGlzdGVuZXJcbnR5cGUgQXR0cmlidXRlcyA9IHtcbiAgW2F0dHI6IHN0cmluZ106IEF0dHJpYnV0ZVR5cGUgXG59XG5cbi8qKlxuICog5Luu5oOzRE9N44Gu44Gy44Go44Gk44Gu44Kq44OW44K444Kn44Kv44OI44KS6KGo44GZ5Z6LXG4gKi9cbmV4cG9ydCB0eXBlIFZOb2RlID0ge1xuICBub2RlTmFtZToga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwXG4gIGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZXNcbiAgY2hpbGRyZW46IE5vZGVUeXBlW11cbn1cblxuLyoqXG4gKiBOb2Rl44KS5Y+X44GR5Y+W44KK44CBVk5vZGXjgarjga7jgYtUZXh044Gq44Gu44GL44KS5Yik5a6a44GZ44KLXG4gKi9cbmNvbnN0IGlzVk5vZGUgPSAobm9kZTogTm9kZVR5cGUpOiBub2RlIGlzIFZOb2RlID0+IHtcbiAgcmV0dXJuIHR5cGVvZiBub2RlICE9PSAnc3RyaW5nJyAmJiB0eXBlb2Ygbm9kZSAhPT0gJ251bWJlcidcbn1cblxuLyoqXG4gKiDlj5fjgZHlj5bjgaPjgZ/lsZ7mgKfjgYzjgqTjg5njg7Pjg4jjgYvjganjgYbjgYvliKTlrprjgZnjgotcbiAqIEBwYXJhbSBhdHRyaWJ1dGUg5bGe5oCnXG4gKi9cbmNvbnN0IGlzRXZlbnRBdHRyID0gKGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIC8vIG9u44GL44KJ44Gv44GY44G+44KL5bGe5oCn5ZCN44Gv44Kk44OZ44Oz44OI44Go44GX44Gm5omx44GGXG4gIHJldHVybiAvXm9uLy50ZXN0KGF0dHJpYnV0ZSlcbn1cblxuLyoqXG4gKiBWaWV35bGk44Gu5Z6L5a6a576pXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmlldzxTdGF0ZSwgQWN0aW9ucz4ge1xuICAoc3RhdGU6IFN0YXRlLCBhY3Rpb25zOiBBY3Rpb25zKTogVk5vZGVcbn1cblxuLyoqXG4gKiDku67mg7NET03jgpLkvZzmiJDjgZnjgotcbiAqIEBwYXJhbSBub2RlTmFtZSBOb2Rl44Gu5ZCN5YmN77yISFRNTOOBruOCv+OCsOWQje+8iVxuICogQHBhcmFtIGF0dHJpYnV0ZXMgTm9kZeOBruWxnuaAp++8iHdpZHRoL2hlaWdodOOChHN0eWxl44Gq44Gp77yJXG4gKiBAcGFyYW0gY2hpbGRyZW4gTm9kZeOBruWtkOimgee0oOOBruODquOCueODiFxuICovXG5leHBvcnQgZnVuY3Rpb24gaChub2RlTmFtZTogVk5vZGVbJ25vZGVOYW1lJ10sIGF0dHJpYnV0ZXM6IFZOb2RlWydhdHRyaWJ1dGVzJ10sIC4uLmNoaWxkcmVuOiBWTm9kZVsnY2hpbGRyZW4nXSk6IFZOb2RlIHtcbiAgcmV0dXJuIHtcbiAgICBub2RlTmFtZSxcbiAgICBhdHRyaWJ1dGVzLFxuICAgIGNoaWxkcmVuXG4gIH1cbn1cblxuLyoqXG4gKiDlsZ7mgKfjgpLoqK3lrprjgZnjgotcbiAqIEBwYXJhbSB0YXJnZXQg5pON5L2c5a++6LGh44GuRWxlbWVudFxuICogQHBhcmFtIGF0dHJpYnV0ZXMgRWxlbWVudOOBq+i/veWKoOOBl+OBn+OBhOWxnuaAp+OBruODquOCueODiFxuICovXG5jb25zdCBzZXRBdHRyaWJ1dGVzID0gKHRhcmdldDogSFRNTEVsZW1lbnQsIGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZXMpOiB2b2lkID0+IHtcbiAgZm9yIChjb25zdCBhdHRyIGluIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIC8vIG9uY2xpY2vjgarjganjga/jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgavnmbvpjLLjgZnjgotcbiAgICAgIC8vIG9uY2xpY2vjgoRvbmlucHV044CBb25jaGFuZ2Xjgarjganjga5vbuOCkumZpOOBhOOBn+OCpOODmeODs+ODiOWQjeOCkuWPluW+l+OBmeOCi1xuICAgICAgY29uc3QgZXZlbnROYW1lID0gYXR0ci5zbGljZSgyKVxuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBhdHRyaWJ1dGVzW2F0dHJdIGFzIEV2ZW50TGlzdGVuZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOOCpOODmeODs+ODiOODquOCueODiuKIkuS7peWkluOBr+OBneOBruOBvuOBvuWxnuaAp+OBq+ioreWumuOBmeOCi1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShhdHRyLCBhdHRyaWJ1dGVzW2F0dHJdIGFzIHN0cmluZylcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiDlsZ7mgKfjgpLmm7TmlrDjgZnjgotcbiAqIEBwYXJhbSB0YXJnZXQg5pON5L2c5a++6LGh44GuRWxlbWVudFxuICogQHBhcmFtIG9sZEF0dHJzIOWPpOOBhOWxnuaAp1xuICogQHBhcmFtIG5ld0F0dHJzIOaWsOOBl+OBhOWxnuaAp1xuICovXG5jb25zdCB1cGRhdGVBdHRyaWJ1dGVzID0gKHRhcmdldDogSFRNTEVsZW1lbnQsIG9sZEF0dHJzOiBBdHRyaWJ1dGVzLCBuZXdBdHRyczogQXR0cmlidXRlcyk6IHZvaWQgPT4ge1xuICAvLyDlh6bnkIbjgpLjgrfjg7Pjg5fjg6vjgavjgZnjgovjgZ/jgoFvbGRBdHRyc+OCkuWJiumZpOW+jOOAgW5ld0F0dHJz44Gn5YaN6Kit5a6a44GZ44KLXG4gIGZvciAoY29uc3QgYXR0ciBpbiBvbGRBdHRycykge1xuICAgIGlmICghaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoYXR0cilcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGF0dHIgaW4gbmV3QXR0cnMpIHtcbiAgICBpZiAoIWlzRXZlbnRBdHRyKGF0dHIpKSB7XG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsIG5ld0F0dHJzW2F0dHJdIGFzIHN0cmluZylcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBpbnB1dOimgee0oOOBrnZhbHVl44KS5pu05paw44GZ44KLXG4gKiBAcGFyYW0gdGFyZ2V0IOaTjeS9nOWvvuixoeOBrmlucHV06KaB57SgXG4gKiBAcGFyYW0gbmV3VmFsdWUgaW5wdXTjga52YWx1ZeOBq+ioreWumuOBmeOCi+WApFxuICovXG5jb25zdCB1cGRhdGVWYWx1ZSA9ICh0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQsIG5ld1ZhbHVlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgdGFyZ2V0LnZhbHVlID0gbmV3VmFsdWVcbn1cblxuLyoqIOW3ruWIhuOBruOCv+OCpOODlyAqL1xuZW51bSBDaGFuZ2VkVHlwZSB7XG4gIC8qKiDlt67liIbjgarjgZcgKi9cbiAgTm9uZSxcbiAgLyoqIE5vZGVUeXBl44GM55Ww44Gq44KLICovXG4gIFR5cGUsXG4gIC8qKiDjg4bjgq3jgrnjg4hOb2Rl44GM55Ww44Gq44KLICovXG4gIFRleHQsXG4gIC8qKiDopoHntKDlkI3jgYznlbDjgarjgosgKi9cbiAgTm9kZSxcbiAgLyoqIHZhbHVl5bGe5oCn44GM55Ww44Gq44KL77yIaW5wdXTopoHntKDnlKjvvIkgKi9cbiAgVmFsdWUsXG4gIC8qKiDlsZ7mgKfjgYznlbDjgarjgosgKi9cbiAgQXR0clxufVxuLyoqXG4gKiDlt67liIbmpJznn6XjgpLooYzjgYZcbiAqIEBwYXJhbSBhXG4gKiBAcGFyYW0gYlxuICovXG5jb25zdCBoYXNDaGFuZ2VkID0gKGE6IE5vZGVUeXBlLCBiOiBOb2RlVHlwZSk6IENoYW5nZWRUeXBlID0+IHtcbiAgaWYgKHR5cGVvZiBhICE9PSB0eXBlb2YgYikge1xuICAgIHJldHVybiBDaGFuZ2VkVHlwZS5UeXBlXG4gIH1cblxuICBpZiAoIWlzVk5vZGUoYSkgJiYgYSAhPT0gYikge1xuICAgIHJldHVybiBDaGFuZ2VkVHlwZS5UZXh0XG4gIH1cblxuICBpZiAoaXNWTm9kZShhKSAmJiBpc1ZOb2RlKGIpKSB7XG4gICAgaWYgKGEubm9kZU5hbWUgIT09IGIubm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5Ob2RlXG4gICAgfVxuXG4gICAgaWYgKGEuYXR0cmlidXRlcy52YWx1ZSAhPT0gYi5hdHRyaWJ1dGVzLnZhbHVlKSB7XG4gICAgICByZXR1cm4gQ2hhbmdlZFR5cGUuVmFsdWVcbiAgICB9XG5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoYS5hdHRyaWJ1dGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkoYi5hdHRyaWJ1dGVzKSkge1xuICAgICAgLy8g5pys5p2l44Gq44KJ44Kq44OW44K444Kn44Kv44OI44Gy44Go44Gk44Gy44Go44Gk44KS5q+U6LyD44GZ44G544GN44Gq44Gu44Gn44GZ44GM44CB44K344Oz44OX44Or44Gq5a6f6KOF44Gr44GZ44KL44Gf44KB44GrSlNPTi5zdHJpbmdpZnnjgpLkvb/jgaPjgabjgYTjgb7jgZlcbiAgICAgIC8vIEpTT04uc3RyaW5naWZ544KS5L2/44Gj44Gf44Kq44OW44K444Kn44Kv44OI44Gu5q+U6LyD44Gv572g44GM5aSa44GE44Gu44Gn44CB44Gn44GN44KL44Gg44GR5L2/44KP44Gq44GE44G744GG44GM6Imv44GE44Gn44GZXG4gICAgICByZXR1cm4gQ2hhbmdlZFR5cGUuQXR0clxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBDaGFuZ2VkVHlwZS5Ob25lXG59XG5cbi8qKlxuICog44Oq44Ki44OrRE9N44KS5L2c5oiQ44GZ44KLXG4gKiBAcGFyYW0gbm9kZSDkvZzmiJDjgZnjgotOb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KG5vZGU6IE5vZGVUeXBlKTogSFRNTEVsZW1lbnQgfCBUZXh0IHtcbiAgaWYgKCFpc1ZOb2RlKG5vZGUpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUudG9TdHJpbmcoKSlcbiAgfVxuXG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlLm5vZGVOYW1lKVxuICBzZXRBdHRyaWJ1dGVzKGVsLCBub2RlLmF0dHJpYnV0ZXMpXG4gIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBlbC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KGNoaWxkKSkpXG5cbiAgcmV0dXJuIGVsXG59XG5cbi8qKlxuICog5Luu5oOzRE9N44Gu5beu5YiG44KS5qSc55+l44GX44CB44Oq44Ki44OrRE9N44Gr5Y+N5pig44GZ44KLXG4gKiBAcGFyYW0gcGFyZW50IOimquimgee0oFxuICogQHBhcmFtIG9sZE5vZGUg5Y+k44GETm9kZeaDheWgsVxuICogQHBhcmFtIG5ld05vZGUg5paw44GX44GETm9kZeaDheWgsVxuICogQHBhcmFtIGluZGV4IOWtkOimgee0oOOBrumghueVqlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRWxlbWVudChwYXJlbnQ6IEhUTUxFbGVtZW50LCBvbGROb2RlOiBOb2RlVHlwZSwgbmV3Tm9kZTogTm9kZVR5cGUsIGluZGV4ID0gMCk6IHZvaWQge1xuICAvLyBvbGROb2Rl44GM44Gq44GE5aC05ZCI44Gv5paw44GX44GETm9kZeOCkuS9nOaIkOOBmeOCi1xuICBpZiAoIW9sZE5vZGUpIHtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudChuZXdOb2RlKSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIG5ld05vZGXjgYzjgarjgYTloLTlkIjjga/liYrpmaTjgZXjgozjgZ/jgajliKTmlq3jgZfjgIHjgZ3jga5Ob2Rl44KS5YmK6Zmk44GZ44KLXG4gIGNvbnN0IHRhcmdldCA9IHBhcmVudC5jaGlsZE5vZGVzW2luZGV4XVxuICBpZiAoIW5ld05vZGUpIHtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8g5beu5YiG5qSc55+l44GX44CB44OR44OD44OB5Yem55CG77yI5aSJ5pu0566H5omA44Gg44GR5Y+N5pig77yJ44KS6KGM44GGXG4gIGNvbnN0IGNoYW5nZVR5cGUgPSBoYXNDaGFuZ2VkKG9sZE5vZGUsIG5ld05vZGUpXG4gIHN3aXRjaCAoY2hhbmdlVHlwZSkge1xuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVHlwZTpcbiAgICBjYXNlIENoYW5nZWRUeXBlLlRleHQ6XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5Ob2RlOlxuICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZChjcmVhdGVFbGVtZW50KG5ld05vZGUpLCB0YXJnZXQpXG4gICAgICByZXR1cm5cbiAgICBjYXNlIENoYW5nZWRUeXBlLlZhbHVlOlxuICAgICAgdXBkYXRlVmFsdWUodGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQsIChuZXdOb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzLnZhbHVlIGFzIHN0cmluZylcbiAgICAgIHJldHVyblxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuQXR0cjpcbiAgICAgIHVwZGF0ZUF0dHJpYnV0ZXModGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQsIChvbGROb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzLCAobmV3Tm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcylcbiAgICAgIHJldHVyblxuICB9XG5cbiAgLy8g5a2Q6KaB57Sg44Gu5beu5YiG5qSc55+l44O744Oq44Ki44OrRE9N5Y+N5pig44KS5YaN5biw55qE44Gr5a6f6KGM44GZ44KLXG4gIGlmIChpc1ZOb2RlKG9sZE5vZGUpICYmIGlzVk5vZGUobmV3Tm9kZSkpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld05vZGUuY2hpbGRyZW4ubGVuZ3RoIHx8IGkgPCBvbGROb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICB1cGRhdGVFbGVtZW50KHRhcmdldCBhcyBIVE1MRWxlbWVudCwgb2xkTm9kZS5jaGlsZHJlbltpXSwgbmV3Tm9kZS5jaGlsZHJlbltpXSwgaSlcbiAgICB9XG4gIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gJy4vZnJhbWV3b3JrL2FjdGlvbidcbmltcG9ydCB7IFZpZXcsIGggfSBmcm9tICcuL2ZyYW1ld29yay92aWV3J1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9mcmFtZXdvcmsvY29udHJvbGxlcidcblxudHlwZSBTdGF0ZSA9IHR5cGVvZiBzdGF0ZTtcbnR5cGUgQWN0aW9ucyA9IHR5cGVvZiBhY3Rpb25zO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgaW1nOiBbXCJpdGFnYWtpLnBuZ1wiLFwicGllbi5wbmdcIl0sXG4gIGltZ3M6IFtcIml0YWdha2kucG5nXCJdLFxuICBuOiAwXG59O1xuXG5jb25zdCBhY3Rpb25zOiBBY3Rpb25UcmVlIDxTdGF0ZT49IHtcbiAgaW5jcmVtZW50OiAoc3RhdGU6IFN0YXRlKSA9PiB7XG4gICAgaWYgKHN0YXRlLm4gPT0gMCl7XG4gICAgICBzdGF0ZS5uID0gMVxuICAgICAgc3RhdGUuaW1ncy5wdXNoKHN0YXRlLmltZ1tzdGF0ZS5uXSlcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgc3RhdGUubiA9IDBcbiAgICBzdGF0ZS5pbWdzLnB1c2goc3RhdGUuaW1nW3N0YXRlLm5dKVxuICAgIHJldHVyblxuICB9XG59O1xuXG5jb25zdCB2aWV3OiBWaWV3PFN0YXRlLCBBY3Rpb25zPiA9IChzdGF0ZSwgYWN0aW9ucykgPT4gaChcImRpdlwiLCB7IGlkOiBcImNvdW50dXBcIiB9LFxuICBoKFwiYnV0dG9uXCIsIHtcbiAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgIGlkOiBcImluY3JlbWVudFwiLFxuICAgIG9uY2xpY2s6ICgpID0+IHsgYWN0aW9ucy5pbmNyZW1lbnQoc3RhdGUpOyB9fSxcbiAgICBcImNoYW5nZVwiIFxuICApLFxuICBoKFwidWxcIixcbiAgICB7Y2xhc3M6IFwidWxcIiwgc3R5bGU6XCIgbGlzdC1zdHlsZTogbm9uZTtcIn0sXG4gICAgLi4uc3RhdGUuaW1ncy5tYXAoYSA9PiB7XG4gICAgICByZXR1cm4gaChcbiAgICAgIFwibGlcIiwgXG4gICAgICB7Y2xhc3M6XCJsaVwifSwgXG4gICAgICBoKFwiaW1nXCIsIFxuICAgICAgeyBzcmM6IFwiaW1hZ2VzL1wiICsgYSwgc3R5bGU6IFwiaGVpZ2h0OiA1MHB4OyB3aWR0aDogNTBweDtcIiB9LCBcbiAgICAgIHN0YXRlLmltZ1tzdGF0ZS5uXSksIFxuICAgICAgXCJcIilcbiAgICB9KVxuICApXG4pO1xuXG5uZXcgQXBwPFN0YXRlLCBBY3Rpb25zPih7XG4gIGVsOiBcIiNhcHBcIixcbiAgc3RhdGUsXG4gIHZpZXcsXG4gIGFjdGlvbnNcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==