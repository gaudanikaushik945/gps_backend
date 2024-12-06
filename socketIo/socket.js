// In your socket setup file (e.g., socket.js)
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const locationController = require("../Controller/location");

let io; // Declare io globally

function initSocketIO(server) {
  io = new Server(server);

  io.use((socket, next) => {
    const token = socket.handshake.query.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) return next(new Error('Unauthorized'));

    console.log("=+========= token ================", token);
    

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("++++++++++++++++ decoded +++++++++++++++++++++++=", decoded);
      
      socket.driverId = decoded.driverId;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on("connection", (socket) => {
    console.log("A new user has connected:++++++++++++++++++++++++", socket.id);

    socket.on("addLocation", async (data) => {
      if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
        socket.emit("error", "Invalid latitude or longitude values");
        return;
      }
      const driverId = socket.driverId;
      try {
        const response = await locationController.addLocation(driverId, data.latitude, data.longitude);
        if (response.success) {
          io.emit("locationUpdate", response.data);
        } else {
          socket.emit("error", response.message);
        }
      } catch (error) {
        socket.emit("error", "An error occurred while adding location");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

// Expose io globally
module.exports = { initSocketIO, io };
