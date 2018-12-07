<template>
<div class="el-table"
  :class="[{
    'el-table--fit': fit,
    'el-table--border': border,
    'el-table--hidden': isHidden,
    'el-table--fluid-height': maxHeight,
    'el-table--enable-row-hover': enableHover,
  }, tableSize ? `el-table--${ tableSize }` : '']"
>
  <table class="el-table" width="100%" :height="height">
    <thead
      v-if="showHeader"
      cellspacing="0"
      cellpadding="0"
      border="0"
      class="el-table__header"
    >
      <tr class="el-table__row" :class="rowClassName">
        <th
          v-for="({ prop, label, key }) of computedColumns"
          :key="key || prop || label"
          colspan="1"
          rowspan="1"
          class="is-leaf"
        >
          <div class="cell">{{label}}</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in tableData"
        v-if="item._parent ? item._parent._expand && item._show : item._show"
        :key="item[rowKey] || index"
        class='el-table__row'
        :class="[rowClassName, typeof item._expand !== 'undefined' ? 'el-table__expandable' : 'el-table__check-box']"
        @click="() => toggleChildren(item, index)"
      >
        <td
          :class="[ typeof item._expand !== 'undefined' ? 'el-table__expand-box' : 'el-table__check-box', ]"
          :style="`padding-left: ${item._depth * expandSpace}px`"
          rowspan="1"
          colspan="1"
        >
          <div class="cell">
            <div
              v-if="item.children && item.children.length"
              :class="[
                'el-table__expand-icon',
              ]"
            >
              <i :class="['el-icon-arrow-right', item._expand ? 'el-table__icon-rotate' : '']"></i>
            </div>

            <el-checkbox
              v-if="(!item.children || !item.children.length) && showCheckbox"
              :disabled="item._disable"
              :true-label="item[rowKey]"
              :false-label="null"
              @change="handleCheckboxChange"
            />
            <!-- v-model="selectedValue" :value="item[rowKey]" -->
          </div>
        </td>
        <td
          v-for="({ prop, key, label }) of columns"
          :key="key || prop || label"
          rowspan="1"
          colspan="1"
        >
          <div class="cell" v-if="item[prop]">
            <span>{{ typeof item[prop] !== 'string' ? prop : item[prop] }}</span>
            <!-- <span>{{String(item._expand)}}</span> -->
            <i v-if="editable && editableChecker(item, prop, index)"  @click="cellEditHandler(item, prop)" class="el-icon-edit"></i>
            <i v-if="deleteable && deleteableChecker(item, prop, index)" @click="cellDeleteHandler(item, prop)" class="el-icon-delete"></i>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
/**
 * 1. 实现树形结构数据在 table 中展开并递归渲染  OK
 * 2. 实现支持展开指定的 expandKeys  OK
 * 3. 实现父节点未展开时 子节点不被渲染   OK
 * 4. 结合 element-ui table 实现 X => only use its ui
 */
import { flattenArrayWithDepth } from './utils'
import TableState from './table-state'
// import { RecycleScroller } from 'vue-virtual-scroller'

export default {
  name: 'TreeTableView',
  components: {
    // RecycleScroller
  },
  props: {
    className: [String, Object],
    rowClassName: [String, Object, Function],
    styleStr: {
      type: String,
      default: 'width: 100%',
    },

    size: String,
    width: [String, Number],
    height: [String, Number],
    maxHeight: Number,

    rowKey: String,
    depth: Number,

    dataSource: Array,
    columns: Array,
    expandKeys: {
      type: Array,
      default() {
        return []
      }
    },
    expandSpace: {
      type: Number,
      default: 10,
    },
    expandDepth: {
      type: Number,
      default: 1,
    },
    showExpand: {
      type: Boolean,
      default: false,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    selectedRows: Array,
    showHeader: {
      type: Boolean,
      default: true,
    },
    fit: {
      type: Boolean,
      default: true,
    },
    border: {
      type: Boolean,
      default: false,
    },
    isHidden: Boolean,
    enableHover: {
      type: Boolean,
      default: true,
    },

    // 展开同级互斥
    rejectOther: Boolean,

    editable: Boolean,
    deleteable: Boolean,
    editableChecker: Function,
    deleteableChecker: Function,
    cellEditHandler: Function,
    cellDeleteHandler: Function,
  },
  data() {
    const store = new TableState({
      data: this.dataSource,
      columns: this.columns
    })

    return {
      // flattenData: flattenArrayWithDepth(this.dataSource).map(item => { (item._depth === 0 && !item._parent) && (item._show = true); return item }),
      maxDepth: flattenArrayWithDepth.max_depth + 1,
      store
    }
  },
  computed: {
    tableData() {
      return this.store.states.data;
    },
    selectedValue() {
      return this.selectedRows || []
    },
    tableSize() {
      return this.size || (this.$ELEMENT || {}).size;
    },
    computedColumns() {
      if (this.showExpand || this.showCheckbox) {
        const columns = JSON.parse(JSON.stringify(this.columns))

        // a null column to show checkbox or expand icon
        columns.splice(0, 0, {
          key: -9999,
          label: '',
          prop: '',
        })

        return columns;
      }
    }
  },
  watch: {
    dataSource: {
      immediate: true,
      handler(value) {
        this.store.setState({
          data: flattenArrayWithDepth(value)
            .map(item => {
              (item._depth === 0 && !item._parent) &&
              (item._show = true);
              return item
            }),
        });
      }
    },
    selectedValue(val) {
      this.$emit('update:selected-rows', val)
    },
    expandKeys(val) {
      if (!this.rowKey) throw new ReferenceError('If use `expandKeys`, must pass the `rowKey` property.')

      this.tableData.forEach(item => {
        if (val.includes(item[this.rowKey])) {
          item._expand = true
          item._show = true
          item.children && item.children.length && item.children.forEach(function(t) {
            t._show = true
          })
        }
      })
    },
  },
  methods: {
    handleCheckboxChange(value) {
      if (value) {
        this.selectedValue.push(value)
      } else {
        this.selectedValue.splice(this.selectedValue.indexOf(value), 1)
      }
    },
    toggleChildren(item) {
      if (!item.children || !item.children.length) return
      item._expand = !item._expand

      if (item._expand) {
        item.children && item.children.length && item.children.forEach(t => {
          t._show = true
        })
        this.$emit('expand', item[this.rowKey])
      } else {
        this.hideChildren(item)
        this.collapseChildren(item)
        this.$emit('collapse', item[this.rowKey])
      }
    },
    hideChildren(item) {
      item.children && item.children.length && item.children.forEach(t => {
        t._show = false
        if (t.children && t.children.length) {
          this.hideChildren(t)
        }
      })
    },
    collapseChildren(item) {
      item._expand = false
      item.children && item.children.length && item.children.forEach(t => {
        t._show = false
        if (t.children && t.children.length) {
          this.collapseChildren(t)
        }
      })
    }
  },
}
</script>

<style lang="less">
.align-center {
  text-align: center;
}

.el-table__check-box,
.el-table__expand-column {
  .align-center;
}

.el-table__expandable {
  cursor: pointer;
}

.el-table__icon-rotate {
  transition: transform .2s ease-in-out;
  transform: rotate(90deg);
}

.el-table--enable-row-hover tr:hover>td{
  background-color: #f5f7fa;
}
</style>
