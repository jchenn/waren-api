export function normalize(str: string): any {
  const { fields, items } = JSON.parse(str);
  const result = [];
  items.forEach((item: any) => {
    const obj = {};
    fields.forEach((field: string, index: number) => {
      obj[field] = item[index];
    });
    result.push(obj);
  });
  return result;
}

/**
 * 把对象数组的属性名提取出来
 * @param obj
 */
export function serialize(obj: any[] | any): string {
  const result = { fields: [], items: [] };
  let input = obj;
  if (!Array.isArray(obj)) {
    input = [obj];
  }
  input.forEach((item: any, index: number) => {
    result.items[index] = [];
    Object.keys(item).forEach((key) => {
      if (index === 0) {
        result.fields.push(key);
      }
      result.items[index].push(item[key]);
    });
  });
  return JSON.stringify(result);
}
