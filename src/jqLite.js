import {
	push,
	each,
	merge,
	lowercase,
	isDefined,
	isFunction,
	makeArray,
	isWindow,
	isUndefined,
	isObject,
	NODE_TYPE_DOCUMENT,
} from './selector/utils';

import domReady from './selector/domReady';

import parseHTML from './selector/parseHTML';
import find from './selector/find';

import css from './css';

const rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;

//////////////////////////////////////////////
export default function JQLite(selector, context){
	if (!(this instanceof JQLite)) {
		return new JQLite(selector, context);
	}
	
	if (selector instanceof JQLite) {
		return selector;
	}
	
	// HANDLE: $(""), $(null), $(undefined), $(false)
	if ( !selector ) {
		return this;
	}	
	
	let match, elem;
	
	if ( typeof selector === "string" ) {
		if ( selector[ 0 ] === "<" &&
			selector[ selector.length - 1 ] === ">" &&
			selector.length >= 3 ) {

			// Assume that strings that start and end with <> are HTML and skip the regex check
			match = [ null, selector, null ];

		} else {
			match = rquickExpr.exec( selector );
		}

		// Match html or make sure no context is specified for #id
		if ( match && ( match[ 1 ] || !context ) ) {

			// HANDLE: $(html) -> $(array)
			if ( match[ 1 ] ) {
				context = context instanceof JQLite ? context[ 0 ] : context;

				// Option to run scripts is true for back-compat
				// Intentionally let the error be thrown if parseHTML is not present
				merge( this, parseHTML(
					match[ 1 ],
					context && context.nodeType ? context.ownerDocument || context : document,
					true
				) );

				return this;

			// HANDLE: $(#id)
			} else {
				elem = document.getElementById( match[ 2 ] );

				if ( elem ) {

					// Inject the element directly into the jQuery object
					this[ 0 ] = elem;
					this.length = 1;
				}
				return this;
			}

		// HANDLE: $(expr, $(...))
		} else if ( !context ) {
			return find( selector, document, new JQLite() );

		// HANDLE: $(expr, context)
		// (which is just equivalent to: $(context).find(expr)
		} else {
			return JQLite( context ).find( selector );
		}

	// HANDLE: $(DOMElement)
	} else if ( selector.nodeType ) {
		this[ 0 ] = selector;
		this.length = 1;
		return this;

	// HANDLE: $(function)
	// Shortcut for document ready
	} else if ( isFunction( selector ) ) {
		domReady(selector);
	}
	
	return makeArray( selector, this );
}

const JQLitePrototype = JQLite.fn = JQLite.prototype = {
	ready: domReady,
	toString: function() {
		const value = [];
		each(this, function(i, e) { value.push('' + e);});
		return '[' + value.join(', ') + ']';
	},

	eq: function(index) {
		return (index >= 0) ? JQLite(this[index]) : JQLite(this[this.length + index]);
	},

	length: 0,
	push: push,
	sort: [].sort,
	splice: [].splice,
	
	find: function(selector){
		let i, ret,
			len = this.length,
			self = this;
	
		ret = new JQLite();
	
		for ( i = 0; i < len; i++ ) {
			find( selector, self[ i ], ret );
		}
	
		return ret;//len > 1 ? jQuery.uniqueSort( ret ) : ret;	
	},
	
	each: function(callback){
		return each(this, callback);
	}
};

if ( typeof Symbol === "function" ) {
	let arr = [];
	JQLitePrototype[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

function jqLiteWidthOrHeightCreator(type){
	const funcName = lowercase(type);
	
	return function(elem, value){
		if( isWindow(elem) ) {
			return elem.document.documentElement[ "client" + type ];	
		}	
		
		if ( elem.nodeType === NODE_TYPE_DOCUMENT ) {
			const doc = elem.documentElement;
	
			// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
			// whichever is greatest
			return Math.max(
				elem.body[ "scroll" + type ], doc[ "scroll" + type ],
				elem.body[ "offset" + type ], doc[ "offset" + type ],
				doc[ "client" + type ]
			);
		}
		
		const exp1 = type === 'Width' ? 'Left' : 'Top';
		const exp2 = type === 'Width' ? 'Right' : 'Bottom';
		
		//getter
		if( value === undefined ) {
			return elem.offsetWidth -
				parseFloat( css(elem, `border${exp1}${type}`) ) -
				parseFloat( css(elem, `padding${exp1}`) ) -
				parseFloat( css(elem, `padding${exp2}`) ) -
				parseFloat( css(elem, `border${exp2}${type}`) );
		//setter		
		} else {
			const isBorderBox = css( elem, "boxSizing" ) === "border-box";
			
			const borderOrPadding = ( 
				parseFloat( css(elem, `border${exp1}${type}`) ) +
				parseFloat( css(elem, `padding${exp1}`) ) +
				parseFloat( css(elem, `padding${exp2}`) ) +
				parseFloat( css(elem, `border${exp2}${type}`) )
			);	
			
			css(elem, funcName, !isBorderBox || value === "" ? value : (value || 0) - borderOrPadding);
		}	
	};
}

each({
	width: function(value){
		const length = this.length;
		
		if( !length ) return value === undefined ? 0 : this;
		
		const func = jqLiteWidthOrHeightCreator('Width');
		
		if( value === undefined ) {
			const elem = this[0];
			return func(elem);
		} else {
			for( let i = 0; i<length; i++ ) {
				func(this[i], value);	
			}	
		}
		
		return this;
	},
	height: function(value){
		const length = this.length;
		
		if( !length ) return value === undefined ? 0 : this;
		
		const func = jqLiteWidthOrHeightCreator('Height');
		
		if( value === undefined ) {
			const elem = this[0];
			return func(elem);
		} else {
			for( let i = 0; i<length; i++ ) {
				func(this[i], value);	
			}	
		}
		
		return this;
	}
}, function(name, func){
	/**
     * Properties: writes return selection, reads return first value
     */
	JQLitePrototype[name] = func;
});

