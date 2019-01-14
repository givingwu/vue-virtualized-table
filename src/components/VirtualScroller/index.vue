
<template>
  <!-- step 1 -->
  <div class="virtual-list">
    <div
      ref="scroller"
      class="virtual-list-scroller"
      :style="{ height: totalHeight + 'px'}"
      @scroll.passive="handleScroll"
    >
      <slot :data-source="pool"></slot>
    </div>
  </div>
</template>

<script>
import PropTypes from 'vue-types';

/**
 * 1. 创建数据集合容器 $wrapper，计算的总体高度，模拟滚动条 itemHeight * dataSource.length
 * 2. 生成节流滚动区域的数据池 => ModelPool，并传递给子元素 slot => default
 *    1. 初始化阶段：bufferSize => height / itemHeight
 *    2. 滚动阶段： [ topIndex = scrollTop / itemHeight, bottomIndex = topIndex + 初始化阶段：bufferSize]
 * 3. 渲染池内元素到 DOM 中，ModelPool -> _l(child, <View model />)
 * 4. 监听容器 $wrapper 的滚动事件，重新生成 ModelPool, raf 优化性能
 *    4.1 容器滚动高度 scrollTop
 */
const name = 'VCVirtualList';
const VirtualScroller = {
  name,
  props: {
    dataSource: PropTypes.array.isRequired,
    itemHeight: PropTypes.integer.def(40),
    surLoad: PropTypes.integer.def(0),
    preLoad: PropTypes.integer.def(2),
    store: PropTypes.object,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).def('100%'),
  },
  watch: {
    dataSource() {
      this.update();
    },
    totalHeight() {
      return this.dataSource.length * this.itemHeight;
    },
    bufferSize() {
      return surfix + Math.ceil(this.height / this.itemHeight) + prefix;
    },
    wrap() {
      return this.$refs.wrap;
    },
  },
  data() {
    return {
      ready: false,
      pool: [], // PoolModel
    };
  },
  mounted() {
    this.$nextTick(this.update);
  },
  methods: {
    update() {
      const { wrap, itemHeight, bufferSize } = this;
      const {
        scrollTop /* 已滚动高度 */,
        scrollHeight /* 可滚动高度 */,
        clientHeight /* 容器高度 */,
      } = wrap;
      const topIndex = Math.floor(scrollTop / itemHeight)
      const bottomIndex = topIndex + bufferSize

      this.pool = [];
    },
    handleScroll() {
      const {
        scrollTop /* 已滚动高度 */,
        scrollHeight /* 可滚动高度 */,
        clientHeight /* 容器高度 */,
      } = this.wrap;
    },
  },
};

export default VirtualScroller;
</script>

