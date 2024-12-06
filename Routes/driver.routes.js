const express = require("express")
const router = express.Router()
const drivercontroller = require("../Controller/driver")
// const verifyToken = require('../Middleware/verifyToken');  // Assuming middleware is stored here
const { driverValidationSchema, validateRequest,driverLoginSchema } = require('../Middleware/validation'); // Adjust the path as necessary


router.post("/register/driver", validateRequest(driverValidationSchema),drivercontroller.registerDriver)
router.post("/login/driver",validateRequest(driverLoginSchema),drivercontroller.loginDriver)


module.exports = router