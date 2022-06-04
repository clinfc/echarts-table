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
