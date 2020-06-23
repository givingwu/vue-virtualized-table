module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/vue-virtualized-table/' : '/',
  pages: {
    index: {
      entry: './example/main.js',
      template: './public/index.html',
      title: 'vue-virtualized-table example'
    }
  }
}
