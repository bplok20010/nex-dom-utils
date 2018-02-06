'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = setOffset;

var _css = require('../css');

var _css2 = _interopRequireDefault(_css);

var _getOffset = require('./getOffset');

var _getOffset2 = _interopRequireDefault(_getOffset);

var _position = require('../position');

var _position2 = _interopRequireDefault(_position);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setOffset(elem, options) {
	var curPosition = void 0,
	    curLeft = void 0,
	    curCSSTop = void 0,
	    curTop = void 0,
	    curOffset = void 0,
	    curCSSLeft = void 0,
	    calculatePosition = void 0,
	    positionState = (0, _css2.default)(elem, "position"),
	    curElem = elem,
	    props = {};

	// Set position first, in-case top/left are set even on static elem
	if (positionState === "static") {
		elem.style.position = "relative";
	}

	curOffset = (0, _getOffset2.default)(curElem);
	curCSSTop = (0, _css2.default)(elem, "top");
	curCSSLeft = (0, _css2.default)(elem, "left");
	calculatePosition = (positionState === "absolute" || positionState === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;

	// Need to be able to calculate position if either
	// top or left is auto and position is either absolute or fixed
	if (calculatePosition) {
		curPosition = (0, _position2.default)(curElem);
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
		(0, _css2.default)(curElem, props);
	}
}