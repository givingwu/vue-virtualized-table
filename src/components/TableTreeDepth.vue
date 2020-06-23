<template>
  <el-table
    style="width: 100%"
    class="el-table"
    ref="table"
    :fit="fit"
    :show-header="showHeader"
    :class="[
      className, {
      'el-table--fit': fit,
      'el-table--border': border,
      'el-table--hidden': isHidden,
      'el-table--fluid-height': maxHeight,
      'el-table--enable-row-hover': enableHover,
    }, tableSize ? `el-table--${ tableSize }` : '']"
    :row-key="rowKey"
    :cell-class-name="computedCellClassName"

    :expand-row-keys="expandRowKeys"
    :data="dataSource"

    @expand-change="handleExpandChange"
    @selection-change.self.capture="handleSelectionChange"
  >
    <el-table-column v-if="expand" type="expand">
      <template slot-scope="scope">
        <table-tree-depth
          :fit="fit"
          :className="className"
          :cell-class-name="cellClassName"
          :row-key="rowKey"
          :show-header="false"

          :data-source="scope.row.children || []"
          :parent-key="
            scope.row && typeof scope.row === 'object'
             ? scope.row[rowKey]
             : ''
          "
          :columns="columns"
          :refs="refs"

          :expand="depth < expandDepth"
          :depth="depth + 1"
          :expand-depth="expandDepth"
          :expand-row-map.sync="expandRowMap"
        >
          {{ scope.row[rowKey] }}
        </table-tree-depth>
      </template>
    </el-table-column>

    <el-table-column v-else type="selection" />

    <el-table-column
      v-for="(column, index) in columns"
      :key="column.prop + ':' + column.label + ':' + index"
      :prop="column.prop"
      :label="column.label"
      :width="column.width"
      :type="column.type || ''"
    >
      <template slot-scope="scope">
        <table-expand
          v-if="column.render"
          :render="column.render"
          :row="scope.row"
          :column="column"
          :depth="depth"
          :expand-depth="expandDepth"
        >
        </table-expand>
        <span v-else>
          {{scope.row[column.prop]}}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  import TableExpand from './table-expand'

  export default {
    name: 'TableTreeDepth',
    inheritAttrs: true,
    components: {
      TableExpand,
    },
    props: {
      className: [String, Object],
      cellClassName: [String, Object],
      refName: [String, Object],
      rowKey: [Number, String],
      depth: Number,
      parentKey: [Number, String],

      showHeader: Boolean,
      expand: Boolean,
      expandDepth: Number,
      expandRowMap: Object,

      dataSource: Array,
      columns: Array,
      refs: Array,
      selectedRows: Array,
      selection: Boolean,

      size: String,
      width: [String, Number],
      height: [String, Number],
      maxHeight: Number,
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
    },
    data() {
      return {
        expandRowKeys: this.expandRowMap[this.depth] || [],
      }
    },
    mounted() {
    },
    destroyed() {
    },
    computed: {
      selectedValue() {
        return this.selectedRows || []
      },
      tableSize() {
        return this.size || (this.$ELEMENT || {}).size;
      },
    },
    watch: {
      selectedValue(val) {
        this.$emit('update:selected-rows', val)
      },
      expandRowKeys(newVal) {
        // console.log('watch expandRowKeys: ', newVal);
        /* this.$emit(
          'update:expandRowMap',
          Object.assign({}, this.expandRowMapProp, { [this.depth]: newVal })
        ) */
      },
    },
    methods: {
      computedCellClassName({ row, column, rowIndex, columnIndex }) {
        const key = columnIndex === 0 ? `cell__depth__${row.__depth__}` : '';

        return columnIndex === 0 ? key : '';
      },
      handleExpandChange(row, expandedRows) {
        this.expandRowKeys = expandedRows.map(t => t && t[this.rowKey]).filter(Boolean)
        // this.refs.splice(expandedRows.length, 1)
      },
      handleSelectionChange(row) {
        const values = row.map(item => item[this.rowKey])
        this.$emit('update:selectedRows', values)
      },
    }
  }
</script>
