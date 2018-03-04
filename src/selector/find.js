import matchesSelector from '../matches';
import * as utils from './utils';

function find( selector, context, results, seed ) {
	let elem, nodeType,
		i = 0;

	results = results || [];
	context = context || document;

	// Same basic safeguard as Sizzle
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	// Early return if context is not an element or document
	if ( ( nodeType = context.nodeType ) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( seed ) {
		while ( ( elem = seed[ i++ ] ) ) {
			if ( matchesSelector( elem, selector ) ) {
				results.push( elem );
			}
		}
	} else {
		utils.merge( results, context.querySelectorAll( selector ) );
	}

	return results;
}

export default find;