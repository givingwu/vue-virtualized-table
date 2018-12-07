<script>
import { TableColumn } from 'element-ui'

// renderCell 函数，类型可扩展
const renderCell = {
  slots: function (h, data) {
    // 接受传入的renderCell函数
    let renderCell = () => {
      return this.renderCell ? this.renderCell(data) : ''
    }
    return <div class="cell">{ renderCell(h, data) }</div>
  }
}

export default {
  extends: TableColumn,// 继承el-table-column
  props: {
    prop: {
      type: [String, Number]
    },
    cellType: {
      type: String,
      validator: function (value) {
        let valid = ['text', 'input', 'slots'].includes(value)
        !valid && console.error(`columnPlus组件不适配 ${value} 类型`)
        return valid
      }
    },
    renderCell: {
      type: Function
    }
  },
  // el-table-column 先调用在调用本身的
  created () {
    if (renderCell[this.cellType]) {
      this.columnConfig.renderCell = renderCell[this.cellType].bind(this)
    }
  }
}
</script>
