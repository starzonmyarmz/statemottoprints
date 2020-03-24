const glob = require('glob')
const path = require('path')

module.exports = {
  productImages(state, type) {
    return glob.sync(`./src/images/product/${state}_${type}_*.{jpg,png}`).map((name) => {
      return '/' + path.relative('src', name)
    })
  }
}
