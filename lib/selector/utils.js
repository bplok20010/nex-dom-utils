"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.toType = toType;
exports.noop = noop;
exports.isWindow = isWindow;
exports.isPlainObject = isPlainObject;
exports.isFunction = isFunction;
exports.makeArray = makeArray;
exports.merge = merge;
exports.each = each;
var push = exports.push = Array.prototype.push;
var toString = exports.toString = Object.prototype.toString;
var hasOwn = exports.hasOwn = Object.prototype.hasOwnProperty;
var fnToString = exports.fnToString = hasOwn.toString;
var ObjectFunctionString = exports.ObjectFunctionString = fnToString.call(Object);

var getProto = exports.getProto = Object.getPrototypeOf;

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

function noop() {}

function isWindow(obj) {
	return obj != null && obj === obj.window;
}

function isPlainObject(obj) {
	var proto = void 0,
	    Ctor = void 0;

	if (!obj || toString.call(obj) !== "[object Object]") {
		return false;
	}

	proto = getProto(obj);

	if (!proto) {
		return true;
	}

	Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
	return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
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