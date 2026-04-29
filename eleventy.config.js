module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/images')
  eleventyConfig.addPassthroughCopy('src/stylesheets')

  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  }
}
