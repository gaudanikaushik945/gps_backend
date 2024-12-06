const mongoose = require("mongoose")
require("dotenv").config()



mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true
}).then(() => {
    console.log(`===== mongodb database connection successfully ======== ${process.env.MONGODB_URL}` );
}).catch((error) => {
    console.log("===== error =======", error);   
})



module.exports = mongoose


 

