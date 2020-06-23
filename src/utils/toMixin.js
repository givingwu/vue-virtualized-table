export const toMixin = function toMixinComponent({
  data = {},
  methods = {},
  ...rest
}) {
  return {
    data,
    methods,
    ...rest,
  }
}
