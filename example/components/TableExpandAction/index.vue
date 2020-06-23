<template>
  <ElDropdown v-bind="$attrs" v-on="$listeners" @command="handleCommand">
    <slot></slot>

    <ElDropdownMenu slot="dropdown" :append-to-body="appendToBody">
      <ElDropdownItem v-for="({ value, label, state }) in options" :key="value" :command="value">
        <b v-if="state">收起{{label.includes('至') ? label.slice(label.indexOf('至') + 1) : label}}</b>
        <template v-else>展开{{label}}</template>
      </ElDropdownItem>
    </ElDropdownMenu>
  </ElDropdown>
</template>

<script>
import { Dropdown, DropdownMenu, DropdownItem } from 'element-ui'

export default {
  name: 'TableExpandAction',

  components: {
    ElDropdown: Dropdown,
    ElDropdownMenu: DropdownMenu,
    ElDropdownItem: DropdownItem
  },

  inheritAttrs: false,

  props: {
    // eslint-disable-next-line vue/require-default-prop
    current: [Boolean, Number],
    appendToBody: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      options: [
        {
          label: '全部',
          value: true,
          state: true
        },
        {
          label: '至二级',
          value: 1,
          state: false
        },
        {
          label: '至三级',
          value: 2,
          state: false
        },
        {
          label: '至四级',
          value: 3,
          state: false
        },
        {
          label: '至五级',
          value: 4,
          state: false
        },
        {
          label: '至六级',
          value: 5,
          state: false
        }
      ]
    }
  },

  watch: {
    current(val, oldValue) {
      if (typeof val === 'number' && typeof oldValue === 'number') {
        if (oldValue > val) {
          this.handleCommand(val, false)
        }
      }
    }
  },

  methods: {
    handleCommand(command, emitEvent = true) {
      this.options.forEach((opt) => {
        if (opt.value === command) {
          if (emitEvent) {
            opt.state = !opt.state

            this.$emit(
              'expand' /* event name */,
              opt.state /* expand state */,
              opt.value /* expand value */
            )
          } else {
            if (!opt.state) {
              opt.state = true
            }
          }
        } else {
          if (opt.state) opt.state = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
