import Vue from 'vue'
import fastDeepEqual from 'fast-deep-equal'
import { getOptionProps } from '../utils/index'

/**
 * Connect in Vue.js
 * @see
 *
 * {@link https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e connect.js}
 * {@link https://github.com/vueComponent/ant-design-vue/blob/e63f9ea671/components/_util/store/connect.jsx ant-design-vue/connect.jsx}
 */
export default function connect(mapStateToProps = () => ({})) {
  const shouldSubscribe = !!mapStateToProps

  return function withConnectHOC(WrappedComponent) {
    const props = {}
    const tempProps = WrappedComponent.props

    /**
     * 在 connect 这层，取消 required 配置，阻止双重警告
     * ConnectComponent > Component
     */
    Object.keys(tempProps).forEach((k) => {
      props[k] = { ...tempProps[k], required: false }
    })

    return Vue.extend({
      name: `Connect${WrappedComponent.name || 'Component'}`,

      inject: {
        table: { default: () => ({}) }
      },

      props,

      data() {
        this.store = this.table.store
        this.preProps = getOptionProps(this)

        return {
          subscribed: mapStateToProps(this.store.getState(), this.$props)
        }
      },

      mounted() {
        this.trySubscribe()
      },

      beforeDestroy() {
        this.tryUnsubscribe()
      },

      methods: {
        handleChange() {
          if (!this.unsubscribe) {
            return
          }

          const props = getOptionProps(this)
          const nextSubscribed = mapStateToProps(this.store.getState(), props)

          if (
            !fastDeepEqual(this.preProps, props) ||
            !fastDeepEqual(this.subscribed, nextSubscribed)
          ) {
            this.subscribed = nextSubscribed
          }
        },

        trySubscribe() {
          if (shouldSubscribe) {
            this.unsubscribe = this.store.subscribe(this.handleChange)
            this.handleChange()
          }
        },

        tryUnsubscribe() {
          if (this.unsubscribe) {
            this.unsubscribe()
            this.unsubscribe = null
          }
        },

        getWrappedInstance() {
          return this.$refs.wrappedInstance
        }
      },

      render() {
        const props = getOptionProps(this)
        const {
          $listeners,
          $slots = {},
          $attrs,
          $scopedSlots,
          subscribed,
          store
        } = this

        this.preProps = { ...this.$props, ...props }

        const wrapProps = {
          props: {
            ...props,
            store,
            ...subscribed
          },
          on: $listeners,
          attrs: {
            ...$attrs
          },
          scopedSlots: $scopedSlots
        }

        return (
          <WrappedComponent {...wrapProps} ref="wrappedInstance">
            {Object.keys($slots).map((name) => {
              return <template slot={name}>{$slots[name]}</template>
            })}
          </WrappedComponent>
        )
      }
    })
  }
}
