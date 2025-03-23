# 对对碰 (DDP)

一个基于Vue 3的卡牌配对游戏，玩家需要在卡牌中找到颜色相同的配对。

## 项目特点

- 基于Vue 3和TypeScript开发
- 使用Pinia进行状态管理
- 支持多种卡牌主题（赛博朋克、奇幻、表情）
- 响应式设计，支持多种设备
- 包含游戏统计和进度追踪

## 技术栈

- Vue 3 - 渐进式JavaScript框架
- TypeScript - JavaScript的超集，提供类型系统
- Vite - 下一代前端构建工具
- Pinia - Vue的状态管理库
- Playwright - 端到端测试框架
- Vitest - 单元测试框架

## 主要功能

### 游戏核心
- 卡牌配对机制
- 自动检测配对
- 游戏进度统计
- 多种卡牌主题

### 游戏界面
- 响应式布局
- 动画效果
- 主题切换
- 游戏状态显示

## 项目设置

### 开发环境配置

推荐使用[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)进行开发。

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

### 构建生产版本

```sh
npm run build
```

### 运行单元测试

```sh
npm run test:unit
```

### 运行端到端测试

```sh
# 首次运行需要安装浏览器
npx playwright install

# 运行所有测试
npm run test:e2e

# 仅运行Chromium测试
npm run test:e2e -- --project=chromium
```

### 代码格式化

```sh
npm run format
```

## 项目结构

```
src/
  ├── components/      # 组件目录
  │   └── CardGame.vue # 主游戏组件
  ├── stores/          # 状态管理
  │   └── game.ts     # 游戏状态逻辑
  ├── views/           # 页面视图
  ├── assets/          # 静态资源
  └── router/          # 路由配置
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

[MIT](./LICENSE)
