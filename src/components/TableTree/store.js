const toggleRowExpansion = function(state, row, expanded) {
  let changed = false;
  const expandRows = state.expandRows;
  if (typeof expanded !== "undefined") {
    const index = expandRows.indexOf(row);
    if (expanded) {
      if (index === -1) {
        expandRows.push(row);
        changed = true;
      }
    } else {
      if (index !== -1) {
        expandRows.splice(index, 1);
        changed = true;
      }
    }
  } else {
    const index = expandRows.indexOf(row);
    if (index === -1) {
      expandRows.push(row);
      changed = true;
    } else {
      expandRows.splice(index, 1);
      changed = true;
    }
  }

  return changed;
};

const toggleRowSelection = function(state, row, selected) {
  let changed = false;
  const selectRows = state.selectRows;

  if (typeof selected !== "undefined") {
    const index = selectRows.indexOf(row);
    if (selected) {
      if (index === -1) {
        selectRows.push(row);
        changed = true;
      }
    } else {
      if (index !== -1) {
        selectRows.splice(index, 1);
        changed = true;
      }
    }
  } else {
    const index = selectRows.indexOf(row);
    if (index === -1) {
      selectRows.push(row);
      changed = true;
    } else {
      selectRows.splice(index, 1);
      changed = true;
    }
  }

  return changed;
};

const getKeysMap = function(array, rowKey) {
  const arrayMap = {};
  (array || []).forEach((row, index) => {
    arrayMap[getRowIdentity(row, rowKey)] = { row, index };
  });
  return arrayMap;
};

const getRowIdentity = function (row, rowKey){
  if (!row) throw new Error("row is required when get row identity");
  if (typeof rowKey === "string") {
    if (rowKey.indexOf(".") < 0) {
      return row[rowKey];
    }
    let key = rowKey.split(".");
    let current = row;
    for (let i = 0; i < key.length; i++) {
      current = current[key[i]];
    }
    return current;
  } else if (typeof rowKey === "function") {
    return rowKey.call(null, row);
  }
};

export const geneFlattenArrayFromTreeByDepth = (
  tree,
  maxDepth,
  currDepth = 0,
  res = []
) => {
  let i = 0;
  let item = null;
  const l = tree.length;

  if (currDepth >= maxDepth) return (currDepth = 0) || []

  for(; i < l; i++) {
    item = tree[i]
    res[res.length] = item

    if (item && item.children && item.children.length) {
      geneFlattenArrayFromTreeByDepth(item.children, maxDepth, currDepth + 1, res)
    }
  }

  return res;
};

export default class TableState {
  constructor(table, initialState) {
    this.table = table;
    this.states = {
      data: null,
      columns: "",
      rowKey: "",
      selectRows: [],
      expandRows: [],
      expandDepth: 0,
      defaultExpandAll: false,
    };
    // console.log(this.states)
    this.setState(initialState);
  }

  /* 判断当前行是否是展开状态 */
  isRowExpanded(row) {
    const { expandRows = [], rowKey } = this.states;

    if (rowKey) {
      const expandMap = getKeysMap(expandRows, rowKey);
      return !!expandMap[getRowIdentity(row, rowKey)];
    }

    return expandRows.indexOf(row) !== -1;
  }

  /* 切换当前行展开收起状态 */
  toggleRowExpansion(row, expanded) {
    const changed = toggleRowExpansion(this.states, row, expanded);

    if (changed) {
      this.table.$emit("expand-change", row, this.states.expandRows);
    }
  }

  isRowSelected(row) {
    const { selectRows = [], rowKey } = this.states;

    if (rowKey) {
      const expandMap = getKeysMap(selectRows, rowKey);
      return !!expandMap[getRowIdentity(row, rowKey)];
    }

    return selectRows.indexOf(row) !== -1;
  }

  toggleRowSelection(row, selected) {
    const changed = toggleRowSelection(this.states, row, selected);

    if (changed) {
      this.table.$emit("select-change", row, this.states.selectRows);
    }
  }

  setState(state) {
    // console.trace('setState:', state);
    // 用一个相同的引用对象保存state value
    // 防止 table 的 dataSource 被重新复制
    for (let prop in state) {
      if (state.hasOwnProperty(prop) && this.states.hasOwnProperty(prop)) {
        if (prop === "data") {
          this._setData(this.states, state[prop]);
        } else {
          this.states[prop] = state[prop];
        }
      }
    }
  }

  _setData(states, data) {
    // eslint-disable-next-line
    const dataInstanceChanged = states._data !== data;
    states._data = data;
    states.data = data;

    const rowKey = states.rowKey;
    const expandDepth = states.expandDepth;
    const defaultExpandAll = states.defaultExpandAll;

    // keep expand rows
    if (defaultExpandAll) { /* Does not support this attribute */
      this.states.expandRows = (states.data || []).slice(0);
    } else if (expandDepth) {
      this.states.expandRows = geneFlattenArrayFromTreeByDepth(
        (states.data || []),
        expandDepth,
      ).slice(0)
    } else if (rowKey) {
      // update expandRows to new rows according to rowKey
      const ids = getKeysMap(this.states.expandRows, rowKey);
      let expandRows = [];
      for (const row of states.data) {
        const rowId = getRowIdentity(row, rowKey);

        if (ids[rowId]) {
          expandRows.push(row);
        }
      }

      this.states.expandRows = expandRows;
    } else {
      // clear the old rows
      this.states.expandRows = [];
    }
/*
    // const selectRows = states.selectRows
    if (this.selectRows && this.selectRows.length) {
      const ids = getKeysMap(this.states.selectRows, rowKey);
      let selectRows = []
      for (const row of states.data) {
        const rowId = getRowIdentity(row, rowKey);

        if (ids[rowId]) {
          expandRows.push(row);
        }
      }

      // The slice() method returns a shallow copy of a portion of an array into a new array object selected from begin to end (end not included).
      this.states.selectRows = selectRows
    }
 */
    // Vue.nextTick(() => this.table.updateScrollY());
  }
}
