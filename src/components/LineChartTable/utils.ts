import type { CSSProperties } from 'vue'
import type { FormatterParams, Opts } from './types'

/**
 * 计算该条数据的 yAxis 的 interval、max 值
 * @param row 折线图数据
 */
export function computedIntervel(row: number[]) {
  if (!row.length) return

  const [maxNum] = [...row].sort((a, b) => b - a)
  if (typeof maxNum !== 'number' || isNaN(maxNum) || !/^\d+(\.\d+)?$/.test(maxNum as unknown as string)) return {}

  const average = maxNum / 5
  const [integer, decimal] = String(average).split('.')

  let interval = average
  let proportion = 1

  if (Number(integer) > 0) {
    interval = Number(integer[0]) + 1
    proportion = Math.pow(10, integer.length - 1)
  } else {
    for (let i = 0; i < decimal.length; i++) {
      let num = Number(decimal[i])
      if (num) {
        interval = num + 1
        proportion = Math.pow(10, -i - 1)
        break
      }
    }
  }

  // 刚好处于节点最大值，直接封顶
  if ((interval - 1) * proportion * 5 == maxNum) interval--

  const max = interval * proportion * 5

  interval *= proportion

  return {
    max,
    interval,
  }
}

function cssToText(css: CSSProperties) {
  return Object.keys(css)
    .map((key) => {
      const value = css[key as keyof CSSProperties]
      return `${key}: ${value}`
    })
    .join(';')
}

function cssMapToText<T extends Record<string, CSSProperties>>(map: T): Record<keyof T, string> {
  const temp = {} as Record<keyof T, string>

  Object.keys(map).forEach((key) => {
    Reflect.set(temp, key, cssToText(map[key]))
  })

  return temp
}

const style = cssMapToText({
  box: {
    'word-break': 'keep-all',
  },
  head: {
    'font-size': '18px',
    'font-weight': 600,
    padding: '0 0 10px',
    color: '#666',
  },
  label: {
    'margin-right': '10px',
    color: '#999',
  },
  value: {
    'font-weight': 600,
    'justify-self': 'end',
    color: '#777',
  },
})

export function formatterContent(params: FormatterParams): string {
  if (!Array.isArray(params)) {
    params = [params]
  }
  const headText = Reflect.get(params[0], 'axisValueLabel')
  const contentHtml = params
    .map(
      (param) => `<div style="${style.label}">${param.seriesName}</div><div style="${style.value}">${param.value}</div>`
    )
    .join('')

  const contentStyle = cssToText({
    display: 'grid',
    'grid-template-columns': 'auto auto',
    'grid-template-rows': `repeat(${params.length}, 24px)`,
    'grid-column-gap': '10px',
    'align-items': 'center',
    'font-size': '14px',
  })

  return `<div style="${style.box}"><div style="${style.head}">${headText}</div><div style="${contentStyle}">${contentHtml}</div></div>`
}
