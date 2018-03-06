(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.NDU = {})));
}(this, (function (exports) { 'use strict';

function contains(parent, child) {
	if (parent.contains) {
		return parent.contains(child);
	} else if (parent.compareDocumentPosition) {
		return parent === child || !!(parent.compareDocumentPosition(child) & 16);
	} else {
		if (child) do {
			if (child === parent) return true;
		} while (child = child.parentNode);
		return false;
	}
}

var rmsPrefix = /^-ms-/;
var rdashAlpha = /-([a-z])/g;
var fcamelCase = function fcamelCase(all, letter) {
	return letter.toUpperCase();
};

function camelCase(string) {
	return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var class2type = {};
var toString = class2type.toString;

"Boolean Number String Function Array Date RegExp Object Error Symbol Set Map NodeList".split(" ").forEach(function (name) {
	return class2type["[object " + name + "]"] = name.toLowerCase();
});

function typeOf(obj) {
	if (obj == null) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
}

var div = document.createElement("div");
// Finish early in limited (non-browser) environments
var clearCloneStyle = true;
if (!div.style) {
	div.style.backgroundClip = "content-box";
	div.cloneNode(true).style.backgroundClip = "";
	clearCloneStyle = div.style.backgroundClip === "content-box";
}

var cssNumber = {
	"animationIterationCount": true,
	"columnCount": true,
	"fillOpacity": true,
	"flexGrow": true,
	"flexShrink": true,
	"fontWeight": true,
	"lineHeight": true,
	"opacity": true,
	"order": true,
	"orphans": true,
	"widows": true,
	"zIndex": true,
	"zoom": true
};

function css(elem, name, value) {
	if (Array.isArray(name)) {
		var i = 0,
		    map = {},
		    len = name.length;

		for (; i < len; i++) {
			map[name[i]] = css(elem, name[i]);
		}

		return map;
	}

	if (typeOf(name) === 'object') {

		for (var _i in name) {
			css(elem, _i, name[_i]);
		}

		return;
	}

	var type = void 0;

	name = camelCase(name);

	if (arguments.length < 3) {
		var computed = getComputedStyle(elem, null);
		var ret = computed.getPropertyValue(name) || computed[name];

		if (ret === "" && !contains(elem.ownerDocument, elem)) {
			ret = elem.style[name];
		}

		return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" : ret;
	}

	if (value !== undefined) {
		type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
		// Make sure that null and NaN values aren't set (#7116)
		if (value == null || value !== value) {
			return;
		}

		// If a number was passed in, add the unit (except for certain CSS properties)
		if (type === "number") {
			value += cssNumber[name] ? "" : "px";
		}

		// background-* props affect original clone's values
		if (!clearCloneStyle && value === "" && name.indexOf("background") === 0) {
			elem.style[name] = "inherit";
		}

		elem.style[name] = value;
	}
}

function offsetParent(elem) {
	var doc = elem.ownerDocument,
	    offsetParent = elem && elem.offsetParent;

	while (offsetParent && css(offsetParent, 'position') === 'static') {
		offsetParent = offsetParent.offsetParent;
	}

	return offsetParent || doc.documentElement;
}

function matches(node, selector) {
	if (node === selector) return true;

	var matches = node.matches || node.matchesSelector || node.msMatchesSelector || node.webkitMatchesSelector || node.mozMatchesSelector;
	if (matches) {
		return matches.call(node, selector);
	}

	return false;
}

function _closest(el, s) {
	do {
		if (matches(el, s)) return el;
		el = el.parentElement;
	} while (el !== null);
	return null;
}

function closest(node, selector) {
	if (node.closest && typeof selector === 'string') {
		return node.closest(selector);
	} else {
		return _closest(node, selector);
	}
}

var on = function () {
		if (document.addEventListener) return function (node, eventName, handler, capture) {
				return node.addEventListener(eventName, handler, capture || false);
		};else if (document.attachEvent) return function (node, eventName, handler) {
				return node.attachEvent('on' + eventName, function (e) {
						e = e || window.event;
						e.target = e.target || e.srcElement;
						e.currentTarget = node;
						handler.call(node, e);
				});
		};
}();

var off = function () {
		if (document.addEventListener) return function (node, eventName, handler, capture) {
				return node.removeEventListener(eventName, handler, capture || false);
		};else if (document.attachEvent) return function (node, eventName, handler) {
				return node.detachEvent('on' + eventName, handler);
		};
}();

// Zepto.js
// (c) 2010-2015 Thomas Fuchs
// Zepto.js may be freely distributed under the MIT license.
var simpleSelectorRE = /^[\w-]*$/;
//[].slice.call(arraylike) -> ↓
var toArray$1 = Function.prototype.bind.call(Function.prototype.call, [].slice); //toArray = [].slice.call.bind([].slice)

function qsa(element, selector) {
  var maybeID = selector[0] === '#',
      maybeClass = selector[0] === '.',
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
      isSimple = simpleSelectorRE.test(nameOnly),
      found;

  if (isSimple) {
    if (maybeID) {
      element = element.getElementById ? element : document;
      return (found = element.getElementById(nameOnly)) ? [found] : [];
    }

    if (element.getElementsByClassName && maybeClass) return toArray$1(element.getElementsByClassName(nameOnly));

    return toArray$1(element.getElementsByTagName(selector));
  }

  return toArray$1(element.querySelectorAll(selector));
}

function filterEvents(selector, handler) {
	return function filterHandler(e) {
		var top = e.currentTarget,
		    target = e.target,
		    type = typeOf(selector),
		    matches = type === 'string' ? qsa(top, selector) : type === 'array' || type === 'nodelist' ? [].slice.call(selector) : [selector];
		var length = matches.length;
		while (length && length--) {
			var match = matches[length];
			if (contains(match, target)) {
				handler.call(match, e);
			}
		}
	};
}

var listen = function listen(node, eventName, handler, capture) {
  on(node, eventName, handler, capture);
  return function () {
    off(node, eventName, handler, capture);
  };
};

var index = { on: on, off: off, filter: filterEvents, listen: listen };

function getOffset(elem) {
	var rect = void 0,
	    win = void 0;
	// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
	// Support: IE <=11 only
	// Running getBoundingClientRect on a
	// disconnected node in IE throws an error
	if (!elem.getClientRects().length) {
		return { top: 0, left: 0 };
	}

	// Get document-relative position by adding viewport scroll to viewport-relative gBCR
	rect = elem.getBoundingClientRect();
	win = elem.ownerDocument.defaultView;
	return {
		top: rect.top + win.pageYOffset,
		left: rect.left + win.pageXOffset
	};
}

function position(elem) {
	var offsetParent,
	    offset,
	    doc,
	    parentOffset = { top: 0, left: 0 };

	// position:fixed elements are offset from the viewport, which itself always has zero offset
	if (css(elem, "position") === "fixed") {

		// Assume position:fixed implies availability of getBoundingClientRect
		offset = elem.getBoundingClientRect();
	} else {
		offset = getOffset(elem);

		// Account for the *real* offset parent, which can be the document or its root element
		// when a statically positioned element is identified
		doc = elem.ownerDocument;
		offsetParent = elem.offsetParent || doc.documentElement;
		while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && css(offsetParent, "position") === "static") {

			offsetParent = offsetParent.parentNode;
		}

		if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {

			// Incorporate borders into its offset, since they are outside its content origin
			parentOffset = getOffset(offsetParent);
			parentOffset.top += parseFloat(css(offsetParent, "borderTopWidth")) || 0;
			parentOffset.left += parseFloat(css(offsetParent, "borderLeftWidth")) || 0;
		}
	}

	// Subtract parent offsets and element margins
	return {
		top: offset.top - parentOffset.top - (parseFloat(css(elem, "marginTop")) || 0),
		left: offset.left - parentOffset.left - (parseFloat(css(elem, "marginLeft")) || 0)
	};
}

function setOffset(elem, options) {
	var curPosition = void 0,
	    curLeft = void 0,
	    curCSSTop = void 0,
	    curTop = void 0,
	    curOffset = void 0,
	    curCSSLeft = void 0,
	    calculatePosition = void 0,
	    positionState = css(elem, "position"),
	    curElem = elem,
	    props = {};

	// Set position first, in-case top/left are set even on static elem
	if (positionState === "static") {
		elem.style.position = "relative";
	}

	curOffset = getOffset(curElem);
	curCSSTop = css(elem, "top");
	curCSSLeft = css(elem, "left");
	calculatePosition = (positionState === "absolute" || positionState === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;

	// Need to be able to calculate position if either
	// top or left is auto and position is either absolute or fixed
	if (calculatePosition) {
		curPosition = position(curElem);
		curTop = curPosition.top;
		curLeft = curPosition.left;
	} else {
		curTop = parseFloat(curCSSTop) || 0;
		curLeft = parseFloat(curCSSLeft) || 0;
	}

	if (options.top != null) {
		props.top = options.top - curOffset.top + curTop;
	}
	if (options.left != null) {
		props.left = options.left - curOffset.left + curLeft;
	}

	if ("using" in options) {
		options.using.call(elem, props);
	} else {
		css(curElem, props);
	}
}

function offset(elem, options) {
	if (arguments.length < 2) {
		return getOffset(elem);
	} else {
		setOffset(elem, options);
	}
}

function hasClass(element, className) {
	if (element.classList) return !!className && element.classList.contains(className);else return (' ' + (element.className.baseVal || element.className) + ' ').indexOf(' ' + className + ' ') !== -1;
}

function addClass(element, className) {
	if (element.classList) element.classList.add(className);else if (!hasClass(element, className)) if (typeof element.className === 'string') element.className = element.className + ' ' + className;else element.setAttribute('class', (element.className && element.className.baseVal || '') + ' ' + className);
}

function replaceClassName(origClass, classToRemove) {
	return origClass.replace(new RegExp('(^|\\s)' + classToRemove + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
}

function removeClass(element, className) {
	if (element.classList) element.classList.remove(className);else if (typeof element.className === 'string') element.className = replaceClassName(element.className, className);else element.setAttribute('class', replaceClassName(element.className && element.className.baseVal || '', className));
}

function toggleClass(element, className) {
	if (hasClass(element, className)) removeClass(element, className);else addClass(element, className);
}

exports.events = index;
exports.position = position;
exports.offsetParent = offsetParent;
exports.matches = matches;
exports.css = css;
exports.contains = contains;
exports.closest = closest;
exports.offset = offset;
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=nex-dom-utils.js.map
