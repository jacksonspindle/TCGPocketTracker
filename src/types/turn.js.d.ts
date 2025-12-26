declare module 'turn.js' {
  // Turn.js is a jQuery plugin that adds the .turn() method
  // It doesn't export anything directly, it augments jQuery
}

interface TurnOptions {
  width?: number
  height?: number
  autoCenter?: boolean
  acceleration?: boolean
  gradients?: boolean
  elevation?: number
  duration?: number
  pages?: number
  display?: 'single' | 'double'
  when?: {
    turning?: (event: any, page: number, view: any) => void
    turned?: (event: any, page: number, view: any) => void
    start?: (event: any, pageObject: any, corner: any) => void
    end?: (event: any, pageObject: any, turned: boolean) => void
  }
}

interface JQuery {
  turn(options?: TurnOptions): JQuery
  turn(method: 'next'): JQuery
  turn(method: 'previous'): JQuery
  turn(method: 'page', page: number): JQuery
  turn(method: 'page'): number
  turn(method: 'pages'): number
  turn(method: 'destroy'): JQuery
  turn(method: 'disable', disable: boolean): JQuery
  turn(method: 'size'): { width: number; height: number }
  turn(method: 'resize'): JQuery
}
