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
    tasks: ['Learn about Virtual DOM', 'Write a document'],
    form: {
        title: '',
        hasError: false
    }
};
const actions = {
    validate(state, title) {
        if (!title || title.length < 3 || title.length > 20) {
            state.form.hasError = true;
        }
        else {
            state.form.hasError = false;
        }
        return !state.form.hasError;
    },
    createTask(state, title = '') {
        state.tasks.push(title);
        state.form.title = '';
    },
    removeTask(state, index) {
        state.tasks.splice(index, 1);
    }
};
/**
 * View: 描画関連
 */
const view = (state, actions) => {
    // prettier-ignore
    return (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('div', {
        class: 'nes-container is-rounded',
        style: 'padding: 2rem;'
    }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('h1', {
        class: 'title',
        style: 'margin-bottom: 2rem;'
    }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('i', { class: 'nes-icon heart is-medium' }), 'Virtual DOM TODO App '), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('form', {
        class: 'nes-container',
        style: 'margin-bottom: 2rem;'
    }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('div', {
        class: 'nes-field',
        style: 'margin-bottom: 1rem;',
    }, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('label', {
        class: 'label',
        for: 'task-title'
    }, 'Title'), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('input', {
        type: 'text',
        id: 'task-title',
        class: 'nes-input',
        value: state.form.title,
        oninput: (ev) => {
            const target = ev.target;
            state.form.title = target.value;
            actions.validate(state, target.value);
        }
    })), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('p', {
        class: 'nes-text is-error',
        style: `display: ${state.form.hasError ? 'display' : 'none'}`,
    }, 'Enter a value between 3 and 20 characters'), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('button', {
        type: 'button',
        class: 'nes-btn is-primary',
        onclick: () => {
            if (state.form.hasError)
                return;
            actions.createTask(state, state.form.title);
        }
    }, 'Create')), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('ul', { class: 'nes-list is-disc nes-container' }, ...state.tasks.map((task, i) => {
        return (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('li', {
            class: 'item',
            style: 'margin-bottom: 1rem;'
        }, task, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)('button', {
            type: 'button',
            class: 'nes-btn is-error',
            style: 'margin-left: 1rem;',
            onclick: () => actions.removeTask(state, i)
        }, '×'));
    })));
};
new _framework_controller__WEBPACK_IMPORTED_MODULE_1__.App({
    el: '#app',
    state,
    view,
    actions
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tLy4vc3JjL2ZyYW1ld29yay9jb250cm9sbGVyLnRzIiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvZnJhbWV3b3JrL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQWtFO0FBYzNELE1BQU0sR0FBRztJQWNkLFlBQVksTUFBc0M7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkYsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLFVBQVUsR0FBc0IsRUFBRTtRQUV4QyxLQUFLLE1BQU0sR0FBRyxJQUFJ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O0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsS0FBSztJQUNMLElBQUk7SUFDSixPQUFPO0NBQ1IsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcsIFZOb2RlLCB1cGRhdGVFbGVtZW50LCBjcmVhdGVFbGVtZW50IH0gZnJvbSAnLi92aWV3J1xuaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gJy4vYWN0aW9uJ1xuXG5pbnRlcmZhY2UgQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnMgZXh0ZW5kcyBBY3Rpb25UcmVlPFN0YXRlPj4ge1xuICAvKiog44Oh44Kk44OzTm9kZSAqL1xuICBlbDogRWxlbWVudCB8IHN0cmluZ1xuICAvKiogVmlld+OBruWumue+qSAqL1xuICB2aWV3OiBWaWV3PFN0YXRlLCBBY3Rpb25zPlxuICAvKiog54q25oWL566h55CGICovXG4gIHN0YXRlOiBTdGF0ZVxuICAvKiogQWN0aW9u44Gu5a6a576pICovXG4gIGFjdGlvbnM6IEFjdGlvbnNcbn1cblxuZXhwb3J0IGNsYXNzIEFwcDxTdGF0ZSwgQWN0aW9ucyBleHRlbmRzIEFjdGlvblRyZWU8U3RhdGU+PiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZWw6IEVsZW1lbnRcbiAgcHJpdmF0ZSByZWFkb25seSB2aWV3OiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ3ZpZXcnXVxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ3N0YXRlJ11cbiAgcHJpdmF0ZSByZWFkb25seSBhY3Rpb25zOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz5bJ2FjdGlvbnMnXVxuXG4gIC8qKiDku67mg7NET03vvIjlpInmm7TliY3nlKjvvIkgKi9cbiAgcHJpdmF0ZSBvbGROb2RlOiBWTm9kZVxuICAvKiog5Luu5oOzRE9N77yI5aSJ5pu05b6M55So77yJICovXG4gIHByaXZhdGUgbmV3Tm9kZTogVk5vZGVcblxuICAvKiog6YCj57aa44Gn44Oq44Ki44OrRE9N5pON5L2c44GM6LWw44KJ44Gq44GE44Gf44KB44Gu44OV44Op44KwICovXG4gIHByaXZhdGUgc2tpcFJlbmRlcjogYm9vbGVhblxuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogQXBwQ29uc3RydWN0b3I8U3RhdGUsIEFjdGlvbnM+KSB7XG4gICAgdGhpcy5lbCA9IHR5cGVvZiBwYXJhbXMuZWwgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJhbXMuZWwpIDogcGFyYW1zLmVsXG4gICAgdGhpcy52aWV3ID0gcGFyYW1zLnZpZXdcbiAgICB0aGlzLnN0YXRlID0gcGFyYW1zLnN0YXRlXG4gICAgdGhpcy5hY3Rpb25zID0gdGhpcy5kaXNwYXRjaEFjdGlvbihwYXJhbXMuYWN0aW9ucylcbiAgICB0aGlzLnJlc29sdmVOb2RlKClcbiAgfVxuXG4gIC8qKlxuICAgKiDjg6bjg7zjgrbjgYzlrprnvqnjgZfjgZ9BY3Rpb25z44Gr5Luu5oOzRE9N5YaN5qeL56+J55So44Gu44OV44OD44Kv44KS5LuV6L6844KAXG4gICAqIEBwYXJhbSBhY3Rpb25zXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoQWN0aW9uKGFjdGlvbnM6IEFjdGlvbnMpOiBBY3Rpb25zIHtcbiAgICBjb25zdCBkaXNwYXRjaGVkOiBBY3Rpb25UcmVlPFN0YXRlPiA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhY3Rpb25zKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25zW2tleV1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBkaXNwYXRjaGVkW2tleV0gPSAoc3RhdGU6IFN0YXRlLCAuLi5kYXRhOiBhbnkpOiBhbnkgPT4ge1xuICAgICAgICBjb25zdCByZXQgPSBhY3Rpb24oc3RhdGUsIC4uLmRhdGEpXG4gICAgICAgIHRoaXMucmVzb2x2ZU5vZGUoKVxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpc3BhdGNoZWQgYXMgQWN0aW9uc1xuICB9XG5cbiAgLyoqXG4gICAqIOS7ruaDs0RPTeOCkuani+evieOBmeOCi1xuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlTm9kZSgpOiB2b2lkIHtcbiAgICAvLyDku67mg7NET03jgpLlho3mp4vnr4njgZnjgotcbiAgICB0aGlzLm5ld05vZGUgPSB0aGlzLnZpZXcodGhpcy5zdGF0ZSwgdGhpcy5hY3Rpb25zKVxuICAgIHRoaXMuc2NoZWR1bGVSZW5kZXIoKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlbmRlcuOBruOCueOCseOCuOODpeODvOODquODs+OCsOOCkuihjOOBhlxuICAgKi9cbiAgcHJpdmF0ZSBzY2hlZHVsZVJlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2tpcFJlbmRlcikge1xuICAgICAgdGhpcy5za2lwUmVuZGVyID0gdHJ1ZVxuICAgICAgLy8gc2V0VGltZW91dOOCkuS9v+OBhuOBk+OBqOOBp+mdnuWQjOacn+OBq+OBquOCiuOAgeOBi+OBpOWun+ihjOOCkuaVsOODn+ODquenkumBheW7tuOBp+OBjeOCi1xuICAgICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDjg6rjgqLjg6tET03jgavlj43mmKDjgZnjgotcbiAgICovXG4gIHByaXZhdGUgcmVuZGVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm9sZE5vZGUpIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnQodGhpcy5lbCBhcyBIVE1MRWxlbWVudCwgdGhpcy5vbGROb2RlLCB0aGlzLm5ld05vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudCh0aGlzLm5ld05vZGUpKVxuICAgIH1cblxuICAgIHRoaXMub2xkTm9kZSA9IHRoaXMubmV3Tm9kZVxuICAgIHRoaXMuc2tpcFJlbmRlciA9IGZhbHNlXG4gIH1cbn1cbiIsIi8qKiBOb2Rl44GM5Y+W44KK44GG44KLM+eoruOBruWeiyAqL1xudHlwZSBOb2RlVHlwZSA9IFZOb2RlIHwgc3RyaW5nIHwgbnVtYmVyXG4vKiog5bGe5oCn44Gu5Z6LICovXG50eXBlIEF0dHJpYnV0ZVR5cGUgPSBzdHJpbmcgfCBFdmVudExpc3RlbmVyXG50eXBlIEF0dHJpYnV0ZXMgPSB7XG4gIFthdHRyOiBzdHJpbmddOiBBdHRyaWJ1dGVUeXBlXG59XG5cbi8qKlxuICog5Luu5oOzRE9N44Gu44Gy44Go44Gk44Gu44Kq44OW44K444Kn44Kv44OI44KS6KGo44GZ5Z6LXG4gKi9cbmV4cG9ydCB0eXBlIFZOb2RlID0ge1xuICBub2RlTmFtZToga2V5b2YgRWxlbWVudFRhZ05hbWVNYXBcbiAgYXR0cmlidXRlczogQXR0cmlidXRlc1xuICBjaGlsZHJlbjogTm9kZVR5cGVbXVxufVxuXG4vKipcbiAqIE5vZGXjgpLlj5fjgZHlj5bjgorjgIFWTm9kZeOBquOBruOBi1RleHTjgarjga7jgYvjgpLliKTlrprjgZnjgotcbiAqL1xuY29uc3QgaXNWTm9kZSA9IChub2RlOiBOb2RlVHlwZSk6IG5vZGUgaXMgVk5vZGUgPT4ge1xuICByZXR1cm4gdHlwZW9mIG5vZGUgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBub2RlICE9PSAnbnVtYmVyJ1xufVxuXG4vKipcbiAqIOWPl+OBkeWPluOBo+OBn+WxnuaAp+OBjOOCpOODmeODs+ODiOOBi+OBqeOBhuOBi+WIpOWumuOBmeOCi1xuICogQHBhcmFtIGF0dHJpYnV0ZSDlsZ7mgKdcbiAqL1xuY29uc3QgaXNFdmVudEF0dHIgPSAoYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgLy8gb27jgYvjgonjga/jgZjjgb7jgovlsZ7mgKflkI3jga/jgqTjg5njg7Pjg4jjgajjgZfjgabmibHjgYZcbiAgcmV0dXJuIC9eb24vLnRlc3QoYXR0cmlidXRlKVxufVxuXG4vKipcbiAqIFZpZXflsaTjga7lnovlrprnvqlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3PFN0YXRlLCBBY3Rpb25zPiB7XG4gIChzdGF0ZTogU3RhdGUsIGFjdGlvbnM6IEFjdGlvbnMpOiBWTm9kZVxufVxuXG4vKipcbiAqIOS7ruaDs0RPTeOCkuS9nOaIkOOBmeOCi1xuICogQHBhcmFtIG5vZGVOYW1lIE5vZGXjga7lkI3liY3vvIhIVE1M44Gu44K/44Kw5ZCN77yJXG4gKiBAcGFyYW0gYXR0cmlidXRlcyBOb2Rl44Gu5bGe5oCn77yId2lkdGgvaGVpZ2h044KEc3R5bGXjgarjganvvIlcbiAqIEBwYXJhbSBjaGlsZHJlbiBOb2Rl44Gu5a2Q6KaB57Sg44Gu44Oq44K544OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoKG5vZGVOYW1lOiBWTm9kZVsnbm9kZU5hbWUnXSwgYXR0cmlidXRlczogVk5vZGVbJ2F0dHJpYnV0ZXMnXSwgLi4uY2hpbGRyZW46IFZOb2RlWydjaGlsZHJlbiddKTogVk5vZGUge1xuICByZXR1cm4ge1xuICAgIG5vZGVOYW1lLFxuICAgIGF0dHJpYnV0ZXMsXG4gICAgY2hpbGRyZW5cbiAgfVxufVxuXG4vKipcbiAqIOWxnuaAp+OCkuioreWumuOBmeOCi1xuICogQHBhcmFtIHRhcmdldCDmk43kvZzlr77osaHjga5FbGVtZW50XG4gKiBAcGFyYW0gYXR0cmlidXRlcyBFbGVtZW5044Gr6L+95Yqg44GX44Gf44GE5bGe5oCn44Gu44Oq44K544OIXG4gKi9cbmNvbnN0IHNldEF0dHJpYnV0ZXMgPSAodGFyZ2V0OiBIVE1MRWxlbWVudCwgYXR0cmlidXRlczogQXR0cmlidXRlcyk6IHZvaWQgPT4ge1xuICBmb3IgKGNvbnN0IGF0dHIgaW4gYXR0cmlidXRlcykge1xuICAgIGlmIChpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgLy8gb25jbGlja+OBquOBqeOBr+OCpOODmeODs+ODiOODquOCueODiuODvOOBq+eZu+mMsuOBmeOCi1xuICAgICAgLy8gb25jbGlja+OChG9uaW5wdXTjgIFvbmNoYW5nZeOBquOBqeOBrm9u44KS6Zmk44GE44Gf44Kk44OZ44Oz44OI5ZCN44KS5Y+W5b6X44GZ44KLXG4gICAgICBjb25zdCBldmVudE5hbWUgPSBhdHRyLnNsaWNlKDIpXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGF0dHJpYnV0ZXNbYXR0cl0gYXMgRXZlbnRMaXN0ZW5lcilcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g44Kk44OZ44Oz44OI44Oq44K544OK4oiS5Lul5aSW44Gv44Gd44Gu44G+44G+5bGe5oCn44Gr6Kit5a6a44GZ44KLXG4gICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJpYnV0ZXNbYXR0cl0gYXMgc3RyaW5nKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIOWxnuaAp+OCkuabtOaWsOOBmeOCi1xuICogQHBhcmFtIHRhcmdldCDmk43kvZzlr77osaHjga5FbGVtZW50XG4gKiBAcGFyYW0gb2xkQXR0cnMg5Y+k44GE5bGe5oCnXG4gKiBAcGFyYW0gbmV3QXR0cnMg5paw44GX44GE5bGe5oCnXG4gKi9cbmNvbnN0IHVwZGF0ZUF0dHJpYnV0ZXMgPSAodGFyZ2V0OiBIVE1MRWxlbWVudCwgb2xkQXR0cnM6IEF0dHJpYnV0ZXMsIG5ld0F0dHJzOiBBdHRyaWJ1dGVzKTogdm9pZCA9PiB7XG4gIC8vIOWHpueQhuOCkuOCt+ODs+ODl+ODq+OBq+OBmeOCi+OBn+OCgW9sZEF0dHJz44KS5YmK6Zmk5b6M44CBbmV3QXR0cnPjgaflho3oqK3lrprjgZnjgotcbiAgZm9yIChjb25zdCBhdHRyIGluIG9sZEF0dHJzKSB7XG4gICAgaWYgKCFpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShhdHRyKVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgYXR0ciBpbiBuZXdBdHRycykge1xuICAgIGlmICghaXNFdmVudEF0dHIoYXR0cikpIHtcbiAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgbmV3QXR0cnNbYXR0cl0gYXMgc3RyaW5nKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGlucHV06KaB57Sg44GudmFsdWXjgpLmm7TmlrDjgZnjgotcbiAqIEBwYXJhbSB0YXJnZXQg5pON5L2c5a++6LGh44GuaW5wdXTopoHntKBcbiAqIEBwYXJhbSBuZXdWYWx1ZSBpbnB1dOOBrnZhbHVl44Gr6Kit5a6a44GZ44KL5YCkXG4gKi9cbmNvbnN0IHVwZGF0ZVZhbHVlID0gKHRhcmdldDogSFRNTElucHV0RWxlbWVudCwgbmV3VmFsdWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICB0YXJnZXQudmFsdWUgPSBuZXdWYWx1ZVxufVxuXG4vKiog5beu5YiG44Gu44K/44Kk44OXICovXG5lbnVtIENoYW5nZWRUeXBlIHtcbiAgLyoqIOW3ruWIhuOBquOBlyAqL1xuICBOb25lLFxuICAvKiogTm9kZVR5cGXjgYznlbDjgarjgosgKi9cbiAgVHlwZSxcbiAgLyoqIOODhuOCreOCueODiE5vZGXjgYznlbDjgarjgosgKi9cbiAgVGV4dCxcbiAgLyoqIOimgee0oOWQjeOBjOeVsOOBquOCiyAqL1xuICBOb2RlLFxuICAvKiogdmFsdWXlsZ7mgKfjgYznlbDjgarjgovvvIhpbnB1dOimgee0oOeUqO+8iSAqL1xuICBWYWx1ZSxcbiAgLyoqIOWxnuaAp+OBjOeVsOOBquOCiyAqL1xuICBBdHRyXG59XG4vKipcbiAqIOW3ruWIhuaknOefpeOCkuihjOOBhlxuICogQHBhcmFtIGFcbiAqIEBwYXJhbSBiXG4gKi9cbmNvbnN0IGhhc0NoYW5nZWQgPSAoYTogTm9kZVR5cGUsIGI6IE5vZGVUeXBlKTogQ2hhbmdlZFR5cGUgPT4ge1xuICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XG4gICAgcmV0dXJuIENoYW5nZWRUeXBlLlR5cGVcbiAgfVxuXG4gIGlmICghaXNWTm9kZShhKSAmJiBhICE9PSBiKSB7XG4gICAgcmV0dXJuIENoYW5nZWRUeXBlLlRleHRcbiAgfVxuXG4gIGlmIChpc1ZOb2RlKGEpICYmIGlzVk5vZGUoYikpIHtcbiAgICBpZiAoYS5ub2RlTmFtZSAhPT0gYi5ub2RlTmFtZSkge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLk5vZGVcbiAgICB9XG5cbiAgICBpZiAoYS5hdHRyaWJ1dGVzLnZhbHVlICE9PSBiLmF0dHJpYnV0ZXMudmFsdWUpIHtcbiAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5WYWx1ZVxuICAgIH1cblxuICAgIGlmIChKU09OLnN0cmluZ2lmeShhLmF0dHJpYnV0ZXMpICE9PSBKU09OLnN0cmluZ2lmeShiLmF0dHJpYnV0ZXMpKSB7XG4gICAgICAvLyDmnKzmnaXjgarjgonjgqrjg5bjgrjjgqfjgq/jg4jjgbLjgajjgaTjgbLjgajjgaTjgpLmr5TovIPjgZnjgbnjgY3jgarjga7jgafjgZnjgYzjgIHjgrfjg7Pjg5fjg6vjgarlrp/oo4XjgavjgZnjgovjgZ/jgoHjgatKU09OLnN0cmluZ2lmeeOCkuS9v+OBo+OBpuOBhOOBvuOBmVxuICAgICAgLy8gSlNPTi5zdHJpbmdpZnnjgpLkvb/jgaPjgZ/jgqrjg5bjgrjjgqfjgq/jg4jjga7mr5TovIPjga/nvaDjgYzlpJrjgYTjga7jgafjgIHjgafjgY3jgovjgaDjgZHkvb/jgo/jgarjgYTjgbvjgYbjgYzoia/jgYTjgafjgZlcbiAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5BdHRyXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIENoYW5nZWRUeXBlLk5vbmVcbn1cblxuLyoqXG4gKiDjg6rjgqLjg6tET03jgpLkvZzmiJDjgZnjgotcbiAqIEBwYXJhbSBub2RlIOS9nOaIkOOBmeOCi05vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZTogTm9kZVR5cGUpOiBIVE1MRWxlbWVudCB8IFRleHQge1xuICBpZiAoIWlzVk5vZGUobm9kZSkpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZS50b1N0cmluZygpKVxuICB9XG5cbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGUubm9kZU5hbWUpXG4gIHNldEF0dHJpYnV0ZXMoZWwsIG5vZGUuYXR0cmlidXRlcylcbiAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IGVsLmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQoY2hpbGQpKSlcblxuICByZXR1cm4gZWxcbn1cblxuLyoqXG4gKiDku67mg7NET03jga7lt67liIbjgpLmpJznn6XjgZfjgIHjg6rjgqLjg6tET03jgavlj43mmKDjgZnjgotcbiAqIEBwYXJhbSBwYXJlbnQg6Kaq6KaB57SgXG4gKiBAcGFyYW0gb2xkTm9kZSDlj6TjgYROb2Rl5oOF5aCxXG4gKiBAcGFyYW0gbmV3Tm9kZSDmlrDjgZfjgYROb2Rl5oOF5aCxXG4gKiBAcGFyYW0gaW5kZXgg5a2Q6KaB57Sg44Gu6aCG55WqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVFbGVtZW50KHBhcmVudDogSFRNTEVsZW1lbnQsIG9sZE5vZGU6IE5vZGVUeXBlLCBuZXdOb2RlOiBOb2RlVHlwZSwgaW5kZXggPSAwKTogdm9pZCB7XG4gIC8vIG9sZE5vZGXjgYzjgarjgYTloLTlkIjjga/mlrDjgZfjgYROb2Rl44KS5L2c5oiQ44GZ44KLXG4gIGlmICghb2xkTm9kZSkge1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KG5ld05vZGUpKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gbmV3Tm9kZeOBjOOBquOBhOWgtOWQiOOBr+WJiumZpOOBleOCjOOBn+OBqOWIpOaWreOBl+OAgeOBneOBrk5vZGXjgpLliYrpmaTjgZnjgotcbiAgY29uc3QgdGFyZ2V0ID0gcGFyZW50LmNoaWxkTm9kZXNbaW5kZXhdXG4gIGlmICghbmV3Tm9kZSkge1xuICAgIHBhcmVudC5yZW1vdmVDaGlsZCh0YXJnZXQpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyDlt67liIbmpJznn6XjgZfjgIHjg5Hjg4Pjg4Hlh6bnkIbvvIjlpInmm7TnrofmiYDjgaDjgZHlj43mmKDvvInjgpLooYzjgYZcbiAgY29uc3QgY2hhbmdlVHlwZSA9IGhhc0NoYW5nZWQob2xkTm9kZSwgbmV3Tm9kZSlcbiAgc3dpdGNoIChjaGFuZ2VUeXBlKSB7XG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5UeXBlOlxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVGV4dDpcbiAgICBjYXNlIENoYW5nZWRUeXBlLk5vZGU6XG4gICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSksIHRhcmdldClcbiAgICAgIHJldHVyblxuICAgIGNhc2UgQ2hhbmdlZFR5cGUuVmFsdWU6XG4gICAgICB1cGRhdGVWYWx1ZSh0YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCwgKG5ld05vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMudmFsdWUgYXMgc3RyaW5nKVxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBDaGFuZ2VkVHlwZS5BdHRyOlxuICAgICAgdXBkYXRlQXR0cmlidXRlcyh0YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCwgKG9sZE5vZGUgYXMgVk5vZGUpLmF0dHJpYnV0ZXMsIChuZXdOb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzKVxuICAgICAgcmV0dXJuXG4gIH1cblxuICAvLyDlrZDopoHntKDjga7lt67liIbmpJznn6Xjg7vjg6rjgqLjg6tET03lj43mmKDjgpLlho3luLDnmoTjgavlrp/ooYzjgZnjgotcbiAgaWYgKGlzVk5vZGUob2xkTm9kZSkgJiYgaXNWTm9kZShuZXdOb2RlKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3Tm9kZS5jaGlsZHJlbi5sZW5ndGggfHwgaSA8IG9sZE5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnQodGFyZ2V0IGFzIEhUTUxFbGVtZW50LCBvbGROb2RlLmNoaWxkcmVuW2ldLCBuZXdOb2RlLmNoaWxkcmVuW2ldLCBpKVxuICAgIH1cbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBBY3Rpb25UcmVlIH0gZnJvbSAnLi9mcmFtZXdvcmsvYWN0aW9uJ1xuaW1wb3J0IHsgVmlldywgaCB9IGZyb20gJy4vZnJhbWV3b3JrL3ZpZXcnXG5pbXBvcnQgeyBBcHAgfSBmcm9tICcuL2ZyYW1ld29yay9jb250cm9sbGVyJ1xuXG4vKipcbiAqIFN0YXRlOiDnirbmhYvnrqHnkIZcbiAqL1xudHlwZSBUYXNrID0gc3RyaW5nXG50eXBlIEZvcm0gPSB7XG4gIC8qKiDjgr/jgrnjgq/jga7jgr/jgqTjg4jjg6sgKi9cbiAgdGl0bGU6IHN0cmluZ1xuICAvKiog44OQ44Oq44OH44O844K344On44Oz57WQ5p6cICovXG4gIGhhc0Vycm9yOiBib29sZWFuXG59XG50eXBlIFN0YXRlID0ge1xuICAvKiog44K/44K544Kv5LiA6KanICovXG4gIHRhc2tzOiBUYXNrW11cbiAgLyoqIOODleOCqeODvOODoOOBrueKtuaFiyAqL1xuICBmb3JtOiBGb3JtXG59XG5jb25zdCBzdGF0ZTogU3RhdGUgPSB7XG4gIHRhc2tzOiBbJ0xlYXJuIGFib3V0IFZpcnR1YWwgRE9NJywgJ1dyaXRlIGEgZG9jdW1lbnQnXSxcbiAgZm9ybToge1xuICAgIHRpdGxlOiAnJyxcbiAgICBoYXNFcnJvcjogZmFsc2VcbiAgfVxufVxuXG4vKipcbiAqIEFjdGlvbnM6IOWQhOeoruOCpOODmeODs+ODiOWHpueQhlxuICovXG5pbnRlcmZhY2UgQWN0aW9ucyBleHRlbmRzIEFjdGlvblRyZWU8U3RhdGU+IHtcbiAgLyoqIOOCv+OCpOODiOODq+OBruWFpeWKm+ODgeOCp+ODg+OCr+OCkuihjOOBhiAqL1xuICB2YWxpZGF0ZTogKHN0YXRlOiBTdGF0ZSwgdGl0bGU6IHN0cmluZykgPT4gYm9vbGVhblxuICAvKiog5paw44GX44GE44K/44K544Kv44KS5L2c5oiQ44GZ44KLICovXG4gIGNyZWF0ZVRhc2s6IChzdGF0ZTogU3RhdGUsIHRpdGxlOiBzdHJpbmcpID0+IHZvaWRcbiAgLyoqIGluZGV444Gn5oyH5a6a44GX44Gf44K/44K544Kv44KS5YmK6Zmk44GZ44KLICovXG4gIHJlbW92ZVRhc2s6IChzdGF0ZTogU3RhdGUsIGluZGV4OiBudW1iZXIpID0+IHZvaWRcbn1cbmNvbnN0IGFjdGlvbnM6IEFjdGlvbnMgPSB7XG4gIHZhbGlkYXRlKHN0YXRlLCB0aXRsZTogc3RyaW5nKSB7XG4gICAgaWYgKCF0aXRsZSB8fCB0aXRsZS5sZW5ndGggPCAzIHx8IHRpdGxlLmxlbmd0aCA+IDIwKSB7XG4gICAgICBzdGF0ZS5mb3JtLmhhc0Vycm9yID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5mb3JtLmhhc0Vycm9yID0gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gIXN0YXRlLmZvcm0uaGFzRXJyb3JcbiAgfSxcblxuICBjcmVhdGVUYXNrKHN0YXRlLCB0aXRsZSA9ICcnKSB7XG4gICAgc3RhdGUudGFza3MucHVzaCh0aXRsZSlcbiAgICBzdGF0ZS5mb3JtLnRpdGxlID0gJydcbiAgfSxcblxuICByZW1vdmVUYXNrKHN0YXRlLCBpbmRleDogbnVtYmVyKSB7XG4gICAgc3RhdGUudGFza3Muc3BsaWNlKGluZGV4LCAxKVxuICB9XG59XG5cbi8qKlxuICogVmlldzog5o+P55S76Zai6YCjXG4gKi9cbmNvbnN0IHZpZXc6IFZpZXc8U3RhdGUsIEFjdGlvbnM+ID0gKHN0YXRlLCBhY3Rpb25zKSA9PiB7XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICByZXR1cm4gaChcbiAgICAnZGl2JyxcbiAgICB7XG4gICAgICBjbGFzczogJ25lcy1jb250YWluZXIgaXMtcm91bmRlZCcsXG4gICAgICBzdHlsZTogJ3BhZGRpbmc6IDJyZW07J1xuICAgIH0sXG4gICAgaChcbiAgICAgICdoMScsXG4gICAgICB7XG4gICAgICAgIGNsYXNzOiAndGl0bGUnLFxuICAgICAgICBzdHlsZTogJ21hcmdpbi1ib3R0b206IDJyZW07J1xuICAgICAgfSxcbiAgICAgIGgoJ2knLCB7IGNsYXNzOiAnbmVzLWljb24gaGVhcnQgaXMtbWVkaXVtJyB9KSxcbiAgICAgICdWaXJ0dWFsIERPTSBUT0RPIEFwcCAnXG4gICAgKSxcbiAgICBoKFxuICAgICAgJ2Zvcm0nLFxuICAgICAge1xuICAgICAgICBjbGFzczogJ25lcy1jb250YWluZXInLFxuICAgICAgICBzdHlsZTogJ21hcmdpbi1ib3R0b206IDJyZW07J1xuICAgICAgfSxcbiAgICAgIGgoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB7XG4gICAgICAgICAgY2xhc3M6ICduZXMtZmllbGQnLFxuICAgICAgICAgIHN0eWxlOiAnbWFyZ2luLWJvdHRvbTogMXJlbTsnLFxuICAgICAgICB9LFxuICAgICAgICBoKFxuICAgICAgICAgICdsYWJlbCcsXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6ICdsYWJlbCcsXG4gICAgICAgICAgICBmb3I6ICd0YXNrLXRpdGxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ1RpdGxlJ1xuICAgICAgICApLFxuICAgICAgICBoKCdpbnB1dCcsIHtcbiAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgaWQ6ICd0YXNrLXRpdGxlJyxcbiAgICAgICAgICBjbGFzczogJ25lcy1pbnB1dCcsXG4gICAgICAgICAgdmFsdWU6IHN0YXRlLmZvcm0udGl0bGUsXG4gICAgICAgICAgb25pbnB1dDogKGV2OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICAgICAgIHN0YXRlLmZvcm0udGl0bGUgPSB0YXJnZXQudmFsdWVcbiAgICAgICAgICAgIGFjdGlvbnMudmFsaWRhdGUoc3RhdGUsIHRhcmdldC52YWx1ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICAgIGgoXG4gICAgICAgICdwJyxcbiAgICAgICAge1xuICAgICAgICAgIGNsYXNzOiAnbmVzLXRleHQgaXMtZXJyb3InLFxuICAgICAgICAgIHN0eWxlOiBgZGlzcGxheTogJHtzdGF0ZS5mb3JtLmhhc0Vycm9yID8gJ2Rpc3BsYXknIDogJ25vbmUnfWAsXG4gICAgICAgIH0sXG4gICAgICAgICdFbnRlciBhIHZhbHVlIGJldHdlZW4gMyBhbmQgMjAgY2hhcmFjdGVycydcbiAgICAgICksXG4gICAgICBoKFxuICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdidXR0b24nLFxuICAgICAgICAgIGNsYXNzOiAnbmVzLWJ0biBpcy1wcmltYXJ5JyxcbiAgICAgICAgICBvbmNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuZm9ybS5oYXNFcnJvcikgcmV0dXJuXG4gICAgICAgICAgICBhY3Rpb25zLmNyZWF0ZVRhc2soc3RhdGUsIHN0YXRlLmZvcm0udGl0bGUpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnQ3JlYXRlJ1xuICAgICAgKVxuICAgICksXG4gICAgaChcbiAgICAgICd1bCcsXG4gICAgICB7IGNsYXNzOiAnbmVzLWxpc3QgaXMtZGlzYyBuZXMtY29udGFpbmVyJyB9LFxuICAgICAgLi4uc3RhdGUudGFza3MubWFwKCh0YXNrLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiBoKFxuICAgICAgICAgICdsaScsXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6ICdpdGVtJyxcbiAgICAgICAgICAgIHN0eWxlOiAnbWFyZ2luLWJvdHRvbTogMXJlbTsnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0YXNrLFxuICAgICAgICAgIGgoXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ2J1dHRvbicsXG4gICAgICAgICAgICAgIGNsYXNzOiAnbmVzLWJ0biBpcy1lcnJvcicsXG4gICAgICAgICAgICAgIHN0eWxlOiAnbWFyZ2luLWxlZnQ6IDFyZW07JyxcbiAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gYWN0aW9ucy5yZW1vdmVUYXNrKHN0YXRlLCBpKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICfDlydcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgKVxuICApXG59XG5cbm5ldyBBcHA8U3RhdGUsIEFjdGlvbnM+KHtcbiAgZWw6ICcjYXBwJyxcbiAgc3RhdGUsXG4gIHZpZXcsXG4gIGFjdGlvbnNcbn0pXG4iXSwic291cmNlUm9vdCI6IiJ9