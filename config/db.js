const mongoose = require('mongoose') 

// connect to our Database, mongoose works with promisses
const connectDB = async() => { 
    try{
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // To avoide warnings in console
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)

    } catch(err) { // error
        console.error(err)
        process.exit(1) 
    }
}

module.exports = connectDB // So we can use it in the app.js file