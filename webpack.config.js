module.exports = {
  entry: [
    './src/components/jsoneditor/index.jsx'
  ],
  output: {
    filename: './bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
}
