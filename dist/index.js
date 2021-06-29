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
        this.el =
            typeof params.el === "string"
                ? document.querySelector(params.el)
                : params.el;
        this.view = params.view;
        this.state = params.state;
        this.actions = this.dispatchAction(params.actions);
        this.resolveNode();
    }
    /**
     * ActionにStateを渡し、新しい仮想DOMを作る
     */
    dispatchAction(actions) {
        const dispatched = {};
        for (let key in actions) {
            const action = actions[key];
            dispatched[key] = (state, ...data) => {
                const ret = action(state, ...data);
                this.resolveNode();
                return ret;
            };
        }
        return dispatched;
    }
    /**
     * 仮想DOMを再構築する
     */
    resolveNode() {
        this.newNode = this.view(this.state, this.actions);
        this.scheduleRender();
    }
    /**
     * レンダリングのスケジューリングを行う
     * （連続でActionが実行されたときに、何度もDOMツリーを書き換えないため）
     */
    scheduleRender() {
        if (!this.skipRender) {
            this.skipRender = true;
            setTimeout(this.render.bind(this));
        }
    }
    /**
     * 描画処理
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
 * 仮想DOMを作成する
 */
function h(nodeName, attributes, ...children) {
    return { nodeName, attributes, children };
}
/**
 * リアルDOMを生成する
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
function isVNode(node) {
    return typeof node !== "string" && typeof node !== "number";
}
/**
 * targetに属性を設定する
 */
function setAttributes(target, attrs) {
    for (let attr in attrs) {
        if (isEventAttr(attr)) {
            const eventName = attr.slice(2);
            target.addEventListener(eventName, attrs[attr]);
        }
        else {
            target.setAttribute(attr, attrs[attr]);
        }
    }
}
function isEventAttr(attr) {
    // onから始まる属性名はイベントとして扱う
    return /^on/.test(attr);
}
var ChangedType;
(function (ChangedType) {
    /** 差分なし */
    ChangedType[ChangedType["None"] = 0] = "None";
    /** nodeの型が違う */
    ChangedType[ChangedType["Type"] = 1] = "Type";
    /** テキストノードが違う */
    ChangedType[ChangedType["Text"] = 2] = "Text";
    /** ノード名(タグ名)が違う */
    ChangedType[ChangedType["Node"] = 3] = "Node";
    /** inputのvalueが違う */
    ChangedType[ChangedType["Value"] = 4] = "Value";
    /** 属性が違う */
    ChangedType[ChangedType["Attr"] = 5] = "Attr";
})(ChangedType || (ChangedType = {}));
/**
 * 受け取った2つの仮想DOMの差分を検知する
 */
function hasChanged(a, b) {
    // different type
    if (typeof a !== typeof b) {
        return ChangedType.Type;
    }
    // different string
    if (!isVNode(a) && a !== b) {
        return ChangedType.Text;
    }
    // 簡易的比較()
    if (isVNode(a) && isVNode(b)) {
        if (a.nodeName !== b.nodeName) {
            return ChangedType.Node;
        }
        if (a.attributes.value !== b.attributes.value) {
            return ChangedType.Value;
        }
        if (JSON.stringify(a.attributes) !== JSON.stringify(b.attributes)) {
            return ChangedType.Attr;
        }
    }
    return ChangedType.None;
}
/**
* 仮想DOMの差分を検知し、リアルDOMに反映する
*/
function updateElement(parent, oldNode, newNode, index = 0) {
    // oldNodeがない場合は新しいノード
    if (!oldNode) {
        parent.appendChild(createElement(newNode));
        return;
    }
    const target = parent.childNodes[index];
    // newNodeがない場合はそのノードを削除する
    if (!newNode) {
        parent.removeChild(target);
        return;
    }
    // 両方ある場合は差分検知し、パッチ処理を行う
    const changeType = hasChanged(oldNode, newNode);
    switch (changeType) {
        case ChangedType.Type:
        case ChangedType.Text:
        case ChangedType.Node:
            parent.replaceChild(createElement(newNode), target);
            return;
        case ChangedType.Value:
            // valueの変更時にNodeを置き換えてしまうとフォーカスが外れてしまうため
            updateValue(target, newNode.attributes.value);
            return;
        case ChangedType.Attr:
            // 属性の変更は、Nodeを再作成する必要がないので更新するだけ
            updateAttributes(target, oldNode.attributes, newNode.attributes);
            return;
    }
    //　再帰的にupdateElementを呼び出し、childrenの更新処理を行う
    if (isVNode(oldNode) && isVNode(newNode)) {
        for (let i = 0; i < newNode.children.length || i < oldNode.children.length; i++) {
            updateElement(target, oldNode.children[i], newNode.children[i], i);
        }
    }
}
// NodeをReplaceしてしまうとinputのフォーカスが外れてしまうため
function updateAttributes(target, oldAttrs, newAttrs) {
    // remove attrs
    for (let attr in oldAttrs) {
        if (!isEventAttr(attr)) {
            target.removeAttribute(attr);
        }
    }
    // set attrs
    for (let attr in newAttrs) {
        if (!isEventAttr(attr)) {
            target.setAttribute(attr, newAttrs[attr]);
        }
    }
}
// updateAttributesでやりたかったけど、value属性としては動かないので別途作成
function updateValue(target, newValue) {
    target.value = newValue;
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
const actions = {
    increment: (state) => {
        state.count++;
    }
};
const view = (state, actions) => {
    return (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("div", null, (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("p", null, state.count), (0,_framework_view__WEBPACK_IMPORTED_MODULE_0__.h)("button", { type: "button", onclick: () => actions.increment(state) }, "count up"));
};
new _framework_controller__WEBPACK_IMPORTED_MODULE_1__.App({
    el: "#app",
    state,
    view,
    actions
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tLy4vc3JjL2ZyYW1ld29yay9jb250cm9sbGVyLnRzIiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvZnJhbWV3b3JrL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS12aXJ0dWFsZG9tL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktdmlydHVhbGRvbS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXZpcnR1YWxkb20vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ21FO0FBYTVELE1BQU0sR0FBRztJQVNkLFlBQVksTUFBc0M7UUFDaEQsSUFBSSxDQUFDLEVBQUU7WUFDTCxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssUUFBUTtnQkFDM0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxjQUFjLENBQUMsT0FBMEI7UUFDL0MsTUFBTSxVQUFVLEdBQUcsRUFB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LElBQUk7SUFDSixPQUFPO0NBQ1IsQ0FBQyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gXCIuL2FjdGlvblwiO1xuaW1wb3J0IHsgVmlldywgVk5vZGUsIGNyZWF0ZUVsZW1lbnQsIHVwZGF0ZUVsZW1lbnQgfSBmcm9tIFwiLi92aWV3XCI7XG5cbmludGVyZmFjZSBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz4ge1xuICAvKiog6Kaq44OO44O844OJICovXG4gIGVsOiBIVE1MRWxlbWVudCB8IHN0cmluZztcbiAgLyoqIFZpZXfjga7lrprnvqkgKi9cbiAgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9uVHJlZTxTdGF0ZT4+O1xuICAvKiog54q25oWL566h55CGICovXG4gIHN0YXRlOiBTdGF0ZTtcbiAgLyoqIEFjdGlvbuOBruWumue+qSAqL1xuICBhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPjtcbn1cblxuZXhwb3J0IGNsYXNzIEFwcDxTdGF0ZSwgQWN0aW9ucz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGVsOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSByZWFkb25seSB2aWV3OiBWaWV3PFN0YXRlLCBBY3Rpb25UcmVlPFN0YXRlPj47XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU6IFN0YXRlO1xuICBwcml2YXRlIHJlYWRvbmx5IGFjdGlvbnM6IEFjdGlvblRyZWU8U3RhdGU+O1xuICBwcml2YXRlIG9sZE5vZGU6IFZOb2RlO1xuICBwcml2YXRlIG5ld05vZGU6IFZOb2RlO1xuICBwcml2YXRlIHNraXBSZW5kZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiBBcHBDb25zdHJ1Y3RvcjxTdGF0ZSwgQWN0aW9ucz4pIHtcbiAgICB0aGlzLmVsID1cbiAgICAgIHR5cGVvZiBwYXJhbXMuZWwgPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmFtcy5lbClcbiAgICAgICAgOiBwYXJhbXMuZWw7XG5cbiAgICB0aGlzLnZpZXcgPSBwYXJhbXMudmlldztcbiAgICB0aGlzLnN0YXRlID0gcGFyYW1zLnN0YXRlO1xuICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuZGlzcGF0Y2hBY3Rpb24ocGFyYW1zLmFjdGlvbnMpO1xuICAgIHRoaXMucmVzb2x2ZU5vZGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3Rpb27jgatTdGF0ZeOCkua4oeOBl+OAgeaWsOOBl+OBhOS7ruaDs0RPTeOCkuS9nOOCi1xuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaEFjdGlvbihhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPikge1xuICAgIGNvbnN0IGRpc3BhdGNoZWQgPSB7fSBhcyBBY3Rpb25UcmVlPFN0YXRlPjtcbiAgICBmb3IgKGxldCBrZXkgaW4gYWN0aW9ucykge1xuICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1trZXldO1xuICAgICAgZGlzcGF0Y2hlZFtrZXldID0gKHN0YXRlOiBTdGF0ZSwgLi4uZGF0YTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHJldCA9IGFjdGlvbihzdGF0ZSwgLi4uZGF0YSk7XG4gICAgICAgIHRoaXMucmVzb2x2ZU5vZGUoKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBkaXNwYXRjaGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIOS7ruaDs0RPTeOCkuWGjeani+evieOBmeOCi1xuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlTm9kZSgpIHtcbiAgICB0aGlzLm5ld05vZGUgPSB0aGlzLnZpZXcodGhpcy5zdGF0ZSwgdGhpcy5hY3Rpb25zKTtcbiAgICB0aGlzLnNjaGVkdWxlUmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICog44Os44Oz44OA44Oq44Oz44Kw44Gu44K544Kx44K444Ol44O844Oq44Oz44Kw44KS6KGM44GGXG4gICAqIO+8iOmAo+e2muOBp0FjdGlvbuOBjOWun+ihjOOBleOCjOOBn+OBqOOBjeOBq+OAgeS9leW6puOCgkRPTeODhOODquODvOOCkuabuOOBjeaPm+OBiOOBquOBhOOBn+OCge+8iVxuICAgKi9cbiAgcHJpdmF0ZSBzY2hlZHVsZVJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMuc2tpcFJlbmRlcikge1xuICAgICAgdGhpcy5za2lwUmVuZGVyID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOaPj+eUu+WHpueQhlxuICAgKi9cbiAgcHJpdmF0ZSByZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMub2xkTm9kZSkge1xuICAgICAgdXBkYXRlRWxlbWVudCh0aGlzLmVsLCB0aGlzLm9sZE5vZGUsIHRoaXMubmV3Tm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudCh0aGlzLm5ld05vZGUpKTtcbiAgICB9XG5cbiAgICB0aGlzLm9sZE5vZGUgPSB0aGlzLm5ld05vZGU7XG4gICAgdGhpcy5za2lwUmVuZGVyID0gZmFsc2U7XG4gIH1cbn0iLCJ0eXBlIE5vZGVUeXBlID0gVk5vZGUgfCBzdHJpbmcgfCBudW1iZXI7XG50eXBlIEF0dHJpYnV0ZXMgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IEZ1bmN0aW9uIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlldzxTdGF0ZSwgQWN0aW9ucz4ge1xuICAoc3RhdGU6IFN0YXRlLCBhY3Rpb25zOiBBY3Rpb25zKTogVk5vZGU7XG59XG5cbi8qKlxuICog5Luu5oOzRE9NXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVk5vZGUge1xuICBub2RlTmFtZToga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xuICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVzO1xuICBjaGlsZHJlbjogTm9kZVR5cGVbXTtcbn1cblxuLyoqXG4gKiDku67mg7NET03jgpLkvZzmiJDjgZnjgotcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGgoXG4gIG5vZGVOYW1lOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gIGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZXMsXG4gIC4uLmNoaWxkcmVuOiBOb2RlVHlwZVtdXG4pOiBWTm9kZSB7XG4gIHJldHVybiB7IG5vZGVOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbiB9O1xufVxuXG4vKipcbiAqIOODquOCouODq0RPTeOCkueUn+aIkOOBmeOCi1xuICovXG4gZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZTogTm9kZVR5cGUpOiBIVE1MRWxlbWVudCB8IFRleHQge1xuICAgIGlmICghaXNWTm9kZShub2RlKSkge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUudG9TdHJpbmcoKSk7XG4gICAgfVxuICBcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZS5ub2RlTmFtZSk7XG4gICAgc2V0QXR0cmlidXRlcyhlbCwgbm9kZS5hdHRyaWJ1dGVzKTtcbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gZWwuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudChjaGlsZCkpKTtcbiAgXG4gICAgcmV0dXJuIGVsO1xuICB9XG4gIFxuICBmdW5jdGlvbiBpc1ZOb2RlKG5vZGU6IE5vZGVUeXBlKTogbm9kZSBpcyBWTm9kZSB7XG4gICAgcmV0dXJuIHR5cGVvZiBub2RlICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiBub2RlICE9PSBcIm51bWJlclwiO1xuICB9XG4gIFxuICAvKipcbiAgICogdGFyZ2V044Gr5bGe5oCn44KS6Kit5a6a44GZ44KLXG4gICAqL1xuICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKHRhcmdldDogSFRNTEVsZW1lbnQsIGF0dHJzOiBBdHRyaWJ1dGVzKTogdm9pZCB7XG4gICAgZm9yIChsZXQgYXR0ciBpbiBhdHRycykge1xuICAgICAgaWYgKGlzRXZlbnRBdHRyKGF0dHIpKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGF0dHIuc2xpY2UoMik7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgYXR0cnNbYXR0cl0gYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJzW2F0dHJdIGFzIHN0cmluZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBpc0V2ZW50QXR0cihhdHRyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBvbuOBi+OCieWni+OBvuOCi+WxnuaAp+WQjeOBr+OCpOODmeODs+ODiOOBqOOBl+OBpuaJseOBhlxuICAgIHJldHVybiAvXm9uLy50ZXN0KGF0dHIpO1xuICB9XG5cbiAgZW51bSBDaGFuZ2VkVHlwZSB7XG4gICAgLyoqIOW3ruWIhuOBquOBlyAqL1xuICAgIE5vbmUsXG4gICAgLyoqIG5vZGXjga7lnovjgYzpgZXjgYYgKi9cbiAgICBUeXBlLFxuICAgIC8qKiDjg4bjgq3jgrnjg4jjg47jg7zjg4njgYzpgZXjgYYgKi9cbiAgICBUZXh0LFxuICAgIC8qKiDjg47jg7zjg4nlkI0o44K/44Kw5ZCNKeOBjOmBleOBhiAqL1xuICAgIE5vZGUsXG4gICAgLyoqIGlucHV044GudmFsdWXjgYzpgZXjgYYgKi9cbiAgICBWYWx1ZSxcbiAgICAvKiog5bGe5oCn44GM6YGV44GGICovXG4gICAgQXR0clxuICB9XG4gIFxuICAvKipcbiAgICog5Y+X44GR5Y+W44Gj44GfMuOBpOOBruS7ruaDs0RPTeOBruW3ruWIhuOCkuaknOefpeOBmeOCi1xuICAgKi9cbiAgZnVuY3Rpb24gaGFzQ2hhbmdlZChhOiBOb2RlVHlwZSwgYjogTm9kZVR5cGUpOiBDaGFuZ2VkVHlwZSB7XG4gICAgLy8gZGlmZmVyZW50IHR5cGVcbiAgICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XG4gICAgICByZXR1cm4gQ2hhbmdlZFR5cGUuVHlwZTtcbiAgICB9XG4gIFxuICAgIC8vIGRpZmZlcmVudCBzdHJpbmdcbiAgICBpZiAoIWlzVk5vZGUoYSkgJiYgYSAhPT0gYikge1xuICAgICAgcmV0dXJuIENoYW5nZWRUeXBlLlRleHQ7XG4gICAgfVxuICBcbiAgICAvLyDnsKHmmJPnmoTmr5TovIMoKVxuICAgIGlmIChpc1ZOb2RlKGEpICYmIGlzVk5vZGUoYikpIHtcbiAgICAgIGlmIChhLm5vZGVOYW1lICE9PSBiLm5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5Ob2RlO1xuICAgICAgfVxuICAgICAgaWYgKGEuYXR0cmlidXRlcy52YWx1ZSAhPT0gYi5hdHRyaWJ1dGVzLnZhbHVlKSB7XG4gICAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChKU09OLnN0cmluZ2lmeShhLmF0dHJpYnV0ZXMpICE9PSBKU09OLnN0cmluZ2lmeShiLmF0dHJpYnV0ZXMpKSB7XG4gICAgICAgIHJldHVybiBDaGFuZ2VkVHlwZS5BdHRyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gQ2hhbmdlZFR5cGUuTm9uZTtcbiAgfVxuICBcbiAgLyoqXG4gKiDku67mg7NET03jga7lt67liIbjgpLmpJznn6XjgZfjgIHjg6rjgqLjg6tET03jgavlj43mmKDjgZnjgotcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQoXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBvbGROb2RlOiBOb2RlVHlwZSxcbiAgICBuZXdOb2RlOiBOb2RlVHlwZSxcbiAgICBpbmRleCA9IDBcbiAgKTogdm9pZCB7XG4gICAgLy8gb2xkTm9kZeOBjOOBquOBhOWgtOWQiOOBr+aWsOOBl+OBhOODjuODvOODiVxuICAgIGlmICghb2xkTm9kZSkge1xuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgXG4gICAgY29uc3QgdGFyZ2V0ID0gcGFyZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xuICBcbiAgICAvLyBuZXdOb2Rl44GM44Gq44GE5aC05ZCI44Gv44Gd44Gu44OO44O844OJ44KS5YmK6Zmk44GZ44KLXG4gICAgaWYgKCFuZXdOb2RlKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIFxuICAgIC8vIOS4oeaWueOBguOCi+WgtOWQiOOBr+W3ruWIhuaknOefpeOBl+OAgeODkeODg+ODgeWHpueQhuOCkuihjOOBhlxuICAgIGNvbnN0IGNoYW5nZVR5cGUgPSBoYXNDaGFuZ2VkKG9sZE5vZGUsIG5ld05vZGUpO1xuICAgIHN3aXRjaCAoY2hhbmdlVHlwZSkge1xuICAgICAgY2FzZSBDaGFuZ2VkVHlwZS5UeXBlOlxuICAgICAgY2FzZSBDaGFuZ2VkVHlwZS5UZXh0OlxuICAgICAgY2FzZSBDaGFuZ2VkVHlwZS5Ob2RlOlxuICAgICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGNyZWF0ZUVsZW1lbnQobmV3Tm9kZSksIHRhcmdldCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgQ2hhbmdlZFR5cGUuVmFsdWU6XG4gICAgICAgIC8vIHZhbHVl44Gu5aSJ5pu05pmC44GrTm9kZeOCkue9ruOBjeaPm+OBiOOBpuOBl+OBvuOBhuOBqOODleOCqeODvOOCq+OCueOBjOWkluOCjOOBpuOBl+OBvuOBhuOBn+OCgVxuICAgICAgICB1cGRhdGVWYWx1ZShcbiAgICAgICAgICB0YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCxcbiAgICAgICAgICAobmV3Tm9kZSBhcyBWTm9kZSkuYXR0cmlidXRlcy52YWx1ZSBhcyBzdHJpbmdcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSBDaGFuZ2VkVHlwZS5BdHRyOlxuICAgICAgICAvLyDlsZ7mgKfjga7lpInmm7Tjga/jgIFOb2Rl44KS5YaN5L2c5oiQ44GZ44KL5b+F6KaB44GM44Gq44GE44Gu44Gn5pu05paw44GZ44KL44Gg44GRXG4gICAgICAgIHVwZGF0ZUF0dHJpYnV0ZXMoXG4gICAgICAgICAgdGFyZ2V0IGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIChvbGROb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzLFxuICAgICAgICAgIChuZXdOb2RlIGFzIFZOb2RlKS5hdHRyaWJ1dGVzXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gIFxuICAgIC8v44CA5YaN5biw55qE44GrdXBkYXRlRWxlbWVudOOCkuWRvOOBs+WHuuOBl+OAgWNoaWxkcmVu44Gu5pu05paw5Yem55CG44KS6KGM44GGXG4gICAgaWYgKGlzVk5vZGUob2xkTm9kZSkgJiYgaXNWTm9kZShuZXdOb2RlKSkge1xuICAgICAgZm9yIChcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBpIDwgbmV3Tm9kZS5jaGlsZHJlbi5sZW5ndGggfHwgaSA8IG9sZE5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICBpKytcbiAgICAgICkge1xuICAgICAgICB1cGRhdGVFbGVtZW50KFxuICAgICAgICAgIHRhcmdldCBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICBvbGROb2RlLmNoaWxkcmVuW2ldLFxuICAgICAgICAgIG5ld05vZGUuY2hpbGRyZW5baV0sXG4gICAgICAgICAgaVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgLy8gTm9kZeOCklJlcGxhY2XjgZfjgabjgZfjgb7jgYbjgahpbnB1dOOBruODleOCqeODvOOCq+OCueOBjOWkluOCjOOBpuOBl+OBvuOBhuOBn+OCgVxuICBmdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGVzKFxuICAgIHRhcmdldDogSFRNTEVsZW1lbnQsXG4gICAgb2xkQXR0cnM6IEF0dHJpYnV0ZXMsXG4gICAgbmV3QXR0cnM6IEF0dHJpYnV0ZXNcbiAgKTogdm9pZCB7XG4gICAgLy8gcmVtb3ZlIGF0dHJzXG4gICAgZm9yIChsZXQgYXR0ciBpbiBvbGRBdHRycykge1xuICAgICAgaWYgKCFpc0V2ZW50QXR0cihhdHRyKSkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBzZXQgYXR0cnNcbiAgICBmb3IgKGxldCBhdHRyIGluIG5ld0F0dHJzKSB7XG4gICAgICBpZiAoIWlzRXZlbnRBdHRyKGF0dHIpKSB7XG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoYXR0ciwgbmV3QXR0cnNbYXR0cl0gYXMgc3RyaW5nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIC8vIHVwZGF0ZUF0dHJpYnV0ZXPjgafjgoTjgorjgZ/jgYvjgaPjgZ/jgZHjganjgIF2YWx1ZeWxnuaAp+OBqOOBl+OBpuOBr+WLleOBi+OBquOBhOOBruOBp+WIpemAlOS9nOaIkFxuICBmdW5jdGlvbiB1cGRhdGVWYWx1ZSh0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0YXJnZXQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuICAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFZpZXcsIGggfSBmcm9tIFwiLi9mcmFtZXdvcmsvdmlld1wiO1xuaW1wb3J0IHsgQWN0aW9uVHJlZSB9IGZyb20gXCIuL2ZyYW1ld29yay9hY3Rpb25cIjtcbmltcG9ydCB7IEFwcCB9IGZyb20gXCIuL2ZyYW1ld29yay9jb250cm9sbGVyXCI7XG5cbnR5cGUgU3RhdGUgPSB0eXBlb2Ygc3RhdGU7XG50eXBlIEFjdGlvbnMgPSB0eXBlb2YgYWN0aW9ucztcblxuY29uc3Qgc3RhdGUgPSB7XG4gIGNvdW50OiAwXG59O1xuXG5jb25zdCBhY3Rpb25zOiBBY3Rpb25UcmVlPFN0YXRlPiA9IHtcbiAgaW5jcmVtZW50OiAoc3RhdGU6IFN0YXRlKSA9PiB7XG4gICAgc3RhdGUuY291bnQrKztcbiAgfVxufTtcblxuY29uc3QgdmlldzogVmlldzxTdGF0ZSwgQWN0aW9ucz4gPSAoc3RhdGUsIGFjdGlvbnMpID0+IHtcbiAgcmV0dXJuIGgoXG4gICAgXCJkaXZcIixcbiAgICBudWxsLFxuICAgIGgoXCJwXCIsIG51bGwsIHN0YXRlLmNvdW50KSxcbiAgICBoKFxuICAgICAgXCJidXR0b25cIixcbiAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgb25jbGljazogKCkgPT4gYWN0aW9ucy5pbmNyZW1lbnQoc3RhdGUpIH0sXG4gICAgICBcImNvdW50IHVwXCJcbiAgICApXG4gICk7XG59O1xuXG5uZXcgQXBwPFN0YXRlLCBBY3Rpb25zPih7XG4gIGVsOiBcIiNhcHBcIixcbiAgc3RhdGUsXG4gIHZpZXcsXG4gIGFjdGlvbnNcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=