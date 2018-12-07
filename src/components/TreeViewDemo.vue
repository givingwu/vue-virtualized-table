<template>
  <div class="tree-menu">
    <div :style="indent" @click="toggleChildren">{{ (String(label) && nodes && nodes.length ? (showChildren ? '-' : '+') : '') + String(label) }}</div>

    <!--If `nodes` is undefined this will not render-->
    <tree-menu
      v-if="showChildren"
      v-for="node in nodes"
      :key="node.label"
      :nodes="node.nodes"
      :label="node.label"
      :depth="depth + 1"
    >
    </tree-menu>
  </div>
</template>

<script>
export default {
  props: [ "label", "nodes", "depth" ],
  name: "tree-menu",
  data() {
    return { showChildren: false }
  },
  computed: {
    indent() {
      return {
        transform: `translate(${this.depth * 20}px)`
      }
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren
    }
  }
};
</script>

<style>
.tree-menu {
  text-align: left;
}
</style>
