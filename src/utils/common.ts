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
