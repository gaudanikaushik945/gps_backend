const express = require("express")
const router = express.Router()
const locationCrontroller = require("../Controller/location")
const {io} = require("../socketIo/socket")
const {verifyToken, verifyToken123456} = require("../Middleware/verifyToken")


// router.post("/add/location", locationCrontroller.addLocation)
router.post("/notify-location", (req, res) => {
    const { driverId, message } = req.body;
  
    // Emit an event to a specific driver (you can specify which socket to target)
    if (io) {
      io.emit("locationNotification", { driverId, message });
      res.status(200).send("Notification sent");
    } else {
      res.status(500).send("Socket.io instance not found");
    }
  })


router.get("/get/location",verifyToken123456 ,locationCrontroller.getDriverLocation)
router.get("/distance/driver", verifyToken123456,locationCrontroller.geoFenceLocation)
router.post("/caclute/running/status",verifyToken123456, locationCrontroller.getOneDayRunningStatus )


module.exports = router