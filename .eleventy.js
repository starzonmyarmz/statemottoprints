module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy('src/images')
  eleventyConfig.addPassthroughCopy('src/javascripts')


  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  }
}
