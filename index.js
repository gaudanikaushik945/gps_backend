const express = require("express")
const app = express()
const mongoose = require("./Model/mongodb")
const bodyParser  = require("body-parser")
const http = require('http');
const path = require("path");
const { initSocketIO } = require("./socketIo/socket")
require("dotenv").config()


const driverRoutes = require("./Routes/driver.routes")
const locationRoutes = require("./Routes/location.routes")


const server = http.createServer(app);
const io = initSocketIO(server);





app.use(bodyParser.json())
app.use(express.json())



app.use("/api", driverRoutes)
app.use("/api", locationRoutes)


app.get("/", (req, res) => {
    res.send(`------------ localhost serverside connected successfully ---------------- https://localhost:${process.env.PORT_NUMBER}`)
})


server.listen(process.env.PORT_NUMBER, () => {
    console.log(`------------ localhost connected successfully ---------------- https://localhost:${process.env.PORT_NUMBER}`)
})