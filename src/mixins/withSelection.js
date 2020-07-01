import { SINGLE_SELECTION_MODE } from '../interface'

export function data() {
  if (this.rowSelection) {
    const { selectedRowKeys = [] } = this.rowSelection || {}

    // The default select mode is `radio`
    if (!this.rowSelection.type) {
      this.rowSelection.type = SINGLE_SELECTION_MODE
    }

    return {
      // The below data will be passed in from component props
      selectedRowKeys
    }
  }
}

export const methods = {
  /**
   * 判断当前行是否是选中状态
   * @param {RowKey} rowKey
   */
  isRowSelected(rowKey) {
    return (this.selectedRowKeys || []).includes(this.adaptRowKey(rowKey))
  },

  /**
   * 当前行是否选中状态
   * @param {RowKey} rowKey
   */
  toggleRowSelection(rowKey, nativeEvent) {
    if (!rowKey) return

    let record = this.adaptKeyToRow(rowKey)
    rowKey = this.adaptRowKey(record)

    if (rowKey) {
      const { type, selectedRowKeys = [] } = this.rowSelection || {}
      let isSelected = false

      if (type === 'radio') {
        isSelected = this.isRowSelected(rowKey)

        if (isSelected) {
          this.selectedRowKeys = []
        } else {
          this.selectedRowKeys = [rowKey]
        }
      }

      if (type === 'checkbox') {
        isSelected = selectedRowKeys.includes(rowKey)

        if (isSelected) {
          selectedRowKeys.splice(selectedRowKeys.indexOf(rowKey), 1)
        } else {
          selectedRowKeys.push(rowKey)
        }

        this.selectedRowKeys = selectedRowKeys
      }

      const selected = !isSelected

      this.$emit(
        'select-change',
        record,
        selected,
        this.selectedRowKeys,
        nativeEvent
      )
    }
  }
}
