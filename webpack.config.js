module.exports = {
    entry: "./src/app.js",
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist',
        filename: "bundle.js"
    },
    externals: {
      google: 'google'
    },
    devtool: 'source-map'
};  