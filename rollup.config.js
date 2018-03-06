import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

function plugins(){
	return [
        babel({
			babelrc: false,
			"presets": [
				["env", {
				"modules": false,
				  "targets": {
					"browsers": ["ie >= 9"]
				  }
				}]
			],
			"plugins": [
				"external-helpers"
			  ]
		}),
        resolve(),
        commonjs(),
        json(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ];	
}

export default [{
    input: './src/index.js',
	output: [
		{
			file: 'dist/nex-dom-utils.js',
			format: 'umd',
			name: 'NDU',
			///legacy: true,
			sourcemap: true	
		}
	],
    plugins: plugins()
},{
    input: './src/jqLite.js',
	output: [
		{
			file: 'dist/jqlite.js',
			format: 'umd',
			name: 'jqLite',
			///legacy: true,
			sourcemap: true	
		}
	],
    plugins: plugins()
}];