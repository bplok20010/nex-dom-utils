'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

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

exports.default = on;