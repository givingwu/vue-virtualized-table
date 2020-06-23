<template>
  <div class="desc">
    <h2>{{title}}</h2>
    <p>{{desc}}</p>

    <slot name="good">
      <FeatureList title="优点：" :list="good" />
    </slot>

    <slot name="bad">
      <FeatureList title="缺点：" :list="bad" />
    </slot>

    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import FeatureList from './FeatureList'

export default {
  name: 'DescPannel',
  components: {
    FeatureList,
  },
  props: {
    title: String,
    desc: String,
    good: Array,
    bad: Array,
  }
}
</script>


<style lang="less">
.desc {
  margin: 10px 10px 20px;

  h2,
  p {
    margin: 0;
    text-align: center;
  }

  .content {
    margin: 1em 0;
  }
}
</style>

