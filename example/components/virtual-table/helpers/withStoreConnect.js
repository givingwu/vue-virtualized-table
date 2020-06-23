import { getOptionProps } from './utils'
// import fastDeepEqual from 'fast-deep-equal'

/**
 * Connect in Vue.js
 * @see
 * {@link https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e connect.js}
 * {@link https://github.com/vueComponent/ant-design-vue/blob/e63f9ea671/components/_util/store/connect.jsx ant-design-vue/connect.jsx}
 */
export const withStoreConnect = (mapStateToProps) => {
  const shouldSubscribe = !!mapStateToProps

  return {
    data() {
      this.preProps = getOptionProps(this)
      const state = mapStateToProps(this.store.getState(), this.$props)

      return {
        state
      }
    },

    created() {
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
        const nextState = mapStateToProps(this.store.getState(), props)

        /**
         * fix: 没有必要比对，比对反而降低性能？因为 Vue.js 本身 Reactive 的实现已经做了脏检测
         */
        /* if (!this._q(this.preProps, props) || !this._q(this.state, nextState)) {
          this.state = nextState
        } */
        this.state = nextState
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
      }
    }
  }
}
