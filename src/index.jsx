/* eslint-disable no-unused-vars */
import { TableProps, TableComponents } from './interface'
import * as Expansion from './mixins/withExpansion'
import * as Selection from './mixins/withSelection'
import * as Virtualization from './mixins/withVirtualization'
import { useRaf } from './utils/useRaf'
import { getRowKey } from './utils/rowKey'
import { debounce } from './utils/debounce'
import { isNumber, isFunction, isValidArray } from './utils/type'
import getScrollBarSize from './utils/dom/getScrollBarSize'
import {
  flatColumns,
  getColumnsKey,
  getStickyOffset,
  getCellFixedInfo
} from './utils/column'
import ColGroup from './ColGroup'
import Body from './TableBody/index'
import Header from './TableHeader/index'
import FixedHeader from './TableHeader/FixedHeader'
import ResizeObserver from 'vue-size-observer'
import { forceScroll } from './utils/dom/scroll'

export default {
  name: 'VirtualTable',

  mixins: [Selection, Expansion, Virtualization],

  inheritAttrs: false,

  props: TableProps,

  provide() {
    return {
      // Table props
      prefixCls: this.prefixCls,
      direction: this.direction,
      components: this.components,
      expandable: this.expandable,
      rowHeight: this.rowHeight,
      rowClassName: this.rowClassName,
      rowSelection: this.rowSelection,

      // Computed properties
      getRowKey: this.getRowKey,
      fixHeader: this.fixHeader,
      fixColumn: this.hasFixColumn,
      horizonScroll: this.horizonScroll,
      /* from `./mixins/withSelection.js` */
      // isSelectionMode: this.isSelectionMode,
      /* from `./mixins/withExpansion.js` */
      // isExpansionMode: this.isExpansionMode,
      // flattenColumns: this.flattenColumns,

      // Internal state
      // columnsKey: this.columnsKey,
      scrollbarSize: getScrollBarSize(),

      // Callback method
      onColumnResize: this.onColumnResize,

      // Operations method
      store: {
        isRowExpanded: this.isRowExpanded,
        toggleRowExpansion: this.toggleRowExpansion,
        toggleExpandAll: this.toggleExpandAll,
        toggleExpandDepth: this.toggleExpandDepth,

        isRowSelected: this.isRowSelected,
        toggleRowSelection: this.toggleRowSelection
      }
    }
  },

  data() {
    // NOTE: 必须返回空对象，用以给其他组件 Mixin
    // 否则会报错 Vue mixin mergeOptions 会报错
    return {
      pingedLeft: false,
      pingedRight: false,
      componentWidth: 0,
      colWidths: {
        /* [columnKey as string]: number */
      }
    }
  },

  // 计算属性是基于它们的响应式依赖进行缓存的，只在相关响应式依赖发生改变时它们才会重新求值
  computed: {
    hasData() {
      return isValidArray(this.dataSource)
    },
    currentData() {
      // virtualized & virtualizedData FROM `mixins/withVirtualization`
      return this.virtualized ? this.virtualizedData : this.dataSource
    },
    fixHeader() {
      return !!(this.hasData && this.scroll && this.scroll.y)
    },
    horizonScroll() {
      return !!(this.scroll && this.scroll.x)
    },
    flattenColumns() {
      return flatColumns(this.columns, this.direction)
    },
    stickyOffsets() {
      return getStickyOffset(
        this.columnsWidths,
        this.flattenColumns.length,
        this.direction
      )
    },
    fixedInfoList() {
      return this.flattenColumns.map((_, colIndex) =>
        getCellFixedInfo(
          colIndex,
          colIndex,
          this.flattenColumns,
          this.stickyOffsets,
          this.direction
        )
      )
    },
    columnsKey() {
      return getColumnsKey(this.flattenColumns)
    },
    columnsWidths() {
      return this.columnsKey.map((key) => this.colWidths[key])
    },
    hasFixColumn() {
      return this.flattenColumns.some((column) => column.fixed)
    },
    hasFixLeftColumn() {
      return !!(this.flattenColumns[0] && this.flattenColumns[0].fixed)
    },
    hasFixRightColumn() {
      const lastIndex = this.flattenColumns.length - 1

      return (
        this.flattenColumns[lastIndex] &&
        this.flattenColumns[lastIndex].fixed === 'right'
      )
    },
    finalTableLayout() {
      const { tableLayout, fixHeader, hasFixColumn, flattenColumns } = this

      if (tableLayout) {
        return tableLayout
      }

      if (
        fixHeader ||
        hasFixColumn ||
        flattenColumns.some(({ ellipsis }) => ellipsis)
      ) {
        return 'fixed'
      }

      return 'auto'
    }
  },

  watch: {
    components(value) {
      this.tableComponents = Object.assign({}, TableComponents, value)
    }
  },

  created() {
    // this.scrollbarSize = getScrollBarSize()
    this.tableComponents = Object.assign({}, TableComponents, this.components)

    // It is just a flag to cache the value
    // and used for do not update view instantly
    this.columnsWidthCache = []
    this.debouncedUpdateColumn = debounce(this.updateColumnResize, 16)
  },

  beforeDestroy() {
    this.rowKeyCache = null
    this.tableComponents = null
    this.columnsWidthCache = null
  },

  methods: {
    /**
     * getRowKey
     * @param {RowModel} row
     * @param {number} index
     * @returns {string|number}
     */
    getRowKey(row, index) {
      /**
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
       * https://academia.stackexchange.com/questions/149620/sharing-with-research-team-about-being-affected-by-a-natural-disaster
       */
      const cache = this.rowKeyCache || (this.rowKeyCache = new WeakMap())

      if (cache.has(row)) {
        return cache.get(row)
      } else {
        const key = getRowKey(row, index, this.rowKey)
        cache.set(row, key)

        return key
      }
    },

    renderBlock(block, name) {
      const content =
        typeof block === 'function' ? block(this.dataSource) : block
      const height = this.scroll.y
      let style = {}

      if (name === 'placeholder' && height) {
        style = {
          height: height + 'px'
        }
      }

      return content ? (
        <div key={name} class={`${this.prefixCls}-${name}`} style={style}>
          {content}
        </div>
      ) : null
    },

    renderEmptyText() {
      const {
        locale: { emptyText },
        dataSource
      } = this

      if (dataSource.length) {
        return null
      }

      return this.renderBlock(
        this.$slots.empty ? this.$slots.empty : emptyText,
        'placeholder'
      )
    },

    setScrollTarget(target) {
      const timerId = setTimeout(() => {
        this.scrollTarget = target

        const clearRafId = useRaf(() => {
          this.scrollTarget = null

          clearTimeout(timerId)
          clearRafId()
        })
      })
    },

    onFullTableResize({ width }) {
      this.triggerOnScroll()

      const { fullTableRef } = this.$refs

      this.componentWidth = fullTableRef ? fullTableRef.offsetWidth : width
      this.updateVirtualizedData(true)
    },

    triggerOnScroll() {
      const { scrollBodyRef } = this.$refs

      if (scrollBodyRef) {
        this.onScroll({ currentTarget: scrollBodyRef })
      }
    },

    onScroll({ currentTarget, scrollLeft, scrollTop }) {
      const mergedScrollLeft = isNumber(scrollLeft)
        ? scrollLeft
        : currentTarget.scrollLeft
      const mergedScrollTop = isNumber(scrollTop)
        ? scrollTop
        : currentTarget.scrollTop

      const compareTarget = currentTarget || undefined
      const { scrollHeaderRef, scrollBodyRef } = this.$refs

      if (compareTarget === scrollBodyRef && isNumber(mergedScrollTop)) {
        // from `./mixins/withVirtualization.js`
        this.updateVirtualizedData(mergedScrollTop)
      }

      if (!this.scrollTarget || this.scrollTarget === compareTarget) {
        this.setScrollTarget(compareTarget)

        forceScroll(mergedScrollLeft, scrollHeaderRef)
        forceScroll(mergedScrollLeft, scrollBodyRef)
      }

      if (currentTarget) {
        const { scrollWidth, clientWidth } = currentTarget

        this.pingedLeft = mergedScrollLeft > 0
        this.pingedRight = mergedScrollLeft < scrollWidth - clientWidth
      }
    },

    /**
     * onColumnResize
     * @param {string} columnKey
     * @param {number} width
     */
    onColumnResize(columnKey, width) {
      this.columnsWidthCache = {
        ...this.columnsWidthCache,
        [columnKey]: width
      }

      this.debouncedUpdateColumn()
    },

    updateColumnResize() {
      console.time('cancelRef')
      const cancelRef = useRaf(() => {
        this.colWidths = {
          ...this.columnsWidthCache
        }

        console.time('cancelRefAgain')
        const cancelRefAgain = useRaf(() => {
          cancelRef()
          cancelRefAgain()
          console.timeEnd('cancelRef')
          console.timeEnd('cancelRefAgain')
        })

        isFunction(this.debouncedUpdateColumn.cancel) &&
          this.debouncedUpdateColumn.cancel()
      })
    }
  },

  render() {
    const {
      // Table Props
      prefixCls,
      direction,
      bordered,
      size,
      scroll,
      columns,
      components,
      showHeader,
      expandable = {},

      // Internal data
      colWidths,
      pingedLeft,
      pingedRight,
      componentWidth,

      // Computed Properties
      hasData,
      fixHeader,
      columnsKey,
      currentData,
      virtualized /* `mixins/withVirtualization` */,
      hasFixColumn,
      columnsWidths,
      horizonScroll,
      stickyOffsets,
      fixedInfoList,
      flattenColumns,
      // isSelectionMode /* from `./mixins/withSelection.js` */,
      // isExpansionMode /* from `./mixins/withExpansion.js` */,
      expandedRowKeys /* from `./mixins/withExpansion.js` */,
      finalTableLayout: tableLayout,
      hasFixLeftColumn,
      hasFixRightColumn,

      // Panel block
      title,
      footer
    } = this

    const { table: TableComponent } = components
    const { rowExpandable, childrenColumnName = 'children' } = expandable

    const fixColumn = horizonScroll && hasFixColumn
    const hasFixLeft = hasFixLeftColumn
    const hasFixRight = hasFixRightColumn

    let scrollXStyle
    let scrollYStyle
    let scrollTableStyle

    if (fixHeader) {
      scrollYStyle = {
        overflowY: 'scroll',
        maxHeight: scroll.y + 'px'
      }
    }

    if (horizonScroll) {
      scrollXStyle = { overflowX: 'scroll' }

      // When no vertical scrollbar, should hide it
      if (!fixHeader) {
        scrollYStyle = { overflowY: 'hidden' }
      }

      scrollTableStyle = {
        width:
          scroll.x === true
            ? 'auto'
            : isNumber(scroll.x)
            ? scroll.x + 'px'
            : scroll.x,
        minWidth: '100%'
      }
    }

    let groupTableNode
    const emptyNode = hasData ? null : this.renderEmptyText()
    const headerProps = {
      props: {
        // colWidths,
        columCount: flattenColumns.length,
        stickyOffsets,
        columns,
        flattenColumns
      }
    }

    const bodyTable = (
      <Body
        data={currentData}
        columnsKey={columnsKey}
        stickyOffsets={stickyOffsets}
        fixedInfoList={fixedInfoList}
        flattenColumns={flattenColumns}
        expandedKeys={expandedRowKeys}
        rowExpandable={rowExpandable}
        componentWidth={componentWidth}
        measureColumnWidth={fixHeader || horizonScroll}
        childrenColumnName={childrenColumnName}
        emptyNode={emptyNode}
        // onRow={onRow}
      />
    )

    const bodyColGroup = (
      <ColGroup
        colWidths={flattenColumns.map(({ width }) => width)}
        columns={flattenColumns}
      />
    )

    if (fixHeader) {
      const tableNode = (
        <TableComponent
          style={{
            ...scrollTableStyle,
            tableLayout
          }}
        >
          {bodyColGroup}
          {bodyTable}
        </TableComponent>
      )

      groupTableNode = [
        /* Header Table */
        showHeader !== false && (
          <div
            style={{
              overflow: 'hidden'
            }}
            onScroll={this.onScroll}
            ref="scrollHeaderRef"
            class={`${prefixCls}-header`}
          >
            {
              <FixedHeader
                {...headerProps}
                direction={direction}
                colWidths={columnsWidths}
              />
            }
          </div>
        ),

        /* Body Table */
        <div
          style={{
            ...scrollXStyle,
            ...scrollYStyle
          }}
          onScroll={this.onScroll}
          ref="scrollBodyRef"
          class={`${prefixCls}-body`}
        >
          {virtualized ? this.renderVirtualizedWrapper(tableNode) : tableNode}
        </div>
      ]
    } else {
      groupTableNode = (
        <div
          style={{
            ...scrollXStyle,
            ...scrollYStyle
          }}
          class={`${prefixCls}-content`}
          onScroll={this.onScroll}
          ref="scrollBodyRef"
        >
          <TableComponent style={{ ...scrollTableStyle, tableLayout }}>
            {bodyColGroup}
            {showHeader !== false && (
              <Header
                colWidths={colWidths}
                columCount={flattenColumns.length}
                stickyOffsets={stickyOffsets}
                {...headerProps}
              />
            )}
            {bodyTable}
          </TableComponent>
        </div>
      )
    }

    let fullTable = (
      <div
        class={[
          prefixCls,
          size && size !== 'default' && `${prefixCls}-${size}`,
          tableLayout === 'fixed' && `${prefixCls}-layout-fixed`,
          !hasData && `${prefixCls}-empty`,
          bordered && `${prefixCls}-bordered`,
          pingedLeft && `${prefixCls}-ping-left`,
          pingedRight && `${prefixCls}-ping-right`,
          fixHeader && `${prefixCls}-fixed-header`,
          hasFixLeft && `${prefixCls}-has-fix-left`,
          hasFixRight && `${prefixCls}-has-fix-right`,
          virtualized && `${prefixCls}-virtualized`,
          /** No used but for compatible */
          fixColumn && `${prefixCls}-fixed-column`,
          horizonScroll && `${prefixCls}-scroll-horizontal`
        ]}
        ref="fullTableRef"
      >
        {title && this.renderBlock(title, 'title')}

        <div class={`${prefixCls}-container`}>{groupTableNode}</div>

        {footer && this.renderBlock(footer, 'footer')}
      </div>
    )

    if (horizonScroll) {
      fullTable = (
        <ResizeObserver onResize={this.onFullTableResize}>
          {fullTable}
        </ResizeObserver>
      )
    }

    return fullTable
  }
}
