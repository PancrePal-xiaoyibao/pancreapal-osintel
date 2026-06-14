I'll help you explore this repository to understand how the Earth animation effect is implemented and what frontend and backend modules are present.现在让我查看项目的架构细节和地球动画相关的代码：现在我来详细为你讲解这个项目。

## 项目概述

**WorldWideView** 是一个开源的**地理空间实时智能引擎**，使用 **CesiumJS 3D 地球** 渲染实时全球数据。这是一个前后分离的完整系统。

---

## 地球动画效果的实现原理

### 1. **核心技术栈**
- **3D 引擎**: CesiumJS + Resium（Google Photorealistic 3D Tiles）
- **状态管理**: Zustand（9 个状态切片）
- **实时更新**: 自定义 DataBus（高频事件发布订阅）
- **相机动画**: EasingFunction 平滑过渡

### 2. **地球动画流程** (完整渲染管道)

```
数据源 (WebSocket /stream) 
  ↓
DataBus (高频事件总线) 
  ↓
Zustand Store (entitiesByPlugin 实体缓存)
  ↓
EntityRenderer (转换为 Cesium 图元)
  ↓
AnimationLoop (每帧更新、地平线剔除)
  ↓
CesiumJS 球体
```

### 3. **关键动画组件**

| 组件 | 功能 |
|------|------|
| **AnimationLoop.ts** | 每帧更新：地平线剔除、悬停/选中、模型LOD提升 |
| **CameraController.ts** | 相机平滑飞行到位置、预设视角动画 |
| **animationHelpers.ts** | 位置外推、高亮颜色、速度计算 |
| **stackAnimation.ts** | 共位置实体的堆叠动画效果 |
| **StackManager.ts** | 视屏空间聚类分组 |
| **useEntityRendering.ts** | 实体渲染钩子，绑定物理更新循环 |
| **useSatelliteFrustum.ts** | 卫星传感器足迹锥体动画 |
| **useTrailRendering.ts** | 运动轨迹渲染 |

### 4. **高性能动画优化**
- **零分配数学**: 预分配 scratch 对象（Cartesian3、Matrix4 等）
- **原始集合渲染**: 使用 `PointPrimitiveCollection`、`BillboardCollection` 直接操作（不用 Entity）
- **分块处理**: 10k+ 实体分 500 个一组处理
- **地平线剔除**: 单次点积计算（比深度检测快得多）
- **物理循环同步**: 绑定到 `viewer.clock.onTick` 而不是 `scene.preUpdate`，消除相机追踪延迟

### 5. **相机动画示例**

```typescript
// 预设位置飞行
const CAMERA_PRESETS = {
    global: { lat: 20, lon: 0, alt: 20000000, heading: 0, pitch: -90 },
    americas: { lat: 15, lon: -80, alt: 12000000, heading: 0, pitch: -80 },
    // ... 其他区域
};

// 平滑飞行到指定位置
flyToPosition(viewer, lat, lon, alt, heading, pitch, duration = 2.0)
```

---

## 前后端模块划分

### **后端模块** (wwv-data-engine 仓库)

| 模块 | 功能 |
|------|------|
| **Data Engine Seeders** | 轻量级 seeder.mjs 脚本，从公共 API 轮询或微服务流式接收数据 |
| **WebSocket /stream** | 高频流媒体端点，推送实时数据更新 |
| **Redis 缓存** | 存储 `data:<name>:live` 最新数据 |
| **Plugin Registry** | 插件注册表，管理数据源与前端的映射 |

### **前端模块** (src/ 核心结构)

```
src/
├── app/                    # Next.js App Router（页面、API 路由）
├── components/             # 共享 UI、全球面板、3D 布局
├── core/
│   ├── globe/              # ⭐ 地球渲染引擎
│   │   ├── GlobeView.tsx          # Cesium 查看器容器
│   │   ├── EntityRenderer.ts      # 实体→图元转换
│   │   ├── AnimationLoop.ts       # 每帧更新循环
│   │   ├── CameraController.ts    # 相机控制
│   │   ├── StackManager.ts        # 聚类堆叠管理
│   │   ├── animationHelpers.ts    # 动画辅助函数
│   │   └── hooks/                 # 渲染钩子
│   ├── state/              # Zustand 状态管理（9 个切片）
│   │   ├── globeSlice.ts         # 相机位置、fps
│   │   ├── dataSlice.ts          # 实体缓存
│   │   ├── layersSlice.ts        # 图层可见性
│   │   └── ... 其他切片
│   ├── data/               # 数据管道
│   │   ├── DataBus.ts            # 高频事件总线
│   │   └── WsClient.ts           # WebSocket 路由
│   └── plugins/            # 插件系统
└── plugins/                # 内置插件
```

### **插件系统** (All-Bundle 架构)

四种插件模式共存：

1. **Data Engine Seeder** - `seeder.mjs` 脚本（轮询 API）
2. **CDN 动态加载** - 外部开发的插件从 unpkg.com 动态导入
3. **静态编译** - GeoJSON 包装为 JS 捆绑包
4. **主动代理** - Next.js API 路由束

---

## 完整数据流

```
┌─────────────────────────────────────┐
│  数据源 (Public APIs / 微服务)      │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Data Engine Seeders                │
│  (轮询或流式接收数据)               │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┬──────────┐
      ↓             ↓          ↓
   Redis      /stream API    /api/[id]
   (缓存)    (WebSocket)    (REST)
      │             │          │
      └──────────┬──────────┬──┘
                 ↓
        ┌──────────────────────┐
        │  WsClient            │
        │  (路由 WebSocket)    │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │  DataBus             │
        │  (typed pub/sub)     │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │  Zustand Store       │
        │  (entitiesByPlugin)  │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │  EntityRenderer      │
        │  (转换为图元)        │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │  AnimationLoop       │
        │  (地平线剔除、LOD)   │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │  CesiumJS 3D 球体    │
        └──────────────────────┘
```

---

## 关键文件导航

- 📄 **[docs/ARCHITECTURE.md](https://github.com/silvertakana/worldwideview/blob/main/docs/ARCHITECTURE.md)** - 完整架构深度解析
- 📄 **[.agents/rules/cesium-rendering.md](https://github.com/silvertakana/worldwideview/blob/main/.agents/rules/cesium-rendering.md)** - Cesium 渲染规则
- 📄 **[docs/plugin-quickstart.md](https://github.com/silvertakana/worldwideview/blob/main/docs/plugin-quickstart.md)** - 插件开发入门

这个项目设计得非常精妙，关键在于**单向数据流** + **高频 DataBus** + **零分配动画循环**，让千级实体也能流畅渲染。
