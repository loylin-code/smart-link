import { defineConfig } from 'rollup'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'
import fs from 'fs'

const pkgPath = process.cwd()
const pkgJson = JSON.parse(fs.readFileSync(resolve(pkgPath, 'package.json'), 'utf-8'))
const pkgName = pkgJson.name.split('/')[1] || pkgJson.name

const input = resolve(pkgPath, 'src/index.ts')
const tsconfig = resolve(pkgPath, 'tsconfig.json')

// Check if this package has a variables.scss file
const variablesPath = resolve(pkgPath, 'src/styles/variables.scss')
const hasVariables = fs.existsSync(variablesPath)

// 收集所有依赖作为 external
// But NOT SCSS files from @smart-link/theme - those need to be resolved for postcss
const externalDeps = (id) => {
  // SCSS files from @smart-link/theme should NOT be external - they need to be resolved
  if (id.includes('@smart-link/theme') && id.endsWith('.scss')) {
    return false
  }
  // Core external dependencies
  if (['vue', 'vue-router', 'pinia'].includes(id)) {
    return true
  }
  // Workspace dependencies (except SCSS from theme)
  if (id.startsWith('@smart-link/')) {
    return true
  }
  return false
}

export default defineConfig({
  input,
  output: [
    {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].mjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named'
    },
    {
      format: 'cjs',
      dir: 'dist',
      entryFileNames: '[name].js',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.vue', '.scss'],
      // Resolve @smart-link/theme SCSS imports
      alias: {
        '@smart-link/theme/styles': resolve(pkgPath, '../theme/dist/styles')
      }
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
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
          additionalData: hasVariables ? `@use "${variablesPath.replace(/\\/g, '/')}" as *;\n` : ''
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
