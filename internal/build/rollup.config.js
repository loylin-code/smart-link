import { defineConfig } from 'rollup'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgPath = process.cwd()
const pkgJson = JSON.parse(fs.readFileSync(resolve(pkgPath, 'package.json'), 'utf-8'))
const pkgName = pkgJson.name.split('/')[1] || pkgJson.name

const input = resolve(pkgPath, 'src/index.ts')
const tsconfig = resolve(pkgPath, 'tsconfig.json')

// 收集所有依赖作为 external
const externalDeps = [
  // 核心外部依赖
  'vue',
  'vue-router',
  'pinia',
  // workspace 依赖模式
  /^@smart-link\//
]

export default defineConfig({
  input,
  output: [
    {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].mjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true
    },
    {
      format: 'cjs',
      dir: 'dist',
      entryFileNames: '[name].js',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true
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
      useTsconfigDeclarationDir: false,
      declarationDir: 'dist'
    }),
    postcss({
      extract: true,
      minimize: true,
      extensions: ['.css', '.scss'],
      use: {
        sass: {
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }),
    // 构建分析 - 生成 HTML 报告
    visualizer({
      filename: `./stats/${pkgName}-stats.html`,
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  external: externalDeps
})
