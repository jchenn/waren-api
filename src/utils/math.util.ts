/**
 * 计算均线
 * @param data 价格数组
 * @param days 几日均线
 * @param count 计算几个值
 * @returns
 */
export function getMA(data: number[], days: number, count: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; ++i) {
    let sum = 0;
    for (let j = 0; j < days; ++j) {
      sum += data[i + j];
    }
    const avg = sum / days;
    result.push(avg);
  }
  return result;
}
