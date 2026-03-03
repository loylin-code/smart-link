import { defineConfig } from 'rollup'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { resolve } from 'path'

const input = resolve(__dirname, '../packages/*/src/index.ts')

export default defineConfig({
  input,
  output: [
    {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].mjs',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    {
      format: 'cjs',
      dir: 'dist',
      entryFileNames: '[name].js',
      preserveModules: true,
      preserveModulesRoot: 'src'
    }
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.vue']
    }),
    commonjs(),
    vue({
      target: 'browser'
    }),
    typescript({
      tsconfig: resolve(__dirname, '../tsconfig.base.json'),
      useTsconfigDeclarationDir: true
    }),
    postcss({
      extract: true,
      minimize: true,
      extensions: ['.css', '.scss']
    })
  ],
  external: ['vue', 'vue-router', 'pinia']
})
