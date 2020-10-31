module.exports = {
  // 根据不同的执行环境配置不同的入口
  entry: process.env.NODE_ENV === 'development' ? './src/main.js' : './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'drawBoard.js',
    library: 'drawBoard',
    libraryTarget: 'amd'
  }
}