# vue-virtual-table

## Real virtualized table

初代版的 TableTree，因为当时使用 element-ui 的 table 组件其功能扩展能力有限，无法满足需求。于是我们自己实现了 TableTree 组件内置了多项扩展并支持自定义渲染 `{ render: ( store: TableStore, row: RowModel, column: ColumnConfig, value: any )}`，而这个 API 也一致延续至今。

而后在编写工期项目的时候，因为工期进度记录数据需要渲染的数据量非常大，当渲染上几百条数据时，网页开始变得卡顿。于是实现了第二版的 VirtualTable，即支持了 **virtual-scroll** 的 table 组件。

起初 VirtualTable V1 可能会渲染三个 table，即左固定列和右固定列会被独立渲染成 Table 以实现固定效果。出现了内存泄漏和性能问题，显得*虚拟滚动并不虚拟*。

而后看到了 antd V4 版本使用 `position: sticky` 实现列固定的效果，才想明白之前分开渲染 左固定列 和 右固定列 的目的是为了兼容 IE11 [CSS position:sticky](https://caniuse.com/#search=sticky) 。本来以为是渲染3个table造成的性能和内存问题，从算法角度看是 O(3)，改用 sticky 后是应该变成 O(1) 才是，但是并不理想。

反思自己，从一开始的思路就出现了错误，不应该使用 <table> 元素来实现复杂的功能。理由如下：

+ table 灵活性限制
+ table 学习成本
+ table 扩展性差

但是在 TableTree V1 到 VirtualTable V1，VirtualTable V2 的过程，发现几点共性：

1. TableStateManager 用于维护 Table 本身公共状态，比如在渲染三个 table 时，FixedLeftTable, Table, FixedRightTable 的 hover 状态： currentHoveredRow.
2. ExpansionManager 用于维护 Table 扩展状态。在普通的 table 中渲染使用递归 `expandRender(item.children)` 渲染子元素，这也是第一版 TableTree 的做法。但是这对于**虚拟滚动**是行不通的。因为虚拟滚动的展开/收起状态更像是 *分段插入* 而非 *递归渲染*。
3. VirtualizeManager 用于维护 Table 虚拟化的相关状态，比如：virtualizedData = [], currentScrollTop, wrapperHeight 等等。


## Technologies

在调试和开发 VirtualTable 组件时，发现的问题：

1. 滚动速度过快时，超过了 VirtualDOM Diff + Patch 的执行时间，会明显掉帧，白屏。使用 rAF 也是一样的，因为即使当前 VirtualizeManager 中仅有 5 条 virtualizedData 数据，在每次滚动时执行 Diff + Patch 的时间依赖 TableCell 每个单元格内被渲染组件的复杂度。对于简单的 textNode 还将就，如果是复杂的组件，在我们项目中是 TableFormItem，即 O(n) * (diff + patch)， n = TableFormItem 组件的数量。这种情况下 rAF 的 16ms 大于了 16ms。最终加上 debounce + chunk 分段更新，同样无法解决问题。
2. 后来看了 React-Virtualized 的实现，以及我之前实现的 vue-virtual-list 组件。才想通最好的做法是使用 div 模拟 table，用浏览器的 Repaint 代替 Vue 的 n * (createComponent + Diff + Patch)，n = visibleRows.length。加上 GPU 加速和 CSS 分层，性能是最好的。在更新的时候使用 rAF 求出 diffIndex，然后更新 model 再 patch 当前 diffIndex 的 item，实现性能和体验的最优解。换言之，就是每次找到需要被更新的 index 执行 updateComponent 更新 CSS, Component，复杂度由原来的 O(n) 变成 O(1)，即当前元素 virtualizedData[diffIndex]。

## Features

1. **高性能**的*虚拟滚动*
2. 支持**动态高度**
3. 支持**树形展开**
4. 支持**自定义渲染**
5. 不同实现


# V2.0

由于依然存在内存泄漏问题，计划使用 div 重写。

+ 如何用 table 实现 table 那样的布局。
  + 左侧固定
  + 右侧固定
  + 头部固定
