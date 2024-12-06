const jwt = require('jsonwebtoken');
const Driver = require('../Model/driver');

exports.verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({
            message: 'No token provided, access denied.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.driver = decoded;

       
        const driver = await Driver.findById(req.driver.driverId);
        if (!driver) {
            return res.status(401).json({
                message: 'Driver not found'
            });
        }

        if (driver.token !== token) {
            return res.status(401).json({
                message: 'Token is no longer valid, please login again.'
            });
        }

        next(); 
    } catch (error) {
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            await Driver.updateOne({ _id: req.driver.driverId }, { $unset: { token: "" } });
        }
        return res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};


exports.verifyToken123456 = async (req, res, next) => {
    try {
        const authHeader = await req.header("Authorization");
        console.log("=========authHeader========", authHeader);
        if (!authHeader) {
            return res.status(401).json({
                data: false,
                message: "Unauthorized request"
            });
        }
        const token = await authHeader.split(' ')[1];
        console.log("-----token----==================== ", token);

        const jwtToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("-----jwtToken------", jwtToken);

        if (!jwtToken) {
            return res.status(401).json({
                message: 'Unauthorized request1'
            });
        }

        // Attach the userId to the request object
        tokenChek = jwtToken;  // assuming userId is in the JWT payload

        next();

    } catch (error) {
        console.log("-----error------", error);
        return res.status(401).json({
            data: false,
            message: "Invalid token"
        });
    }
}


