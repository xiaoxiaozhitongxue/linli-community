import { defineConfig } from 'vitest/config'
import path from 'path'

// 独立的 Vitest 配置：不改动 vite.config.ts（保留其 custom elements / dist 守卫配置）。
// 纯 TS 逻辑/工具模块单测，无需 @vitejs/plugin-vue 编译 .vue。
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // localStore / request 依赖浏览器环境（localStorage / fetch / DOM）
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    // 每个用例前清空 mock 调用记录并还原 spy，保证相互隔离
    clearMocks: true,
    restoreMocks: true,
  },
})
