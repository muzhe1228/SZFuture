// 圆角矩形SVG路径生成示例
export function createRoundedRectPath(width: number, height: number, radius: number, isPath: boolean = true) {
  return `${isPath ? 'path://' : ''}M${radius},0 
          L${width - radius},0 
          Q${width},0 ${width},${radius} 
          L${width},${height - radius} 
          Q${width},${height} ${width - radius},${height} 
          L${radius},${height} 
          Q0,${height} 0,${height - radius} 
          L0,${radius} 
          Q0,0 ${radius},0 Z`
}

interface RemoveEmptyOptions {
  removeNull?: boolean
  removeUndefined?: boolean
  removeEmptyString?: boolean
  removeEmptyArray?: boolean
  removeEmptyObject?: boolean
  deep?: boolean
}

// 移除空值
export function removeEmpty<T extends Record<string, any> | any[]>(
  obj: T,
  options: RemoveEmptyOptions = {}
): Partial<T> | undefined {
  const {
    removeNull = true,
    removeUndefined = true,
    removeEmptyString = true,
    removeEmptyArray = true,
    removeEmptyObject = true,
    deep = true,
  } = options

  const isEmpty = (value: unknown): boolean => {
    if (removeNull && value === null) return true
    if (removeUndefined && value === undefined) return true
    if (removeEmptyString && value === '') return true
    if (removeEmptyArray && Array.isArray(value) && value.length === 0) return true
    if (
      removeEmptyObject &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    )
      return true
    return false
  }

  const clean = (val: unknown): unknown => {
    if (isEmpty(val)) return undefined

    if (Array.isArray(val)) {
      const result = deep ? val.map(clean).filter((v) => v !== undefined) : val.filter((v) => !isEmpty(v))
      return result.length === 0 ? undefined : result
    }

    if (typeof val === 'object' && val !== null) {
      const result: Record<string, unknown> = {}
      for (const [key, v] of Object.entries(val)) {
        const cleaned = deep ? clean(v) : v
        if (!isEmpty(cleaned)) {
          result[key] = cleaned
        }
      }
      return Object.keys(result).length === 0 ? undefined : result
    }

    return val
  }

  return clean(obj) as Partial<T> | undefined
}

// // 使用示例
// interface DataType {
//   a: number;
//   b: string | null;
//   c?: string;
//   d: string;
//   e: any[];
//   f: Record<string, never>;
//   g: { x: string | null; y: number };
//   h: (number | null | string)[];
// }

// const data: DataType = {
//   a: 1,
//   b: null,
//   c: undefined,
//   d: '',
//   e: [],
//   f: {},
//   g: { x: null, y: 2 },
//   h: [1, null, '', 3]
// };

// const cleaned = removeEmpty(data);
// console.log(cleaned);
// { a: 1, g: { y: 2 }, h: [1, 3] }
