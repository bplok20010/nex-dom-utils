'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

var off = function () {
		if (document.addEventListener) return function (node, eventName, handler, capture) {
				return node.removeEventListener(eventName, handler, capture || false);
		};else if (document.attachEvent) return function (node, eventName, handler) {
				return node.detachEvent('on' + eventName, handler);
		};
}();

exports.default = off;