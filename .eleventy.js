const pluginSass = require("eleventy-plugin-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSass, {
    watch: ['src/**/*.{scss,sass}', '!node_modules/**'],
    sourcemaps: true
  });

  eleventyConfig.addPassthroughCopy('src/images')
  eleventyConfig.addPassthroughCopy('src/javascripts')

  eleventyConfig.addFilter("getColor", (data) => {
   return data.split('_')[2].replace(/.jpg/, '')
 });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  }
}
