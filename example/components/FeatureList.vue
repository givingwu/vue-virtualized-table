<template>
  <div class="feature" v-if="list && list.length">
    <h4 v-if="title">{{ title }}</h4>
    <ol>
      <li v-for="(text, index) in list" :key="index">{{text}}</li>
    </ol>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    list: Array,
  }
}
</script>

<style lang="less">
.feature {
  h4 {
    margin: .2em 0;
  }

  ol {
    margin: 0;
  }

  & + &  {
    margin-top: 1em;
  }
}
</style>

