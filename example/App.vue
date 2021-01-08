<template>
  <div id="app">
    <h1>Vue Virtualized Table</h1>
    <Form inline label-suffix=":" :style="{ marginBottom: 16 }">
      <FormItem>
        <TableExpandAction :current="
              state.expandable.defaultExpandAllRows ||
                state.expandable.expandDepth
            " @expand="handleExpandTable">
          <Button size="small" icon="arrow-down" type="primary" plain>展开/收起</Button>
        </TableExpandAction>
      </FormItem>

      <FormItem label="Bordered">
        <ElSwitch v-model="state.bordered" />
      </FormItem>
      <FormItem label="Title">
        <ElSwitch :value="!!state.title" @change="handleTitleChange" />
      </FormItem>
      <FormItem label="Column Header">
        <ElSwitch v-model="state.showHeader" />
      </FormItem>
      <FormItem label="Footer">
        <ElSwitch :value="!!state.footer" @change="handleFooterChange" />
      </FormItem>
      <FormItem label="Expandable">
        <ElSwitch :value="!!state.expandable" @change="handleExpandChange" />
      </FormItem>
      <FormItem label="Selection Mode">
        <ElSwitch :value="!!state.rowSelection" @change="handleRowSelectionChange" />
      </FormItem>
      <FormItem label="Fixed Header">
        <ElSwitch v-model="state.yScroll" />
      </FormItem>
      <FormItem label="Has Data">
        <ElSwitch v-model="hasData" />
      </FormItem>
      <FormItem label="Ellipsis">
        <ElSwitch v-model="state.ellipsis" />
      </FormItem>
      <FormItem label="Use Virtual">
        <ElSwitch v-model="state.useVirtual" />
      </FormItem>
      <FormItem label="Size">
        <RadioGroup v-model="state.size" @change="handleSizeChange">
          <Radio label="default">Default</Radio>
          <Radio label="middle">Middle</Radio>
          <Radio label="small">Small</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Table Scroll">
        <RadioGroup v-model="state.xScroll">
          <Radio :label="undefined">Unset</Radio>
          <Radio label="scroll">Scroll</Radio>
          <Radio label="fixed">Fixed Columns</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Table Layout">
        <RadioGroup v-model="state.tableLayout">
          <Radio :label="undefined">Unset</Radio>
          <Radio label="fixed">Fixed</Radio>
        </RadioGroup>
      </FormItem>
    </Form>

    <!-- <VirtualTableBefore
      row-key="id"
      :scroll="scroll"
      :columns="columns"
      :data-source="hasData ? dataSource : []"
      v-bind="state"
    ></VirtualTableBefore>-->

    <!-- use-virtual
    :row-height="40"-->
    <VirtualTable
      row-key="id"
      :scroll="scroll"
      :columns="columns"
      :data-source="hasData ? dataSource : []"
      v-bind="state"
    />
  </div>
</template>

<script>
import VirtualTable from '@'
import dataSource from './TreeData'
import TableExpandAction from './components/TableExpandAction/index'
import { Form, FormItem, Switch, RadioGroup, Radio, Button } from 'element-ui'
import 'normalize.css/normalize.css'
import 'element-ui/lib/theme-chalk/index.css'
import '../src/table.css'

const expandable = {
  ...{
    indentSize: 20,
    expandDepth: null,
    defaultExpandAllRows: true
  },
  expandedRowRender: (record) => <p>{record.description}</p>
}
const title = () => 'Here is title'
const showHeader = true
const scroll = {
  y: 300
}
const footer = () => 'Here is footer'

export default {
  name: 'App',
  components: {
    Form,
    FormItem,
    Button,
    ElSwitch: Switch,
    RadioGroup,
    Radio,
    VirtualTable,
    TableExpandAction
  },
  data() {
    return {
      state: {
        bordered: false,
        size: 'default',
        expandable,
        title: undefined,
        showHeader,
        ellipsis: true,
        rowHeight: 55,
        footer: undefined,
        useVirtual: true,
        xScroll: undefined,
        yScroll: !!scroll.y,
        rowSelection: {},
        tableLayout: 'fixed'
      },
      hasData: true,
      scroll,
      dataSource: Object.freeze(dataSource),
      columns: [
        {
          label: 'index',
          prop: 'index',
          width: 100,
          key: 0,
          render: (h, { index }) => {
            return index + 1
          }
        },
        {
          expandable: true,
          label: '商品 ID',
          prop: 'id',
          width: 150,
          key: 1
        },
        {
          label: '商品名称',
          prop: 'name',
          key: 2
          // width: 200
        },
        {
          label: '描述',
          prop: 'desc',
          // width: 300,
          key: 3
        },
        {
          // fixed: "right",
          label: '商家地址',
          prop: 'address',
          width: 200,
          key: 4
        },
        {
          // fixed: "right",
          label: '小吃分类',
          prop: 'category',
          width: 200,
          key: 5
        }
      ]
    }
  },

  watch: {
    state: {
      deep: true,
      immediate: true,
      handler() {
        const { xScroll, yScroll, ...state } = this.state
        const scroll = {}

        if (yScroll) {
          scroll.y = 300
        }

        if (xScroll) {
          scroll.x = '150vw'
        }

        const tableColumns = this.columns.map((item) => ({
          ...item,
          ellipsis: state.ellipsis
        }))

        if (xScroll === 'fixed') {
          tableColumns[0].fixed = true
          tableColumns[tableColumns.length - 1].fixed = 'right'
        } else {
          tableColumns.forEach((column) => {
            if (column.fixed) {
              column.fixed = null
            }
          })
        }

        this.scroll = scroll
        this.columns = tableColumns
      }
    }
  },

  methods: {
    setState(state) {
      this.state = {
        ...this.state,
        ...state
      }
    },

    handleExpandChange(enable) {
      this.setState({ expandable: enable ? expandable : undefined })
    },

    handleTitleChange(enable) {
      this.setState({ title: enable ? title : undefined })
    },

    handleFooterChange(enable) {
      this.setState({ footer: enable ? footer : undefined })
    },

    handleSizeChange(size) {
      this.setState({
        rowHeight: {
          default: 55,
          middle: 47,
          small: 39
        }[size]
      })
    },

    handleRowSelectionChange(enable) {
      this.setState({
        rowSelection: enable
          ? {
              type: 'radio'
            }
          : undefined
      })
    },

    handleExpandTable(expand, value) {
      const { expandable } = this.state

      if (typeof value === 'number') {
        expandable.defaultExpandAllRows = null

        if (expand) {
          expandable.expandDepth = value
        } else {
          if ((value -= 1) > 0) {
            expandable.expandDepth = value
          } else {
            expandable.expandDepth = null
            expandable.defaultExpandAllRows = false
          }
        }
      } else if (typeof value === 'boolean') {
        expandable.expandDepth = null

        if (expand) {
          expandable.defaultExpandAllRows = true
        } else {
          expandable.defaultExpandAllRows = false
        }
      }
    },
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
