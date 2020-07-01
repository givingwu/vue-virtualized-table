import { isObject, isValidArray } from '../utils/type'

export function data() {
  return {
    scrollToRowIndex: this.scrollToRow,
    virtualizedData: []
  }
}

export function created() {
  const { useVirtual, rowHeight, scroll = {} } = this

  if (useVirtual && !scroll.y) {
    throw new ReferenceError(
      `When open 'useVirtual' mode the property 'scroll.y' must be set as number to fixed header and calculates how many items should be render in table!`
    )
  }

  if (useVirtual && !rowHeight) {
    throw new ReferenceError(
      `When open 'useVirtual' mode the property 'rowHeight' must be set as number to fix the height of per table row!`
    )
  }

  this.__prevStartIndex = 0
}

export const computed = {
  virtualized() {
    return !!(
      this.useVirtual &&
      this.rowHeight &&
      this.scroll &&
      this.scroll.y &&
      typeof this.scroll.y === 'number'
    )
  },

  currentDataSource() {
    if (isObject(this.expandable)) {
      return this.entireDataSource || []
    }

    return this.dataSource
  },

  currentDataLength() {
    return isValidArray(this.currentDataSource)
      ? this.currentDataSource.length
      : 0
  },

  wrapperSize() {
    return this.virtualized ? this.currentDataLength * this.rowHeight : 0
  },

  virtualVisibleItemsSize() {
    return this.virtualized ? Math.ceil(this.scroll.y / this.rowHeight) : 0
  },

  wrapperScrollTop() {
    return this.virtualized ? this.scrollToRowIndex * this.rowHeight : 0
  },

  maxSliceBlockStep() {
    return this.virtualized
      ? Math.ceil(
          this.wrapperSize / (this.rowHeight * this.virtualVisibleItemsSize)
        )
      : 0
  }

  /* wrapperMaxScrollTop() {
    return this.virtualized
      ? this.wrapperScrollTop - this.rowHeight * this.virtualVisibleItemsSize
      : 0
  } */
}

export const watch = {
  dataSource: {
    immediate: true,
    handler(data) {
      if (data && data.length) {
        this.updateVirtualizedData(true)
      } else {
        this.entireDataSource = []
      }
    }
  },
  entireDataSource(data) {
    if (data && data.length) {
      this.updateVirtualizedData(true)
    } else {
      this.virtualizedData = []
    }
  }
}

export const methods = {
  getVisibleRange(offset) {
    let start = Math.floor(offset / this.rowHeight) || 0
    const N = this.virtualVisibleItemsSize || 0
    const MIN_INDEX = 0
    let end = start + N || 0

    this.__CURRENT_N_STEP = Math.ceil(
      offset / (this.rowHeight * this.virtualVisibleItemsSize)
    )

    if (start < N) {
      start = MIN_INDEX
      end += N
    } else {
      start = start - N
      end += N
    }

    return {
      start,
      end
    }
  },

  updateVirtualizedData(scrollTop = 0, forceUpdate) {
    if (scrollTop === true) {
      scrollTop = this.__PREV_SCROLL_TOP
      forceUpdate = true
    }

    const { start, end } = this.getVisibleRange(scrollTop)
    const shouldUpdate =
      // this.__PREV_START_INDEX !== start ||
      this.__CURRENT_N_STEP !== this.__PREV__CURRENT_N_STEP

    if (!shouldUpdate && !forceUpdate) {
      return
    }

    this.__PREV__CURRENT_N_STEP = this.__CURRENT_N_STEP
    this.__PREV_START_INDEX = start
    this.__PREV_SCROLL_TOP = scrollTop

    this.scrollToRowIndex = start
    this.virtualizedData = this.currentDataSource.slice(start, end)
  },

  renderVirtualizedWrapper(baseTable) {
    return (
      <div
        class={`${this.prefixCls}-virtual-wrapper`}
        style={{
          position: 'relative',
          height: this.wrapperSize + 'px'
        }}
      >
        <div
          class={`${this.prefixCls}-virtual-inner`}
          style={{
            // position: "relative",
            willChange: 'transform',
            WebkitOverflowScrolling: 'touch',
            transform: `translateY(${this.wrapperScrollTop}px)`
          }}
        >
          {baseTable}
        </div>
      </div>
    )
  }
}
