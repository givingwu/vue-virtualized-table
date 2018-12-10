import TableStore, { geneFlattenArrayFromTreeByDepth } from "./store";

const TableTree = {
  name: "VCTableTree",
  componentName: "VCTableTree",
  props: {
    // ...ElTable.props,
    className: [String, Object],
    styleStr: {
      type: String,
      default: "width: 100%"
    },
    rowClassName: {
      type: [String, Object, Function],
      default: '',
    },
    fit: {
      type: Boolean,
      default: true
    },
    border: {
      type: Boolean,
      default: false
    },
    isHidden: Boolean,
    enableHover: {
      type: Boolean,
      default: true
    },
    size: String,
    width: [String, Number],
    height: [String, Number],
    maxHeight: Number,

    // Extra elements
    header: [String, Object],
    footer: [String, Object],

    // Show Header or not
    showHeader: {
      type: Boolean,
      default: true
    },
    // Specific RowKey
    rowKey: {
      type: String,
      required: true,
    },

    // Data
    dataSource: Array,
    columns: Array, // TableHeader Fields

    // Expand indent size
    /* indentSize: {
      type: Number,
      default: 10
    }, */
    expandDepth: {/* Expand Depth */
      type: Number,
      default: 1
    },
    expandRows: {/* Expand Rows */
      type: Array,
      default() {
        return [];
      }
    },
    // Selection
    selectRows: {/* Select Rows */
      type: Array,
      default() {
        return []
      }
    },
  },

  data() {
    const store = new TableStore(this, {
      data: this.dataSource,
      columns: this.columns,
      rowKey: this.rowKey,
      expandDepth: this.expandDepth,
      expandRows: this.expandRows,
      selectRows: this.selectRows,
    });

    return {
      store,
    };
  },

  watch: {
    dataSource: {
      immediate: true,
      handler(value) {
        this.store.setState({ data: value });
        /* if (this.$ready) {
          this.$nextTick(() => {
            this.doLayout();
          });
        } */
      }
    },
  },

  computed: {
    tableSize() {
      return this.size || (this.$ELEMENT || {}).size;
    },

    tableData() {
      return this.store.states.data;
    },

    tableColumns() {
      return this.store.states.columns;
    }
  },

  render() {
    const {
      fit,
      border,
      showHeader,
      isHidden,
      maxHeight,
      enableHover,
      tableSize,
      header,
      footer
    } = this;

    return (
      <div class={["table-tree", this.className]} style={this.styleStr}>
        {header}
        <table
          width={this.width}
          height={this.height}
          class={[
            "el-table",
            {
              "el-table--fit": fit,
              "el-table--border": border,
              "el-table--hidden": isHidden,
              "el-table--fluid-height": maxHeight,
              "el-table--enable-row-hover": enableHover
            },
            tableSize ? `el-table--${tableSize}` : ""
          ]}
        >
          { this.renderColgroup() }
          {showHeader && this.renderHeader()}
          <tbody>{this.renderTableRows(this.tableData)}</tbody>
        </table>
        {footer}
      </div>
    );
  },

  methods: {
    renderColgroup() {
      const { tableColumns = [] } = this;

      return (
        <colgroup>
          {
            tableColumns.map(({ label, prop, key = '', width, minWidth }, index) => (
              <col name={[label, prop, key, index].join('_')} width={minWidth || width}></col>
            ))
          }
        </colgroup>
      )
    },

    renderHeader() {
      const { tableColumns = [] } = this;

      return (
        <thead
          class="el-table__header"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tr class="el-table__row">
            {tableColumns.map(({ prop, label = '', key = '' }) => (
              <th
                key={[label, prop, key].join(':')}
                colspan="1"
                rowspan="1"
                class="is-leaf"
              >
                {label && <div class="cell">{label}</div>}
              </th>
            ))}
          </tr>
        </thead>
      );
    },

    renderTableRows(tableData, depth = 0) {
      const { rowKey = "", rowClassName } = this;

      return tableData && tableData.length && tableData.map((row, index) => {
        let rowClass = rowClassName
        if (typeof rowClassName === 'function') rowClass = rowClassName(row, index)

        const classNames = {
          [rowClass]: true,
          "el-table__row": true,
          "expanded": depth,
          [`expanded__depth-${depth}`]: depth,
        }

        return [
          <tr
            key={row[rowKey] || index}
            class={classNames}
          >
            {this.renderDataCells(row, index, depth)}
          </tr>,
          this.store.isRowExpanded(row) &&
          this.renderTableRows(row.children, depth + 1)
        ]
      })
    },

    renderDataCells(row, rowIndex, depth = 0) {
      const { tableColumns = [], rowKey = "" } = this;

      return tableColumns.map((column, columnIndex) => {
        const { prop, render, /* width, minWidth, */ } = column;
        const cell =
          typeof render === 'function' &&
          render(this.$createElement /* alias for h */, {
            depth,
            expandDepth: this.expandDepth,
            row,
            rowIndex,
            column,
            columnIndex,
            store: this.store,
          });

        return (
          <td rowspan="1" colspan="1">
            <div class="cell">{cell || row[prop] || ''}</div>
          </td>
        );
      });
    }
  }
};

export default TableTree;
