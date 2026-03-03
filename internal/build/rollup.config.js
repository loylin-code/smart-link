import { defineConfig } from 'rollup'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgPath = process.cwd()
const pkgJson = JSON.parse(fs.readFileSync(resolve(pkgPath, 'package.json'), 'utf-8'))

const input = resolve(pkgPath, 'src/index.ts')
const tsconfig = resolve(pkgPath, 'tsconfig.json')

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
      tsconfig,
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
