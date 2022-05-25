# 实例创建与销毁

## 设置宽高

```ts
import { init } from 'echarts/core'

// 初始化时设置宽高
const inst = init(container, null, {
  width: 600,
  height: 400,
})

// 通过容器设置宽高
// <div id="container" style="width: 600px; height: 400px;"></div>
const inst = init(container)
```

## 更新宽高

```ts
import { init } from 'echarts/core'

const inst = init(container)

// 动态更新
window.addEventListener('resize', () => {
  inst.resize()
})

// 直接设置
inst.resize({ width: 500, height: 300 })
```

## 销毁

```ts
import { init } from 'echarts/core'

const inst = init(container)

inst.dispose()
```
