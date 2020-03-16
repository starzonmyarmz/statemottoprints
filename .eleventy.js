const pluginSass = require("eleventy-plugin-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSass, {
    watch: ['src/**/*.{scss,sass}', '!node_modules/**'],
    sourcemaps: true
  });

  eleventyConfig.addPassthroughCopy('src/images')
  eleventyConfig.addPassthroughCopy('src/javascripts')


  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  }
}
