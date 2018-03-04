'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _matches = require('../matches');

var _matches2 = _interopRequireDefault(_matches);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
		return [];
	}

	if (seed) {
		while (elem = seed[i++]) {
			if ((0, _matches2.default)(elem, selector)) {
				results.push(elem);
			}
		}
	} else {
		utils.merge(results, context.querySelectorAll(selector));
	}

	return results;
}

exports.default = find;