const glob = require('glob')
const path = require('path')

const regex = /_print_white|_tee_grey/

module.exports = {
  productImages(state, type) {
    return glob.sync(`./src/images/product/${state}_${type}_*.{jpg,png}`).sort((a, b) => {
      if (regex.test(a)) {
        return 1
      } else if (regex.test(b)) {
        return -1
      } else {
        return 0
      }
    }).map((name) => {
      return '/' + path.relative('src', name)
    })
  }
}
