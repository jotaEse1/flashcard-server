const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connection} = require('./db')

//connect to db
connection.connect(err => {
    if(err) {
        console.log(err)
        console.log("error in db")
        throw err
    }
    console.log('Connected to db')
})

//port
const port = process.env.PORT || 8000

//middlewares
app.use(express.json({limit: '50mb'}))
app.use(cors({
    origin: "https://jotaese1.github.io",
    credentials: true
}))
app.use(cookieParser())

//routes
const auth = require("./routes/auth"),
    deck = require("./routes/deck"),
    study = require("./routes/study")

app.use("/api/v1/auth", auth)
app.use("/api/v1/deck", deck)
app.use("/api/v1/study", study)


app.use('*', (req, res) => {
    res.send('<h1>Page not found</h1>')
})

app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})

//vercel deploy
module.exports = app