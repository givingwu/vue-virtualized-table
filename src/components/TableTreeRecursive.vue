<template>
  <el-table
    style="width: 100%"
    class="tree-data-table"
    :data="dataSource"
    :showHeader="showHeader"
  >
    <el-table-column v-if="expand" type="expand">
      <template slot-scope="scope">
        <div class="content">
          <slot
            v-bind="{
              scope,
              children: scope.row.children,
              depth: depth + 1
            }"
          />
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="selection" type="selection" />

    <el-table-column
      v-for="(column, index) in columns"
      :key="column.prop + ':' + column.label + ':' + index"
      :prop="column.prop"
      :label="column.label"
      :width="column.width"
      :type="column.type || ''"
    />
  </el-table>
</template>

<style>
.tree-data-table .el-table__expanded-cell[class*=cell] {
  padding: 0 0 0 20px;
}
</style>

<script>
  export default {
    name: 'TableTreeRecursive',
    inheritAttrs: true,

    props: {
      columns: Array,
      expand: Boolean,
      selection: Boolean,
      dataSource: Array,
      showHeader: Boolean,
      depth: Number,
    }
  }
</script>
