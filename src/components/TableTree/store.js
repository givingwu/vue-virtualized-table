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

const getKeysMap = function(array, rowKey) {
  const arrayMap = {};
  (array || []).forEach((row, index) => {
    arrayMap[getRowIdentity(row, rowKey)] = { row, index };
  });
  return arrayMap;
};

const getRowIdentity = (row, rowKey) => {
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


export default class TableState {
  constructor(initialState) {
    this.states = {
      data: null,
      columns: "",
      rowKey: "",
      selectedRowsKeys: [],
      expandRows: [],
      expandRowKeys: [],
      defaultExpandAll: false,
    };
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
      // eslint-disable-next-line
      console.log('toggleRowExpansion has changed')
      // this.table.$emit("expand-change", row, this.states.expandRows);
      // this.scheduleLayout();
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

  _setData(state, data) {
    // eslint-disable-next-line
    const dataInstanceChanged = state._data !== data;
    state._data = data;
    state.data = data;

    const rowKey = state.rowKey;
    const defaultExpandAll = state.defaultExpandAll;
    if (defaultExpandAll) {
      this.states.expandRows = (state.data || []).slice(0);
    } else if (rowKey) {
      // update expandRows to new rows according to rowKey
      const ids = getKeysMap(this.states.expandRows, rowKey);
      let expandRows = [];
      for (const row of state.data) {
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

    // Vue.nextTick(() => this.table.updateScrollY());
  }
}
