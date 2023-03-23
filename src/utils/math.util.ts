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
      sum += data[i + j] || 0;
    }
    const avg = sum / days;
    result.push(avg);
  }
  return result;
}

export function getMaxArrayGapRate(arr1: number[], arr2: number[]): number {
  let maxGapRate = 0;
  for (let i = 0; i < Math.min(arr1.length, arr2.length); ++i) {
    const gapRate = Math.abs(arr1[i] - arr2[i]) / Math.max(arr1[i], arr2[i]);
    if (gapRate > maxGapRate) {
      maxGapRate = gapRate;
    }
  }
  return maxGapRate;
}

export function findMinIndex(arr: number[]): number {
  let minIndex = 0;
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < arr[minIndex]) {
      minIndex = i;
    }
  }
  return minIndex;
}
