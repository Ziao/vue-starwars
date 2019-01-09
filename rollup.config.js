import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import nodent from 'rollup-plugin-nodent'; // Transform async/await as buble doesn't do this
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import resolve from 'rollup-plugin-node-resolve'; // Allow us to include and use external packages
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: 'src/starwars.vue', // Path relative to package.json
    output: {
        name: 'StarWars',
        exports: 'named',
    },
    plugins: [
        resolve(),
        commonjs({
            exclude: [],
            include: [
                //some react related modules i need
                'node_modules/p5/**',
            ]
        }),
        vue({
            css: true, // Dynamically inject css as a <style> tag
            compileTemplate: true, // Explicitly convert template to render function
        }),
        nodent(),
        buble({
            // Transpile to ES5
            transforms: {
                dangerousForOf: true
            }
        })
    ],
};