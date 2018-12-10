<template>
  <div id="app">
    <div class="fixed-button">
      <el-button type="infor" @click="getData()">this.getData()</el-button>
    </div>
    <desc-pannel
      title="table-tree"
      desc="推荐使用"
      :good="[`columns 完全定制化`, `完全重写 el-table`]"
      :bad="[`需要学习几个额外的 TableStore API`]"
    >
      <table-tree
        v-loading="tableLoading"
        class="tree-table-view"
        :row-key="rowKey"
        :show-header="true"
        :data-source="data"
        :columns="columns1"
        :indent-size="20"
        :expand="true"
        :depth="0"
        :expand-depth="1"
        :expand-row-map.sync="expandRowMap"
      />
    </desc-pannel>

    <desc-pannel
      title="table-tree-depth"
      desc="Use element-ui `Table` component and render itself recursively."
    >
      <table-tree-depth
        v-loading="tableLoading"
        class="tree-table-view"
        :row-key="rowKey"
        :show-header="true"
        :data-source="data"
        :columns="columns2"
        :expand="true"
        :depth="0"
        :expand-depth="1"
        :expand-row-map.sync="expandRowMap"
      />
    </desc-pannel>

    <TreeView :label="tree.label" :nodes="tree.nodes" :depth="0"/>

    <desc-pannel
      title="table-tree-recursive"
      desc="Use element-ui `Table` component and write itself recursively."
    >
      <table-tree-recursive
        class="tree-table-view"
        :data-source="data"
        :show-header="true"
        :columns="columns2"
        :expand="true"
        :depth="0"
      >
        <template slot-scope="{ scope, children, depth }">
          <table-tree-recursive
            class="tree-table-view"
            :data-source="children"
            :show-header="false"
            :columns="columns2"
            :depth="depth"
            :expand="Boolean(children && children.length)"
            :selection="Boolean(!children || !children.length)"
          >
            <template slot-scope="{ scope, children, depth }">
              <table-tree-recursive
                class="tree-table-view"
                :data-source="children"
                :show-header="false"
                :columns="columns2"
                :depth="depth"
                :expand="false"
                :selection="true"
              />
            </template>
          </table-tree-recursive>
          <!-- <div v-else class="cell">no any data.</div> -->
        </template>
      </table-tree-recursive>
    </desc-pannel>
  </div>
</template>

<script>
import dataSource, { TableData2, tree } from "./TreeData";
import DescPannel from "./components/DescPannel";

import TableTreeRecursive from "../src/components/TableTreeRecursive";
import TableTreeDepth from "../src/components/TableTreeDepth";
import TreeView from "@/components/TreeViewDemo";
import TableTree from "@/components/TableTree";

export default {
  name: "App",
  components: {
    TreeView,
    TableTree,
    DescPannel,
    TableTreeDepth,
    TableTreeRecursive
  },
  data() {
    return {
      rowKey: "id",
      expandRowMap: {},
      /* expandRowMap: {
        0: [1111],
        1: [11111],
      }, */
      tableLoading: false,
      data: dataSource,
      columns1: [
        {
          prop: 'index',
          key: 0,
          minWidth: 20,
          render(h, { rowIndex }) {
            return ++rowIndex
          }
        },
        {
          prop: "_expand",
          key: 0,
          width: 20,
          minWidth: 40,
          render: (h, { store, row, /* column, */ depth }) => {
            if (row.children && row.children.length) {
              const expanded = store.isRowExpanded(row);
              const classname = expanded ? "el-icon-minus" : "el-icon-plus";

              return (
                <i
                  style={`padding-left: ${depth * 20}px`}
                  class={classname}
                  onClick={() => store.toggleRowExpansion(row)}
                />
              );
            } else {
              return <el-checkbox style={`padding-left: ${depth * 20}px`} />;
            }
          }
        },
        {
          label: "商品 ID",
          prop: "id",
          key: 1
        },
        {
          label: "商品名称",
          prop: "name",
          key: 2
        },
        {
          label: "描述",
          prop: "desc",
          key: 3
        }
      ],
      columns2: [
        {
          label: "商品 ID",
          prop: "id",
          key: 1,
          width: 40,
        },
        {
          label: "商品名称",
          prop: "name",
          key: 2
        },
        {
          label: "描述",
          prop: "desc",
          key: 3
        },
        {
          label: "operation",
          prop: "_operation",
          width: 300,
          key: 4,
          render: (h, { row, depth, expandDepth }) =>
            depth > expandDepth &&
            h(
              "el-button",
              {
                nativeOn: {
                  click: () => {
                    const content = prompt(
                      "What's the description u wanna say?",
                      row["desc"]
                    );

                    if (content.trim()) {
                      row.desc = content.trim();
                      // this.getData()
                    }
                  }
                }
              },
              ["click to modify desc"]
            )
        }
      ],
      tree
    };
  },
  beforeMount() {
    // this.getData()
  },
  mounted() {
    // this.getData()
  },
  methods: {
    getData() {
      this.tableLoading = true;

      setTimeout(() => {
        this.tableLoading = false;
        this.data = this.data === TableData2 ? dataSource : TableData2;
      }, 1000);
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.tree-table-view .el-table__expanded-cell[class*="cell"] {
  padding: 0 0 0 5px;
}

.fixed-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}
</style>
