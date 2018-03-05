
export const push = Array.prototype.push;
export const toString = Object.prototype.toString;
export const hasOwn = Object.prototype.hasOwnProperty;
export const fnToString = hasOwn.toString;
export const ObjectFunctionString = fnToString.call( Object );

export const getProto = Object.getPrototypeOf;

const class2type = {};

each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

export function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}

function isArrayLike( obj ) {
	
	let length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

export function noop(){}

export function isWindow( obj ) {
	return obj != null && obj === obj.window;
}

export function isPlainObject( obj ) {
	let proto, Ctor;
	
	if ( !obj || toString.call( obj ) !== "[object Object]" ) {
		return false;
	}

	proto = getProto( obj );

	if ( !proto ) {
		return true;
	}

	Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
	return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
}

export function isFunction( obj ) {
	return typeof obj === "function" && typeof obj.nodeType !== "number";
}

export function makeArray( arr, results ) {
	let ret = results || [];

	if ( arr != null ) {
		if ( isArrayLike( Object( arr ) ) ) {
			merge( ret,
				typeof arr === "string" ?
				[ arr ] : arr
			);
		} else {
			push.call( ret, arr );
		}
	}

	return ret;
}

export function merge( first, second ) {
	let len = +second.length,
		j = 0,
		i = first.length;

	for ( ; j < len; j++ ) {
		first[ i++ ] = second[ j ];
	}

	first.length = i;

	return first;
}

export function each( obj, callback ) {
	let length, i = 0;

	if ( isArrayLike( obj ) ) {
		length = obj.length;
		for ( ; i < length; i++ ) {
			if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
				break;
			}
		}
	} else {
		for ( i in obj ) {
			if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
				break;
			}
		}
	}

	return obj;
}

export const NODE_TYPE_ELEMENT = 1;
export const NODE_TYPE_ATTRIBUTE = 2;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_COMMENT = 8;
export const NODE_TYPE_DOCUMENT = 9;
export const NODE_TYPE_DOCUMENT_FRAGMENT = 11;

export function isUndefined(value) {return typeof value === 'undefined';}

export function isDefined(value) {return typeof value !== 'undefined';}

export function isString(value) {return typeof value === 'string';}

export function lowercase(string) {return isString(string) ? string.toLowerCase() : string;}
