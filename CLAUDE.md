# CLAUDE.md - 项目规范

## 项目概述
基于 React 的后台管理模板，使用 TypeScript、Tailwind CSS v4、Redux Toolkit、React Router 和 Shadcn UI 组件。

## 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS v4 (通过 @tailwindcss/vite)
- **状态管理**: Redux Toolkit + React-Redux
- **路由**: React Router DOM v7
- **UI 组件**: Shadcn UI (手动配置 CVA)
- **HTTP 客户端**: Axios

## 目录结构
```
src/
├── components/        # 可复用组件
│   └── ui/           # Shadcn UI 组件 (button, input 等)
├── features/         # 功能模块 (auth, dashboard 等)
├── hooks/            # 自定义 React hooks
├── lib/              # 工具库 (cn 函数等)
├── pages/            # 页面组件 (路由目标)
├── router/           # React Router 配置
├── services/         # API 服务 (axios 实例)
├── store/            # Redux store 配置
├── types/            # TypeScript 类型定义
└── utils/            # 辅助函数
```

## 编码规范

### 文件命名
- 组件: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- 工具/hooks: camelCase (`useAuth.ts`, `formatDate.ts`)
- 类型: PascalCase 加 `.types.ts` 后缀 (`User.types.ts`)

### 路径别名
使用 `@/` 前缀导入 `src/` 下的文件:
```typescript
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
```

### 组件结构
```typescript
// 1. 导入
import { cn } from '@/lib/utils'

// 2. 类型定义
interface Props {
  title: string
}

// 3. 组件
export function Component({ title }: Props) {
  return <div>{title}</div>
}
```

### 状态管理
- 使用 Redux Toolkit 的 `createSlice` 管理全局状态
- 使用类型化 hooks: `useAppDispatch`, `useAppSelector`
- 尽可能使用组件本地状态

### 样式
- 使用 Tailwind CSS 工具类
- 使用 `cn()` 辅助函数处理条件类名:
```typescript
<div className={cn('base-class', isActive && 'active-class')} />
```
- 遵循 Shadcn 颜色系统: `bg-primary`, `text-muted-foreground` 等

### API 调用
- 使用 `@/services/api` 中配置的 axios 实例
- 通过拦截器处理错误 (401 重定向到登录页)
- 使用环境变量 `VITE_API_BASE_URL` 配置基础 URL

### 密码加密
- 密码传输前必须使用 SHA256 哈希，使用 `@/utils/crypto` 中的 `hashPasswordSHA256` 函数
- 示例:
```typescript
import { hashPasswordSHA256 } from '@/utils/crypto'

const hashedPassword = hashPasswordSHA256(password)
await login({ credential: email, secret: hashedPassword })
```

## 命令
```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建生产版本
pnpm lint     # 运行 ESLint
pnpm preview  # 预览生产构建
```

## 添加新功能

### 新页面
1. 在 `src/pages/` 创建组件
2. 在 `src/router/index.tsx` 添加路由

### 新 Redux Slice
1. 在 `src/store/` 或 `src/features/[feature]/` 创建 slice
2. 在 `src/store/index.ts` 添加 reducer

### 新 UI 组件
1. 添加到 `src/components/ui/`
2. 使用 CVA 定义变体
3. 使用 `cn()` 合并类名

## 环境变量
```
VITE_API_BASE_URL=http://localhost:3000/api
```
