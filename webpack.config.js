 const path = require("path");
module.exports ={
    mode:"development",
    devtool:"inline-cheap-source-map",
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path:path.resolve( __dirname + "/dist"),
        clean: true,
    },
    devServer: {
        contentBase: "./src/examples",
        publicPath: "/dist",
        port: 9000,
        watchContentBase: true,
        open: false,
    }
}
