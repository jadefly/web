const Timestamp = new Date().getTime()
const path = require('path');
const IS_PROD = ['production'].includes(process.env.ENV)
const resolve = (dir) => path.join(__dirname, dir)
console.log('process.env,IS_PROD:', process.env.ENV, IS_PROD, process.env.NODE_ENV)
module.exports = {
  publicPath: '/', // 部署应用时的根路径(默认'/'),也可用相对路径(存在使用限制)
  // outputDir: 'dist', // 运行时生成的生产环境构建文件的目录(默认''dist''，构建之前会被清除)
  assetsDir: 'public', // 放置生成的静态资源(s、css、img、fonts)的(相对于 outputDir 的)目录(默认'')
  indexPath: 'index.html', // 指定生成的 index.html 的输出路径(相对于 outputDir)也可以是一个绝对路径。
  pages: {
    // pages 里配置的路径和文件名在你的文档目录必须存在 否则启动服务会报错
    index: {
      // 除了 entry 之外都是可选的
      entry: 'src/main.js' // page 的入口,每个“page”应该有一个对应的 JavaScript 入口文件
    }
  },
  lintOnSave: false, // 是否在保存的时候检查
  devServer: {
    // 开发环境下设置为编译好以后直接打开浏览器浏览
    open: true,
    hotOnly: true,
    // proxy: {
    //   '/esintoa': {
    //     target: 'http://172.16.0.139:8081', // 后台接口
    //     ws: true, // 如果要代理websockets
    //     changeOrigin: true, // 将选项changeOrigin设置true为基于名称的虚拟托管站点。
    //     // pathRewrite: {
    //     //   '^/esintoa': ''
    //     // }
    //   }
    // }
  },
  productionSourceMap: !IS_PROD, // 生产环境是否生成 sourceMap 文件
  css: {
    extract: IS_PROD, // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: !IS_PROD, // 开启 CSS source maps
    loaderOptions: {}, // css预设器配置项
    modules: false // 启用 CSS modules for all css / pre-processor files.
  },
  chainWebpack: (config) => {
    // 修复HMR
    config.resolve.symlinks(true)
    config.resolve.alias
      .set('components', resolve('src/components'))
      .set('assets', resolve('src/assets'))
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => Object.assign(options, {
        limit: 10240
      }))
  },
  configureWebpack: (config) => {
    if (!IS_PROD) { // 开发环境配置
      config.devtool = 'source-map'
    }
    console.log('config', config)
    Object.assign(config, {
      externals: {
        'BMap': 'BMap'
      },
      // output: { // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
      //   filename: `public/js/[name].${process.env.VUE_APP_Version}.${Timestamp}.js`,
      //   chunkFilename: `public/js/[name].${process.env.VUE_APP_Version}.${Timestamp}.js`
      // }
    })
  }
}
