# Admin Template

基于 React 19 的现代化后台管理系统模板，使用 TypeScript、Tailwind CSS v4 和 Shadcn UI 构建。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS v4
- **状态管理**: Redux Toolkit
- **路由**: React Router DOM v7
- **UI 组件**: Shadcn UI + Radix UI
- **图表**: Recharts
- **HTTP 客户端**: Axios
- **表单**: React Hook Form + Zod

## 功能模块

- **认证系统**: 登录、注册、忘记密码
- **仪表盘**: 数据统计概览、趋势图表
- **团队管理**: 团队列表、用户管理、管理员管理
- **订阅管理**: 套餐计划、功能特性、订阅列表、订单管理
- **积分系统**: 积分管理、资源包、赠送记录
- **通知管理**: 通知模板配置

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local` 并配置:

```bash
VITE_API_BASE_URL=http://localhost:8081/api
VITE_APP_TITLE=Admin Template
VITE_APP_ICON=/favicon.svg
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 目录结构

```
src/
├── assets/           # 静态资源 (SVG, 图片等)
├── components/       # 可复用组件
│   ├── ui/          # Shadcn UI 基础组件
│   ├── blocks/      # 页面区块组件
│   ├── datatable/   # 数据表格组件
│   └── sidebar/     # 侧边栏组件
├── config/          # 应用配置
├── features/        # 功能模块
│   └── auth/        # 认证相关组件
├── hooks/           # 自定义 React Hooks
├── layouts/         # 布局组件
├── lib/             # 工具库
├── pages/           # 页面组件
│   ├── auth/        # 认证页面
│   └── dashboard/   # 后台管理页面
├── router/          # 路由配置
├── services/        # API 服务
├── store/           # Redux Store
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 开发规范

### 路径别名

使用 `@/` 前缀导入 src 目录下的文件:

```typescript
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
```

### 样式

使用 Tailwind CSS 工具类，配合 `cn()` 函数处理条件类名:

```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class')} />
```

### 状态管理

- 全局状态使用 Redux Toolkit
- 使用类型化 Hooks: `useAppDispatch`, `useAppSelector`
- 优先使用组件本地状态

## 许可证

MIT
