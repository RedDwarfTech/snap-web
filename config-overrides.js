const { override } = require('customize-cra');
const path = require("path");
 
module.exports = override(
     (config, env) =>{
         config.resolve.alias = {
             "@": path.resolve(__dirname, "src")
         };
         return config;
     },
);
