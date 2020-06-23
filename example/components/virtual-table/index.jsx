/**
 * Forked from `antd-vue/vc-table`
 * @auth Vuchan
 * @email <givingwu@gmail.com>
 */
// import PropTypes from 'vue-types'
import './table.css'
import { TableProps } from './interface'
import fastDeepEqual from 'fast-deep-equal'
import {
  STYLE_INNER,
  STYLE_WRAPPER,
  DEFAULT_LOCALE,
  DEFAULT_COMPONENTS
} from './constants'
import { on, off } from './helpers/dom'
import createStore from './helpers/store/createStore'
import ColumnManager from './helpers/ColumnManager'
import TableStateManager from './helpers/TableStateManager'
import { measureScrollbar } from './helpers/dom/scrollbar-width'
import { debounce, deepMerge, initDefaultProps } from './helpers/utils/index'
import Column from './Column'
import ColGroup from './ColGroup'
import TableBody from './TableBody'
import TableHeader from './TableHeader'
import ColumnGroup from './ColumnGroup'

export default {
  name: 'VirtualTable',

  props: {
    ...initDefaultProps(TableProps, {
      rowKey: 'key',
      prefixCls: 'vc-table',
      scroll: {},
      bodyStyle: {},
      dataSource: [],
      showHeader: true,
      rowClassName: () => '',
      locale: DEFAULT_LOCALE,
      components: DEFAULT_COMPONENTS,
      defaultExpandAllRows: false,
      title: () => null,
      footer: () => null
    })
  },

  Column,
  ColumnGroup,

  provide() {
    return {
      table: this
    }
  },

  data() {
    // store 用于保存一些内部私有、但需要被实时反应的值
    const store = createStore({
      currentHoveredKey: '',
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsBodyRowsHeight: {}
    })
    this.store = store
    this.columnManager = new ColumnManager(this.columns)

    // state 用于保存一些外部公共、需要暴露的等通过 Vue 更新 view 的值
    const state = new TableStateManager(this.$props)

    const data = {
      sComponents: this.mergeDefaultComponents(this.components),
      scrollPosition: 'left',
      stateManager: state
    }

    if (this.useVirtual) {
      data.visibleDataRange = []
      data.scrollToRow = 0
      data.innerRowHeight = this.rowHeight
    }

    return data
  },

  computed: {
    hasScrollX() {
      return 'x' in this.scroll
    },

    dataSourceLength() {
      return this.stateManager.dataSource.length
    },

    useVirtualScroll() {
      return (
        this.useVirtual &&
        this.scroll &&
        this.dataSource &&
        this.dataSource.length > 0
      )
    },

    virtualViewWrapperSize() {
      return (
        this.useVirtualScroll && this.dataSourceLength * this.innerRowHeight
      )
    },

    virtualViewScrollTop() {
      return this.useVirtualScroll ? this.scrollToRow * this.innerRowHeight : 0
    },

    virtualVisibleItemsSize() {
      return (
        this.useVirtualScroll && Math.ceil(this.scroll.y / this.innerRowHeight)
      )
    }
  },

  watch: {
    components(value) {
      this.sComponents = this.mergeDefaultComponents(value)
    },

    columns(val) {
      if (val) {
        this.columnManager.reset(val)
      }
    },

    dataSource(value) {
      this.stateManager.setState({ dataSource: value })

      if (value.length === 0 && this.hasScrollX) {
        this.$nextTick(() => {
          this.resetScrollX()
        })
      } else {
        if (this.useVirtualScroll) {
          this.updatePoolData(this.lastScrollTop, true)
        }
      }
    },

    // fix: 当 tableHeight 变化时数据需要被更新
    'scroll.y'(curr, prev) {
      if (curr && prev && curr !== prev && this.stateManager) {
        this.stateManager._updateSideEffects()
      }
    },

    'stateManager.dataSource'() {
      this.updatePoolData(this.lastScrollTop, true)
    }
  },

  created() {
    const { useVirtual, rowHeight, scroll = {} } = this.$props

    if (useVirtual && !scroll.y) {
      throw new ReferenceError(
        `When open 'useVirtual' mode the property 'scroll.y' must be set as number to calculates how many items should be render in table!`
      )
    }

    if (useVirtual && !rowHeight) {
      throw new ReferenceError(
        `When open 'useVirtual' mode the property 'rowHeight' must be set as number to fix the height of per table row!`
      )
    }

    this.setScrollPosition('left')
    this.debouncedWindowResize = debounce(this.handleWindowResize, 150)

    this.stateManager &&
      this.stateManager._sideEffectKeys.forEach((effect) => {
        this.$watch(effect, (value) => {
          this.stateManager.setState({ [effect]: value })
        })
      })
  },

  mounted() {
    const { headTable, bodyTable } = this.$refs

    if (this.hasVirtualData) {
      this.lastScrollTop = bodyTable.scrollTop
    }

    this.$nextTick(() => {
      if (this.columnManager.isAnyColumnsFixed()) {
        this.handleWindowResize()
        this.resizeEvent = on(window, 'resize', this.debouncedWindowResize)
      }

      // https://github.com/ant-design/ant-design/issues/11635
      if (headTable) {
        headTable.scrollLeft = 0
      }

      if (bodyTable) {
        bodyTable.scrollLeft = 0
      }

      this.$__ready &&
        this.useVirtualScroll &&
        this.$nextTick(this.updatePoolData)
    })

    this.$__ready = true
  },

  updated() {
    this.$nextTick(() => {
      if (this.columnManager.isAnyColumnsFixed()) {
        this.handleWindowResize()

        if (!this.resizeEvent) {
          on(window, 'resize', this.debouncedWindowResize)
          this.resizeEvent = true
        }
      }
    })
  },

  beforeDestroy() {
    if (this.resizeEvent) {
      off(window, 'resize', this.debouncedWindowResize)
      this.resizeEvent = null
    }

    if (this.debouncedWindowResize) {
      this.debouncedWindowResize.cancel()
    }

    if (this.stateManager) {
      this.stateManager.clearSideEffects()
      this.stateManager = null
    }

    this.columnManager = null
  },

  methods: {
    mergeDefaultComponents(components = {}) {
      return deepMerge({}, DEFAULT_COMPONENTS, components)
    },

    resetScrollX() {
      const { headTable, bodyTable } = this.$refs

      if (headTable && headTable.scrollLeft) {
        headTable.scrollLeft = 0
      }

      if (bodyTable && bodyTable.scrollLeft) {
        bodyTable.scrollLeft = 0
      }
    },

    getRowKey() {
      return this.stateManager.getRowKey.apply(this, arguments)
    },

    getVisibleRange({
      offset = 0, // number
      overscanCount = 3 // number
    }) {
      const start = Math.floor(offset / this.innerRowHeight)

      return {
        start,
        stop: start + this.virtualVisibleItemsSize + overscanCount
      }
    },

    handleBodyScroll(e) {
      this.handleBodyScrollLeft(e)

      if (this.lastScrollTop && e.target.scrollTop === this.lastScrollTop) {
        return
      }

      if (this.useVirtualScroll) {
        this.handleVirtualScrollTop(e)
      } else {
        this.handleBodyScrollTop(e)
      }
    },

    /* https://github.com/vuchan/vue-virtual-list/blob/master/src/VirtualList/List.vue#L148 */
    handleVirtualScrollTop(e) {
      this.handleBodyScrollTop(e)
      this.updatePoolData(e.target.scrollTop)
    },

    updatePoolData(scrollTop = 0, forceUpdate) {
      if (!this.$__ready) return

      const { start, stop } = this.getVisibleRange({
        offset: scrollTop,
        overscanCount: this.overscanCount
      })

      /* 当前列表的索引发生实际变化时才进行切片触发更新 */
      const shouldUpdate = this.$__prevStartIndex !== start
      if (!shouldUpdate && !forceUpdate) return

      this.$__prevStartIndex = start

      this.scrollToRow = Math.floor(scrollTop / this.innerRowHeight)
      this.visibleDataRange = this.stateManager.dataSource.slice(start, stop)
    },

    handleBodyScrollTop(e) {
      const target = e.target

      // Fix https://github.com/ant-design/ant-design/issues/9033
      if (e.currentTarget !== target) {
        return
      }

      const { scroll = {} } = this
      const {
        headTable,
        bodyTable,
        fixedColumnsBodyLeft,
        fixedColumnsBodyRight
      } = this.$refs

      if (
        target.scrollTop !== this.lastScrollTop &&
        scroll.y &&
        target !== headTable
      ) {
        const scrollTop = target.scrollTop

        if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
          fixedColumnsBodyLeft.scrollTop = scrollTop
        }

        if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
          fixedColumnsBodyRight.scrollTop = scrollTop
        }

        if (bodyTable && target !== bodyTable) {
          bodyTable.scrollTop = scrollTop
        }
      }

      // Remember last scrollTop for scroll direction detecting.
      this.lastScrollTop = target.scrollTop
    },

    handleBodyScrollLeft(e) {
      // Fix https://github.com/ant-design/ant-design/issues/7635
      if (e.currentTarget !== e.target) {
        return
      }

      const target = e.target
      const { scroll = {} } = this
      const { headTable, bodyTable } = this.$refs
      const scrollLeft = target.scrollLeft

      if (target === headTable || target === bodyTable) {
        if (scrollLeft !== this.lastScrollLeft && scroll.x) {
          if (target === bodyTable && headTable) {
            headTable.scrollLeft = scrollLeft
          } else if (headTable && bodyTable) {
            bodyTable.scrollLeft = scrollLeft
          }

          this.setScrollPositionClassName()
        }

        // Remember last scrollLeft for scroll direction detecting.
        this.lastScrollLeft = scrollLeft
      }
    },

    handleWindowResize() {
      this.syncFixedTableRowHeight()
      this.setScrollPositionClassName()
    },

    syncFixedTableRowHeight() {
      const tableNode = this.$refs.tableNode
      const tableRect =
        tableNode &&
        tableNode instanceof HTMLElement &&
        tableNode.getBoundingClientRect()

      // If tableNode's height less than 0, suppose it is hidden and don't recalculate rowHeight.
      // see: https://github.com/ant-design/ant-design/issues/4836
      if (
        tableRect &&
        tableRect.height !== undefined &&
        tableRect.height <= 0
      ) {
        return
      }

      const { prefixCls } = this
      const { headTable, bodyTable } = this.$refs
      const headRows = headTable
        ? headTable &&
          headTable instanceof HTMLElement &&
          headTable.querySelectorAll('thead')
        : bodyTable &&
          bodyTable instanceof HTMLElement &&
          bodyTable.querySelectorAll('thead')

      const bodyRows = bodyTable.querySelectorAll(`.${prefixCls}-row`) || []
      const fixedColumnsHeadRowsHeight = [].map.call(
        headRows,
        (row) => row.getBoundingClientRect().height || 'auto'
      )

      const state = this.store.getState()
      const fixedColumnsBodyRowsHeight = [].reduce.call(
        bodyRows,
        (acc, row) => {
          const rowKey = row.getAttribute('data-row-key')
          const height =
            row.getBoundingClientRect().height ||
            state.fixedColumnsBodyRowsHeight[rowKey] ||
            'auto'
          acc[rowKey] = height
          return acc
        },
        {}
      )

      const maxHeight = Math.max(
        ...Object.values(fixedColumnsBodyRowsHeight),
        this.innerRowHeight
      )

      if (maxHeight > this.innerRowHeight) {
        this.innerRowHeight = maxHeight
      }

      if (
        fastDeepEqual(
          state.fixedColumnsHeadRowsHeight,
          fixedColumnsHeadRowsHeight
        ) &&
        fastDeepEqual(
          state.fixedColumnsBodyRowsHeight,
          fixedColumnsBodyRowsHeight
        )
      ) {
        return
      }

      this.store.setState({
        fixedColumnsHeadRowsHeight,
        fixedColumnsBodyRowsHeight
      })
    },

    setScrollPositionClassName() {
      const node = this.$refs.bodyTable
      const scrollToLeft = node.scrollLeft === 0
      const firstTableChild = node.querySelector('table')
      const tableWidth = firstTableChild.getBoundingClientRect().width
      const nodeWidth = node.getBoundingClientRect().width
      const scrollToRight = node.scrollLeft + 1 >= tableWidth - nodeWidth

      if (scrollToLeft && scrollToRight) {
        this.setScrollPosition('both')
      } else if (scrollToLeft) {
        this.setScrollPosition('left')
      } else if (scrollToRight) {
        this.setScrollPosition('right')
      } else if (this.scrollPosition !== 'middle') {
        this.setScrollPosition('middle')
      }
    },

    setScrollPosition(position) {
      const { prefixCls } = this
      const { tableNode } = this.$refs
      this.scrollPosition = position

      if (tableNode) {
        const classes = tableNode.classList

        if (position === 'both') {
          classes.remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          classes.add(`${prefixCls}-scroll-position-left`)
          classes.add(`${prefixCls}-scroll-position-right`)
        } else {
          classes.remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          classes.add(`${prefixCls}-scroll-position-${position}`)
        }
      }
    },

    handleWheel(event) {
      const { scroll = {} } = this.$props

      if (window.navigator.userAgent.match(/Trident\/7\./) && scroll.y) {
        event.preventDefault()
        const wd = event.deltaY
        const target = event.target
        const {
          bodyTable,
          fixedColumnsBodyLeft,
          fixedColumnsBodyRight
        } = this.$refs

        let scrollTop = 0

        if (this.lastScrollTop) {
          scrollTop = this.lastScrollTop + wd
        } else {
          scrollTop = wd
        }

        if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
          fixedColumnsBodyLeft.scrollTop = scrollTop
        }

        if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
          fixedColumnsBodyRight.scrollTop = scrollTop
        }

        if (bodyTable && target !== bodyTable) {
          bodyTable.scrollTop = scrollTop
        }
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

    renderMainTable() {
      const { scroll, prefixCls } = this
      const isAnyColumnsFixed = this.columnManager.isAnyColumnsFixed()
      const scrollable = isAnyColumnsFixed || scroll.x || scroll.y

      const table = [
        this.renderTable({
          columns: this.columnManager.groupedColumns(),
          isAnyColumnsFixed
        }),
        this.renderEmptyText()
      ]

      return scrollable ? (
        <div class={`${prefixCls}-scroll`}>{table}</div>
      ) : (
        table
      )
    },

    renderLeftFixedTable() {
      const { prefixCls } = this

      return (
        <div class={`${prefixCls}-fixed-left`}>
          {this.renderTable({
            columns: this.columnManager.leftColumns(),
            fixed: 'left'
          })}
        </div>
      )
    },

    renderRightFixedTable() {
      const { prefixCls } = this

      return (
        <div class={`${prefixCls}-fixed-right`}>
          {this.renderTable({
            columns: this.columnManager.rightColumns(),
            fixed: 'right'
          })}
        </div>
      )
    },

    renderTable(options) {
      return [this.renderHeadTable(options), this.renderBodyTable(options)]
    },

    renderHeadTable(options) {
      const { columns, fixed /* isAnyColumnsFixed */ } = options
      const {
        prefixCls,
        scroll = {},
        showHeader,
        useVirtualScroll,
        handleBodyScrollLeft
      } = this
      const tableClassName = scroll.x || fixed ? `${prefixCls}-fixed` : ''
      const headStyle = {}

      if (scroll.y) {
        // Add negative margin bottom for scroll bar overflow bug
        const scrollbarWidth = measureScrollbar('horizontal')

        if (scrollbarWidth > 0 && !fixed) {
          // headStyle.marginBottom = `-${scrollbarWidth}px`
          // headStyle.paddingBottom = '0px'

          // 修复在使用虚拟滚动后，VirtualWrapper 出现右侧滚动条后，
          // HeadTable clientWidth 缺少了 scrollbarWidth 导致
          // HeadTable & BodyTable 滚动无法对齐的问题
          if (useVirtualScroll) {
            headStyle.marginRight = `${scrollbarWidth}px`
          }
        }
      }

      if (!showHeader) {
        return null
      }

      return (
        <div
          key="headTable"
          ref={fixed ? null : 'headTable'}
          class={`${prefixCls}-header`}
          style={headStyle}
          onScroll={handleBodyScrollLeft}
        >
          {this.renderBaseTable({
            tableClassName,
            fixed: fixed,
            columns: columns,
            hasHead: true,
            hasBody: false
          })}
        </div>
      )
    },

    renderBodyTable(options) {
      const { columns, fixed } = options
      const {
        scroll,
        dataSource,
        prefixCls,
        handleWheel,
        handleBodyScroll
        /* getRowKey */
      } = this
      const hasDataSource = dataSource && dataSource.length
      const tableClassName = scroll.x || fixed ? `${prefixCls}-fixed` : ''

      let useFixedHeader = false
      const bodyStyle = { ...this.bodyStyle }
      const innerBodyStyle = {}

      if ((scroll.x || fixed) && hasDataSource) {
        bodyStyle.overflowX = bodyStyle.overflowX || 'scroll'
        // Fix weired webkit render bug
        // https://github.com/ant-design/ant-design/issues/7783
        bodyStyle.WebkitTransform = 'translate3d (0, 0, 0)'
      }

      if (scroll.y) {
        // maxHeight will make fixed-Table scrolling not working
        // so we only set maxHeight to body-Table here
        let maxHeight = bodyStyle.maxHeight || scroll.y
        maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

        if (fixed) {
          innerBodyStyle.maxHeight = maxHeight
          innerBodyStyle.overflowY = bodyStyle.overflowY || 'scroll'
        } else {
          bodyStyle.maxHeight = maxHeight
        }

        bodyStyle.overflowY = bodyStyle.overflowY || 'scroll'
        useFixedHeader = true

        // Add negative margin bottom for scroll bar overflow bug
        const scrollbarWidth = measureScrollbar()

        if (scrollbarWidth > 0 && fixed && hasDataSource) {
          bodyStyle.marginBottom = `-${scrollbarWidth}px`
          bodyStyle.paddingBottom = '0px'
        }
      }

      let baseTable = this.renderBaseTable({
        ...options,
        tableClassName,
        hasHead: !useFixedHeader,
        hasBody: true
      })

      if (fixed && columns.length) {
        let refName

        if (columns[0].fixed === 'left' || columns[0].fixed === true) {
          refName = 'fixedColumnsBodyLeft'
        } else if (columns[0].fixed === 'right') {
          refName = 'fixedColumnsBodyRight'
        }

        delete bodyStyle.overflowX
        delete bodyStyle.overflowY

        return (
          <div
            key="bodyTable"
            class={`${prefixCls}-body-outer`}
            style={{ ...bodyStyle }}
          >
            <div
              class={`${prefixCls}-body-inner`}
              style={innerBodyStyle}
              ref={refName}
              onWheel={handleWheel}
              onScroll={handleBodyScroll}
            >
              {this.useVirtualScroll
                ? this.renderVirtualWrapper(baseTable)
                : baseTable}
            </div>
          </div>
        )
      }

      return (
        <div
          key="bodyTable"
          class={`${this.prefixCls}-body`}
          style={bodyStyle}
          ref="bodyTable"
          onWheel={handleWheel}
          onScroll={handleBodyScroll}
        >
          {this.useVirtualScroll
            ? this.renderVirtualWrapper(baseTable)
            : baseTable}
        </div>
      )
    },

    renderBaseTable(options = {}) {
      const { tableClassName, hasHead, hasBody, fixed, columns } = options
      const { prefixCls, showHeader, scroll, sComponents: components } = this
      const tableStyle = {}

      if (!fixed && scroll.x) {
        // not set width, then use content fixed width
        if (scroll.x === true) {
          tableStyle.tableLayout = 'fixed'
        } else {
          tableStyle.width =
            typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x
        }
      }

      const Table = hasBody ? components.table : 'table'
      const listeners = {
        on: this.$listeners
      }

      const component = (
        <Table class={tableClassName} style={tableStyle} key="table">
          <ColGroup columns={columns} fixed={fixed} />

          {hasHead && (
            <TableHeader
              fixed={fixed}
              store={this.store}
              columns={columns}
              prefixCls={prefixCls}
              showHeader={showHeader}
              components={components}
            />
          )}

          {hasBody && (
            <TableBody
              fixed={fixed}
              store={this.store}
              rows={
                this.useVirtualScroll ? this.visibleDataRange : this.dataSource
              }
              getRowKey={this.getRowKey}
              columns={columns}
              components={components}
              {...listeners}
            ></TableBody>
          )}
        </Table>
      )

      return component
    },

    renderVirtualWrapper(baseTable) {
      return (
        <div
          class={`${this.prefixCls}-virtual-wrapper`}
          style={{
            ...STYLE_WRAPPER,
            height: this.virtualViewWrapperSize + 'px'
          }}
        >
          <div
            class={`${this.prefixCls}-virtual-inner`}
            style={{
              ...STYLE_INNER,
              transform: `translateY(${this.virtualViewScrollTop}px)`
            }}
          >
            {baseTable}
          </div>
        </div>
      )
    }
  },

  render() {
    const {
      size,
      bordered,
      useVirtual,
      dataSource,
      prefixCls,
      scroll
    } = this.$props
    const { title, footer } = this.$slots
    let className = prefixCls

    if (this.scrollPosition === 'both') {
      className += ` ${prefixCls}-scroll-position-left ${prefixCls}-scroll-position-right`
    } else {
      className += ` ${prefixCls}-scroll-position-${this.scrollPosition}`
    }

    const hasDataSource = dataSource && dataSource.length
    const hasLeftFixed = this.columnManager.isAnyColumnsLeftFixed()
    const hasRightFixed = this.columnManager.isAnyColumnsRightFixed()
    const attributes = {
      on: { ...this.$listeners },
      style: { ...this.$props.style },
      attrs: { ...this.$attrs }
    }

    return (
      <div class={`${prefixCls}-wrapper`}>
        <div
          class={[
            className,
            {
              [`${prefixCls}-${size}`]: size,
              [`${prefixCls}-empty`]: !hasDataSource,
              [`${prefixCls}-virtual`]: useVirtual,
              [`${prefixCls}-bordered`]: bordered,
              [`${prefixCls}-fixed-header`]: scroll && scroll.y,
              [`${prefixCls}-layout-fixed`]: hasLeftFixed || hasRightFixed
            }
          ]}
          ref="tableNode"
          {...attributes}
        >
          {title && this.renderBlock(title, 'title')}

          <div class={`${prefixCls}-content`}>
            {this.renderMainTable()}
            {hasLeftFixed && this.renderLeftFixedTable()}
            {hasRightFixed && this.renderRightFixedTable()}
          </div>

          {footer && this.renderBlock(footer, 'footer')}
        </div>
      </div>
    )
  }
}
