(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.jqLite = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var push = Array.prototype.push;
var toString = Object.prototype.toString;
var hasOwn = Object.prototype.hasOwnProperty;
var fnToString = hasOwn.toString;
var ObjectFunctionString = fnToString.call(Object);



var class2type = {};

each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (i, name) {
	class2type["[object " + name + "]"] = name.toLowerCase();
});

function toType(obj) {
	if (obj == null) {
		return obj + "";
	}

	return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
}

function isArrayLike(obj) {

	var length = !!obj && "length" in obj && obj.length,
	    type = toType(obj);

	if (isFunction(obj) || isWindow(obj)) {
		return false;
	}

	return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
}



function isWindow(obj) {
	return obj != null && obj === obj.window;
}



function isFunction(obj) {
	return typeof obj === "function" && typeof obj.nodeType !== "number";
}

function makeArray(arr, results) {
	var ret = results || [];

	if (arr != null) {
		if (isArrayLike(Object(arr))) {
			merge(ret, typeof arr === "string" ? [arr] : arr);
		} else {
			push.call(ret, arr);
		}
	}

	return ret;
}

function merge(first, second) {
	var len = +second.length,
	    j = 0,
	    i = first.length;

	for (; j < len; j++) {
		first[i++] = second[j];
	}

	first.length = i;

	return first;
}

function each(obj, callback) {
	var length = void 0,
	    i = 0;

	if (isArrayLike(obj)) {
		length = obj.length;
		for (; i < length; i++) {
			if (callback.call(obj[i], i, obj[i]) === false) {
				break;
			}
		}
	} else {
		for (i in obj) {
			if (callback.call(obj[i], i, obj[i]) === false) {
				break;
			}
		}
	}

	return obj;
}

var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_ATTRIBUTE = 2;
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_COMMENT = 8;
var NODE_TYPE_DOCUMENT = 9;


function isObject(value) {
	return value !== null && (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object';
}



function isDefined(value) {
	return typeof value !== 'undefined';
}

function isString(value) {
	return typeof value === 'string';
}

function lowercase(string) {
	return isString(string) ? string.toLowerCase() : string;
}

function domReady(fn) {
	function trigger() {
		window.document.removeEventListener('DOMContentLoaded', trigger);
		window.removeEventListener('load', trigger);
		fn();
	}

	// check if document is already loaded
	if (window.document.readyState === 'complete') {
		window.setTimeout(fn);
	} else {
		// We can not use jqLite since we are not done loading and jQuery could be loaded later.

		// Works for modern browsers and IE9
		window.document.addEventListener('DOMContentLoaded', trigger);

		// Fallback to window.onload for others
		window.addEventListener('load', trigger);
	}
}

var SINGLE_TAG_REGEXP = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;
var HTML_REGEXP = /<|&#?\w+;/;
var TAG_NAME_REGEXP = /<([\w:-]+)/;
var XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi;

var wrapMap = {
	'option': [1, '<select multiple="multiple">', '</select>'],

	'thead': [1, '<table>', '</table>'],
	'col': [2, '<table><colgroup>', '</colgroup></table>'],
	'tr': [2, '<table><tbody>', '</tbody></table>'],
	'td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
	'_default': [0, '', '']
};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function jqLiteIsTextNode(html) {
	return !HTML_REGEXP.test(html);
}

function jqLiteBuildFragment(html, context) {
	var tmp = void 0,
	    tag = void 0,
	    wrap = void 0,
	    fragment = context.createDocumentFragment(),
	    nodes = [],
	    i = void 0;

	if (jqLiteIsTextNode(html)) {
		// Convert non-html into a text node
		nodes.push(context.createTextNode(html));
	} else {
		// Convert html into DOM nodes
		tmp = fragment.appendChild(context.createElement('div'));
		tag = (TAG_NAME_REGEXP.exec(html) || ['', ''])[1].toLowerCase();
		wrap = wrapMap[tag] || wrapMap._default;
		tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, '<$1></$2>') + wrap[2];

		// Descend through wrappers to the right content
		i = wrap[0];
		while (i--) {
			tmp = tmp.lastChild;
		}

		nodes = merge(nodes, tmp.childNodes);

		tmp = fragment.firstChild;
		tmp.textContent = '';
	}

	// Remove wrapper from fragment
	fragment.textContent = '';
	fragment.innerHTML = ''; // Clear inner HTML
	each(nodes, function (i, node) {
		fragment.appendChild(node);
	});

	return fragment;
}

function parseHTML(data, context /*, keepScripts*/) {
	if (typeof data !== "string") {
		return [];
	}

	context = context || window.document;
	var parsed = void 0;

	if (parsed = SINGLE_TAG_REGEXP.exec(data)) {
		return [context.createElement(parsed[1])];
	}

	if (parsed = jqLiteBuildFragment(data, context)) {
		return merge([], parsed.childNodes);
	}

	return [];
}

function matches(node, selector) {
	if (node === selector) return true;

	var matches = node.matches || node.matchesSelector || node.msMatchesSelector || node.webkitMatchesSelector || node.mozMatchesSelector;
	if (matches) {
		return matches.call(node, selector);
	}

	return false;
}

function find(selector, context, results, seed) {
	var elem = void 0,
	    nodeType = void 0,
	    i = 0;

	results = results || [];
	context = context || document;

	// Same basic safeguard as Sizzle
	if (!selector || typeof selector !== "string") {
		return results;
	}

	// Early return if context is not an element or document
	if ((nodeType = context.nodeType) !== NODE_TYPE_ELEMENT && nodeType !== NODE_TYPE_DOCUMENT) {
		return [];
	}

	if (seed) {
		while (elem = seed[i++]) {
			if (matches(elem, selector)) {
				results.push(elem);
			}
		}
	} else {
		merge(results, context.querySelectorAll(selector));
	}

	return results;
}

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

var class2type$1 = {};
var toString$1 = class2type$1.toString;

"Boolean Number String Function Array Date RegExp Object Error Symbol Set Map NodeList".split(" ").forEach(function (name) {
	return class2type$1["[object " + name + "]"] = name.toLowerCase();
});

function typeOf(obj) {
	if (obj == null) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type$1[toString$1.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
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

function offsetParent(elem) {
	var doc = elem.ownerDocument,
	    offsetParent = elem && elem.offsetParent;

	while (offsetParent && css(offsetParent, 'position') === 'static') {
		offsetParent = offsetParent.offsetParent;
	}

	return offsetParent || doc.documentElement;
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

var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
var BOOLEAN_ATTR = {};
each('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function (i, value) {
	BOOLEAN_ATTR[lowercase(value)] = value;
});

//////////////////////////////////////////////
function JQLite(selector, context) {
	if (!(this instanceof JQLite)) {
		return new JQLite(selector, context);
	}

	if (selector instanceof JQLite) {
		return selector;
	}

	// HANDLE: $(""), $(null), $(undefined), $(false)
	if (!selector) {
		return this;
	}

	var match = void 0,
	    elem = void 0;

	if (typeof selector === "string") {
		if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {

			// Assume that strings that start and end with <> are HTML and skip the regex check
			match = [null, selector, null];
		} else {
			match = rquickExpr.exec(selector);
		}

		// Match html or make sure no context is specified for #id
		if (match && (match[1] || !context)) {

			// HANDLE: $(html) -> $(array)
			if (match[1]) {
				context = context instanceof JQLite ? context[0] : context;

				// Option to run scripts is true for back-compat
				// Intentionally let the error be thrown if parseHTML is not present
				merge(this, parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));

				return this;

				// HANDLE: $(#id)
			} else {
				elem = document.getElementById(match[2]);

				if (elem) {

					// Inject the element directly into the jQuery object
					this[0] = elem;
					this.length = 1;
				}
				return this;
			}

			// HANDLE: $(expr, $(...))
		} else if (!context) {
			return find(selector, document, new JQLite());

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
		} else {
			return JQLite(context).find(selector);
		}

		// HANDLE: $(DOMElement)
	} else if (selector.nodeType) {
		this[0] = selector;
		this.length = 1;
		return this;

		// HANDLE: $(function)
		// Shortcut for document ready
	} else if (isFunction(selector)) {
		domReady(selector);
	}

	return makeArray(selector, this);
}

var JQLitePrototype = JQLite.fn = JQLite.prototype = {
	ready: domReady,
	toString: function toString$$1() {
		var value = [];
		each(this, function (i, e) {
			value.push('' + e);
		});
		return '[' + value.join(', ') + ']';
	},

	eq: function eq(index) {
		return index >= 0 ? JQLite(this[index]) : JQLite(this[this.length + index]);
	},

	length: 0,
	push: push,
	sort: [].sort,
	splice: [].splice,

	find: function find$$1(selector) {
		var i = void 0,
		    ret = void 0,
		    len = this.length,
		    self = this;

		ret = new JQLite();

		for (i = 0; i < len; i++) {
			find(selector, self[i], ret);
		}

		return ret; //len > 1 ? jQuery.uniqueSort( ret ) : ret;	
	},

	each: function each$$1(callback) {
		return each(this, callback);
	}
};

if (typeof Symbol === "function") {
	var arr = [];
	JQLitePrototype[Symbol.iterator] = arr[Symbol.iterator];
}

function jqLiteWidthOrHeightCreator(type) {
	var funcName = lowercase(type);

	return function (elem, value) {
		if (isWindow(elem)) {
			return elem.document.documentElement["client" + type];
		}

		if (elem.nodeType === NODE_TYPE_DOCUMENT) {
			var doc = elem.documentElement;

			// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
			// whichever is greatest
			return Math.max(elem.body["scroll" + type], doc["scroll" + type], elem.body["offset" + type], doc["offset" + type], doc["client" + type]);
		}

		var exp1 = type === 'Width' ? 'Left' : 'Top';
		var exp2 = type === 'Width' ? 'Right' : 'Bottom';

		//getter
		if (value === undefined) {
			return elem.offsetWidth - parseFloat(css(elem, 'border' + exp1 + type)) - parseFloat(css(elem, 'padding' + exp1)) - parseFloat(css(elem, 'padding' + exp2)) - parseFloat(css(elem, 'border' + exp2 + type));
			//setter		
		} else {
			var isBorderBox = css(elem, "boxSizing") === "border-box";

			var borderOrPadding = parseFloat(css(elem, 'border' + exp1 + type)) + parseFloat(css(elem, 'padding' + exp1)) + parseFloat(css(elem, 'padding' + exp2)) + parseFloat(css(elem, 'border' + exp2 + type));

			css(elem, funcName, !isBorderBox || value === "" ? value : (value || 0) - borderOrPadding);
		}
	};
}

function jqLiteAttr(element, name, value) {
	var ret = void 0;
	var nodeType = element.nodeType;
	if (nodeType === NODE_TYPE_TEXT || nodeType === NODE_TYPE_ATTRIBUTE || nodeType === NODE_TYPE_COMMENT || !element.getAttribute) {
		return;
	}

	var lowercasedName = lowercase(name);
	var isBooleanAttr = BOOLEAN_ATTR[lowercasedName];

	if (isDefined(value)) {
		// setter

		if (value === null || value === false && isBooleanAttr) {
			element.removeAttribute(name);
		} else {
			element.setAttribute(name, isBooleanAttr ? lowercasedName : value);
		}
	} else {
		// getter

		ret = element.getAttribute(name);

		if (isBooleanAttr && ret !== null) {
			ret = lowercasedName;
		}
		// Normalize non-existing attributes to undefined (as jQuery).
		return ret === null ? undefined : ret;
	}
}

function jqLiteProp(element, name, value) {
	if (isDefined(value)) {
		element[name] = value;
	} else {
		return element[name];
	}
}

each({
	width: function width(value) {
		var length = this.length;

		if (!length) return value === undefined ? undefined : this;

		var func = jqLiteWidthOrHeightCreator('Width');

		if (value === undefined) {
			var elem = this[0];
			return func(elem);
		} else {
			for (var i = 0; i < length; i++) {
				func(this[i], value);
			}
		}

		return this;
	},
	height: function height(value) {
		var length = this.length;

		if (!length) return value === undefined ? undefined : this;

		var func = jqLiteWidthOrHeightCreator('Height');

		if (value === undefined) {
			var elem = this[0];
			return func(elem);
		} else {
			for (var i = 0; i < length; i++) {
				func(this[i], value);
			}
		}

		return this;
	},

	outerWidth: function outerWidth() {
		var length = this.length;

		if (!length) return;

		var elem = this[0];

		if (isWindow(elem)) {
			return elem.innerWidth;
		}

		if (elem.nodeType === NODE_TYPE_DOCUMENT) return this.width();

		return elem.offsetWidth;
	},

	outerHeight: function outerHeight() {
		var length = this.length;

		if (!length) return;

		var elem = this[0];

		if (isWindow(elem)) {
			return elem.innerHeight;
		}

		if (elem.nodeType === NODE_TYPE_DOCUMENT) return this.height();

		return elem.offsetHeight;
	},

	offset: function offset$$1(coordinates) {
		if (coordinates) {
			return this.each(function (i, elem) {
				offset(elem, coordinates);
			});
		}

		if (!this.length) return;

		return offset(this[0]);
	},

	position: function position$$1() {
		if (!this.length) return;

		return position(this[0]);
	},

	css: function css$$1(key, value) {
		if (value !== undefined) {
			return this.each(function (i, elem) {
				css(elem, key, value);
			});
		} else if (isObject(key)) {
			for (var k in key) {
				this.css(k, key[k]);
			}
			return this;
		} else if (this.length) {
			return css(this[0], key);
		}
	},

	attr: function attr(key, value) {
		if (value !== undefined) {
			return this.each(function (i, elem) {
				jqLiteAttr(elem, key, value);
			});
		} else if (isObject(key)) {
			for (var k in key) {
				this.attr(k, key[k]);
			}
			return this;
		} else if (this.length) {
			return jqLiteAttr(this[0], key);
		}
	},

	removeAttr: function removeAttr(name) {
		return this.each(function (i, elem) {
			elem.removeAttribute(name);
		});
	},

	prop: function prop(key, value) {
		if (value !== undefined) {
			return this.each(function (i, elem) {
				jqLiteProp(elem, key, value);
			});
		} else if (this.length) {
			return jqLiteProp(this[0], key, value);
		}
	},

	filter: function filter(selector) {
		var elems = new JQLite(),
		    elem = void 0,
		    i = void 0,
		    len = void 0;

		if (isFunction(selector)) {
			for (i = 0, len = this.length; i < len; i++) {
				elem = this[i];
				if (selector.call(elem, i, elem)) {
					elems.push(elem);
				}
			}
		} else if (isString(selector)) {
			for (i = 0, len = this.length, elem; i < len; i++) {
				elem = this[i];
				if (matches(elem, selector)) {
					elems.push(elem);
				}
			}
		}

		return elems;
	},

	closest: function closest$$1(selector) {
		var nodes = [];

		this.each(function (i, elem) {
			var node = closest(elem, selector);
			if (node) nodes.push(node);
		});

		return new JQLite(nodes);
	},

	offsetParent: function offsetParent$$1() {
		if (this.length) return offsetParent(this[0]);
	},

	hasClass: function hasClass$$1(className) {
		for (var i = 0, n = this.length; i < n; i++) {
			if (hasClass(this[i], className)) {
				return true;
			}
		}
		return false;
	},

	addClass: function addClass$$1(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return addClass(elem, name);
			});
		});
	},

	removeClass: function removeClass$$1(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return removeClass(elem, name);
			});
		});
	},

	toggleClass: function toggleClass$$1(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return toggleClass(elem, name);
			});
		});
	}

}, function (name, func) {
	/**
     * Properties: writes return selection, reads return first value
     */
	JQLitePrototype[name] = func;
});

return JQLite;

})));
//# sourceMappingURL=jqlite.js.map
