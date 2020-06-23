/* eslint-disable vue/require-default-prop */
import {
  TableProps,
  FUNC_PROP,
  ARRAY_PROP,
  NUMBER_PROP,
  BOOLEAN_FALSE_PROP
} from '../interface'
import BodyRow from './BodyRow'
import ExpandedRow from './ExpandedRow'
import ResizeObserver from 'vue-size-observer'

export default {
  name: 'Body',

  functional: true,

  inheritAttrs: false,

  inject: {
    getRowKey: FUNC_PROP,
    prefixCls: TableProps.prefixCls,
    components: TableProps.components,
    fixHeader: BOOLEAN_FALSE_PROP,
    horizonScroll: BOOLEAN_FALSE_PROP,
    onColumnResize: FUNC_PROP
  },

  props: {
    data: TableProps.dataSource,
    emptyNode: Object,
    columnsKey: ARRAY_PROP,
    expandedKeys: ARRAY_PROP,
    fixedInfoList: ARRAY_PROP,
    flattenColumns: TableProps.columns,
    componentWidth: NUMBER_PROP,
    measureColumnWidth: Boolean,
    childrenColumnName: String
  },

  render(h, { props, injections }) {
    const {
      data = [],
      emptyNode,
      columnsKey = [],
      expandedKeys,
      fixedInfoList,
      flattenColumns,
      componentWidth,
      measureColumnWidth,
      childrenColumnName
    } = props
    const {
      getRowKey,
      prefixCls,
      components,
      fixHeader,
      horizonScroll,
      onColumnResize
    } = injections

    const {
      wrapper: WrapperComponent,
      row: trComponent,
      cell: tdComponent
    } = components.body
    let rows = []

    if (data.length) {
      rows = data.map((record, index) => {
        const key = getRowKey(record, index)

        return [
          <BodyRow
            key={key}
            rowKey={key}
            record={record}
            recordKey={key}
            index={index}
            fixedInfoList={fixedInfoList}
            flattenColumns={flattenColumns}
            rowComponent={trComponent}
            cellComponent={tdComponent}
            // onRow={onRow}
            // rowExpandable={rowExpandable}
            expandedKeys={expandedKeys}
            childrenColumnName={childrenColumnName}
          />
        ]
      })
    } else {
      rows = (
        <ExpandedRow
          expanded
          class={`${prefixCls}-placeholder`}
          prefixCls={prefixCls}
          fixHeader={fixHeader}
          fixColumn={horizonScroll}
          horizonScroll={horizonScroll}
          component={trComponent}
          componentWidth={componentWidth}
          cellComponent={tdComponent}
          colSpan={flattenColumns.length}
          children={emptyNode}
        >
          {emptyNode}
        </ExpandedRow>
      )
    }

    return (
      <WrapperComponent class={`${prefixCls}-tbody`}>
        {/* Measure body column width with additional hidden col */}
        {measureColumnWidth && (
          <tr
            aria-hidden="true"
            class={`${prefixCls}-measure-row`}
            style={{ height: 0 }}
          >
            {columnsKey.map((columnKey) => (
              <ResizeObserver
                key={columnKey}
                on-resize={({ offsetWidth }) => {
                  requestAnimationFrame(() => {
                    onColumnResize(columnKey, offsetWidth)
                  })
                }}
              >
                <td style={{ padding: 0, border: 0, height: 0 }} />
              </ResizeObserver>
            ))}
          </tr>
        )}

        {rows}
      </WrapperComponent>
    )
  }
}
