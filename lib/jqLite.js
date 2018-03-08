'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = JQLite;

var _utils = require('./selector/utils');

var _domReady = require('./selector/domReady');

var _domReady2 = _interopRequireDefault(_domReady);

var _parseHTML = require('./selector/parseHTML');

var _parseHTML2 = _interopRequireDefault(_parseHTML);

var _find2 = require('./selector/find');

var _find3 = _interopRequireDefault(_find2);

var _offset2 = require('./offset');

var _offset3 = _interopRequireDefault(_offset2);

var _position2 = require('./position');

var _position3 = _interopRequireDefault(_position2);

var _offsetParent2 = require('./offsetParent');

var _offsetParent3 = _interopRequireDefault(_offsetParent2);

var _matches = require('./matches');

var _matches2 = _interopRequireDefault(_matches);

var _classes = require('./classes');

var _closest2 = require('./closest');

var _closest3 = _interopRequireDefault(_closest2);

var _css2 = require('./css');

var _css3 = _interopRequireDefault(_css2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
var BOOLEAN_ATTR = {};
(0, _utils.each)('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function (i, value) {
	BOOLEAN_ATTR[(0, _utils.lowercase)(value)] = value;
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
				(0, _utils.merge)(this, (0, _parseHTML2.default)(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));

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
			return (0, _find3.default)(selector, document, new JQLite());

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
	} else if ((0, _utils.isFunction)(selector)) {
		(0, _domReady2.default)(selector);
	}

	return (0, _utils.makeArray)(selector, this);
}

var JQLitePrototype = JQLite.fn = JQLite.prototype = {
	ready: _domReady2.default,
	toString: function toString() {
		var value = [];
		(0, _utils.each)(this, function (i, e) {
			value.push('' + e);
		});
		return '[' + value.join(', ') + ']';
	},

	eq: function eq(index) {
		return index >= 0 ? JQLite(this[index]) : JQLite(this[this.length + index]);
	},

	length: 0,
	push: _utils.push,
	sort: [].sort,
	splice: [].splice,

	extend: _utils.extend,

	find: function find(selector) {
		var i = void 0,
		    ret = void 0,
		    len = this.length,
		    self = this;

		ret = new JQLite();

		for (i = 0; i < len; i++) {
			(0, _find3.default)(selector, self[i], ret);
		}

		return ret; //len > 1 ? jQuery.uniqueSort( ret ) : ret;	
	},

	each: function each(callback) {
		return (0, _utils.each)(this, callback);
	}
};

if (typeof Symbol === "function") {
	var arr = [];
	JQLitePrototype[Symbol.iterator] = arr[Symbol.iterator];
}

function jqLiteWidthOrHeightCreator(type) {
	var funcName = (0, _utils.lowercase)(type);

	return function (elem, value) {
		if ((0, _utils.isWindow)(elem)) {
			return elem.document.documentElement["client" + type];
		}

		if (elem.nodeType === _utils.NODE_TYPE_DOCUMENT) {
			var doc = elem.documentElement;

			// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
			// whichever is greatest
			return Math.max(elem.body["scroll" + type], doc["scroll" + type], elem.body["offset" + type], doc["offset" + type], doc["client" + type]);
		}

		var exp1 = type === 'Width' ? 'Left' : 'Top';
		var exp2 = type === 'Width' ? 'Right' : 'Bottom';

		//getter
		if (value === undefined) {
			return elem.offsetWidth - parseFloat((0, _css3.default)(elem, 'border' + exp1 + type)) - parseFloat((0, _css3.default)(elem, 'padding' + exp1)) - parseFloat((0, _css3.default)(elem, 'padding' + exp2)) - parseFloat((0, _css3.default)(elem, 'border' + exp2 + type));
			//setter		
		} else {
			var isBorderBox = (0, _css3.default)(elem, "boxSizing") === "border-box";

			var borderOrPadding = parseFloat((0, _css3.default)(elem, 'border' + exp1 + type)) + parseFloat((0, _css3.default)(elem, 'padding' + exp1)) + parseFloat((0, _css3.default)(elem, 'padding' + exp2)) + parseFloat((0, _css3.default)(elem, 'border' + exp2 + type));

			(0, _css3.default)(elem, funcName, !isBorderBox || value === "" ? value : (value || 0) - borderOrPadding);
		}
	};
}

function jqLiteAttr(element, name, value) {
	var ret = void 0;
	var nodeType = element.nodeType;
	if (nodeType === _utils.NODE_TYPE_TEXT || nodeType === _utils.NODE_TYPE_ATTRIBUTE || nodeType === _utils.NODE_TYPE_COMMENT || !element.getAttribute) {
		return;
	}

	var lowercasedName = (0, _utils.lowercase)(name);
	var isBooleanAttr = BOOLEAN_ATTR[lowercasedName];

	if ((0, _utils.isDefined)(value)) {
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
	if ((0, _utils.isDefined)(value)) {
		element[name] = value;
	} else {
		return element[name];
	}
}

////////////Methods////////////////
(0, _utils.each)({

	append: function append(node) {
		node = new JQLite(node);
		return this.each(function (i, elem) {
			var nodeType = elem.nodeType;
			if (nodeType !== _utils.NODE_TYPE_ELEMENT && nodeType !== _utils.NODE_TYPE_DOCUMENT_FRAGMENT) return;

			for (var _i = 0, ii = node.length; _i < ii; _i++) {
				var child = node[_i];
				elem.appendChild(child);
			}
		});
	},

	prepend: function prepend(node) {
		node = new JQLite(node);
		return this.each(function (i, elem) {
			if (elem.nodeType === _utils.NODE_TYPE_ELEMENT) {
				var index = elem.firstChild;
				(0, _utils.each)(node, function (i, child) {
					elem.insertBefore(child, index);
				});
			}
		});
	},

	remove: function remove() {
		return this.each(function (elem) {
			var parent = elem.parentNode;
			if (parent) parent.removeChild(elem);
		});
	},

	children: function children() {
		var children = [];

		this.each(function (i, elem) {
			(0, _utils.each)(elem.childNodes, function (ii, element) {
				if (element.nodeType === _utils.NODE_TYPE_ELEMENT) {
					children.push(element);
				}
			});
		});

		return children;
	},

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

		if ((0, _utils.isWindow)(elem)) {
			return elem.innerWidth;
		}

		if (elem.nodeType === _utils.NODE_TYPE_DOCUMENT) return this.width();

		return elem.offsetWidth;
	},

	outerHeight: function outerHeight() {
		var length = this.length;

		if (!length) return;

		var elem = this[0];

		if ((0, _utils.isWindow)(elem)) {
			return elem.innerHeight;
		}

		if (elem.nodeType === _utils.NODE_TYPE_DOCUMENT) return this.height();

		return elem.offsetHeight;
	},

	offset: function offset(coordinates) {
		if (coordinates) {
			return this.each(function (i, elem) {
				(0, _offset3.default)(elem, coordinates);
			});
		}

		if (!this.length) return;

		return (0, _offset3.default)(this[0]);
	},

	position: function position() {
		if (!this.length) return;

		return (0, _position3.default)(this[0]);
	},

	css: function css(key, value) {
		if (value !== undefined) {
			return this.each(function (i, elem) {
				(0, _css3.default)(elem, key, value);
			});
		} else if ((0, _utils.isObject)(key)) {
			for (var k in key) {
				this.css(k, key[k]);
			}
			return this;
		} else if (this.length) {
			return (0, _css3.default)(this[0], key);
		}
	},

	attr: function attr(key, value) {
		if (value !== undefined) {
			return this.each(function (i, elem) {
				jqLiteAttr(elem, key, value);
			});
		} else if ((0, _utils.isObject)(key)) {
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

		if ((0, _utils.isFunction)(selector)) {
			for (i = 0, len = this.length; i < len; i++) {
				elem = this[i];
				if (selector.call(elem, i, elem)) {
					elems.push(elem);
				}
			}
		} else if ((0, _utils.isString)(selector)) {
			for (i = 0, len = this.length, elem; i < len; i++) {
				elem = this[i];
				if ((0, _matches2.default)(elem, selector)) {
					elems.push(elem);
				}
			}
		}

		return elems;
	},

	closest: function closest(selector) {
		var nodes = [];

		this.each(function (i, elem) {
			var node = (0, _closest3.default)(elem, selector);
			if (node) nodes.push(node);
		});

		return new JQLite(nodes);
	},

	offsetParent: function offsetParent() {
		if (this.length) return (0, _offsetParent3.default)(this[0]);
	},

	hasClass: function hasClass(className) {
		for (var i = 0, n = this.length; i < n; i++) {
			if ((0, _classes.hasClass)(this[i], className)) {
				return true;
			}
		}
		return false;
	},

	addClass: function addClass(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return (0, _classes.addClass)(elem, name);
			});
		});
	},

	removeClass: function removeClass(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return (0, _classes.removeClass)(elem, name);
			});
		});
	},

	toggleClass: function toggleClass(className) {
		if (!className) return this;
		return this.each(function (i, elem) {
			className.split(/\s+/).forEach(function (name) {
				return (0, _classes.toggleClass)(elem, name);
			});
		});
	}

}, function (name, func) {
	/**
     * Properties: writes return selection, reads return first value
     */
	JQLitePrototype[name] = func;
});

(0, _utils.each)({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (method, prop) {
	var top = "pageYOffset" === prop;

	JQLitePrototype[method] = function (val) {
		//getter
		if (val === undefined) {
			var win = void 0;
			var elem = this[0];

			if (!elem) return;

			if ((0, _utils.isWindow)(elem)) {
				win = elem;
			} else if (elem.nodeType === _utils.NODE_TYPE_DOCUMENT) {
				win = elem.defaultView;
			}

			return win ? win[prop] : elem[method];
		}

		//setter
		return this.each(function (i, elem) {
			var win = void 0;
			if ((0, _utils.isWindow)(elem)) {
				win = elem;
			} else if (elem.nodeType === _utils.NODE_TYPE_DOCUMENT) {
				win = elem.defaultView;
			}

			if (win) {
				win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset);
			} else {
				elem[method] = val;
			}
		});
	};
});

////////////Functions////////////////
(0, _utils.each)({
	extend: _utils.extend,
	each: _utils.each,
	isWindow: _utils.isWindow,
	css: _css3.default
}, function (name, func) {
	JQLite[name] = func;
});