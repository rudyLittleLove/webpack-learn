// https://www.jianshu.com/p/6712e4e4b8fe 资料链接

const path = require("path");

const uglify = require('uglifyjs-webpack-plugin'); 
// 引入此插件build时，报异常，搜索查找原因是全局安装webpack的原因 单独在当前项目安装webpack
// 或者是在~/.bash_profile中添加如下设置： export NODE_PATH="/usr/local/lib/node_modules" 保存退出。
//（.bash_profile这个是隐藏文件，或者是配置文件，那怎么进入这个文件哪？
// 输入cd ~，输入touch .bash_profile，输入open -e .bash_profile，保存文件，关闭.bash_profile；更新刚配置的环境变量，输入source .bash_profile）

const htmlPlugin = require('html-webpack-plugin');

const extractTextplugin = require('extract-text-webpack-plugin');
// 使用此插件build时，报异常，npm install --save-dev extract-text-webpack-plugin@next

const glob = require("glob");
const PurifyCSSPlugin  = require('purifycss-webpack');

var website = {
  publicPath: "http://localhost:8888/" // 这里的IP和端口，是你本机的ip或者是你devServer配置的IP和端口。
}

module.exports = {
  mode: "development",
  // 入口文件配置
  entry: {
    main: './src/main.js',
    main2: './src/main2.js'
  },
  // 出口文件配置
  output: {
    path: path.resolve(__dirname, '../dist'), // 打包路径
    filename: '[name].js', // 打包文件名称
    publicPath: website.publicPath // 处理静态文件路径
  },
  // 模块: 例如解读sass、less、stylus、图片如何压缩转换
  module: {
    rules: [
      { 
        test: /\.css$/, // css loader
        use: extractTextplugin.extract({
          fallback: "style-loader",
          use: [
            { loader: "css-loader" },
            { loader: "postcss-loader" }
          ]
        })
        // use: [
        //   { loader: 'style-loader' },
        //   { loader: 'css-loader' }
        // ]
      }, {
        test: /\.(png|jpg|jpeg|gif)$/, // 图片 loader
        use: [
          {
            loader: 'url-loader', // url-loader 内置了 file-loader
            options: {
              limit: 5000, // 吧小于5kb的文件打成Base64的格式，写入JS
              outputPath: 'images/', // 打包后的图片文件放入到images文件夹下
            }
          }
        ]
      }, {
        test: /\.(html|htm)$/, // 处理html中的img标签引入的图片
        use: [ 'html-withimg-loader' ]
      }, { 
        test: /\.less$/,
        use: extractTextplugin.extract({ // 单独打包文件
          fallback: "style-loader",
          use: [
            { loader: 'css-loader' },
            { loader: 'less-loader' }
          ]
        })
        // use: [
        //   {
        //     loader: 'style-loader'
        //   }, {
        //     loader: 'css-loader'
        //   }, {
        //     loader: 'less-loader'
        //   }
        // ]
      }, { 
        test: /\.scss$/,
        use: extractTextplugin.extract({ // 单独打包文件
          fallback: "style-loader",
          use: [
            { loader: 'css-loader' },
            { loader: 'sass-loader' },
            { loader: "postcss-loader" }
          ]
        })
        // use: [
        //   {
        //     loader: 'style-loader'
        //   }, {
        //     loader: 'css-loader'
        //   }, {
        //     loader: 'scss-loader'
        //   }
        // ]
      }, {
        test:/\.(jsx|js)$/, // babel 配置 babel版本可能会出现问题，具体到时查看报错信息对应处理
        use:{
            loader:'babel-loader'
        },
        exclude:/node_modules/
      }
    ]
  },
  // 插件，用于生产模板和各项功能
  plugins: [
    new uglify(), // 压缩js插件
    new htmlPlugin({
      nimify: { // 是对html文件进行压缩
        removeAttributeQuotes: true //removeAttributeQuotes是去掉属性的双引号
      },
      hash: true, // 为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
      template: './src/index.html' // 是要打包的html模板路径和文件名称
    }), // 处理html文件
    new extractTextplugin('css/index.css'), // 分离css插件 括号内是路径

    // 删除无效css样式失效时
    // 解决办法：
    // 1.安装 glob-all，自带的 glob.sync 只能传一个字符串参数。
    // 1.new ExtractTextPlugin 放在 new PurifyCSSPlugin 之前。
    // 2.glob.sync 中配置所有你引用过样式的文件（注意路径），如 html,jsx。
    new PurifyCSSPlugin({
      //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
      paths: glob.sync(path.join(__dirname, '../src/*.html')) // !!! 使用此插件需要配置extract-text-webpack-plugin这个插件
    }),
  ],
  // 配置webpack开发服务的功能
  devServer: {
    // 设置基本目录结构
    contentBase: path.resolve(__dirname, '../dist'),
    // 服务器的IP地址，可以使用IP也可以使用localhost
    host: 'localhost',
    // 服务端压缩是否开启
    compress: true,
    // 配置服务端口号
    port: 8888
  }
}