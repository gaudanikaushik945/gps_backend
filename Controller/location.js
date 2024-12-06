const { default: mongoose } = require("mongoose");
const Location = require("../Model/location")
const Driver = require("../Model/driver")


// controller/locationController.js
exports.addLocation = async (driverId, latitude, longitude) => {
    try {

        console.log("======latitude===",latitude );

        console.log("===== longitude ======", longitude)
        
        
        const data = {
            driverId: driverId,
            latitude: latitude,
            longitude: longitude
        };
        
        console.log("++++++++++++++ data +++++++++++++++++", data)
        
      
        const addedLocation = await Location.create(data);
        console.log("Location added:", addedLocation);

        return { success: true, data: addedLocation };
    } catch (error) {
        console.error("Error adding location:", error);
        return { success: false, message: error.message };
    }
};




exports.getDriverLocation = async(req, res) => {
    try {
        const userTokenChek = tokenChek
        console.log("============= userTokenChek ===================", userTokenChek);


       const getuserLocation = await  Location.aggregate([
        {
          $lookup: {
            from: "drivers",              // Join with Users collection
            localField: "driverId",       // Location's userId field
            foreignField: "_id",        // Users _id field
            as: "driversDetails"           // Result alias
          }
        },
        {
          $unwind: "$driversDetails"       // Deconstruct array to single object
        },
        {
          $match: {
            driverId: new mongoose.Types.ObjectId(userTokenChek.driverId) // Use 'new' keyword
          }
        }
      ]);
       console.log("=============== getuserLocation =================", getuserLocation);
        if (!getuserLocation) {
            return res.status(404).json({
                data: false,
                message: "user location not found"
            });
        }

        
        return res.status(200).json({
            data: getuserLocation,
            message: "location data successFully"
        })

    } catch (error) {
        console.error("======== error ============", error);
        return res.status(500).json({
            data: false,
            message: error.message
          });
    }
}





exports.geoFenceLocation = async (req, res) => {
    try {
     
      let arrayLocation = []

      const userToken = tokenChek; 
      console.log("----------- userToken -------------", userToken);
  
      const getlocation = await Location.aggregate([
        {
          $lookup: {
            from: "drivers",              // Join with Users collection
            localField: "driverId",       // Location's userId field
            foreignField: "_id",        // Users _id field
            as: "driversDetails"           // Result alias
          }
        },
        {
          $unwind: "$driversDetails"       // Deconstruct array to single object
        },
        {
          $match: {
            driverId: new mongoose.Types.ObjectId(userToken.driverId) // Use 'new' keyword
          }
        }
      ]);
  
      console.log("========== getlocation ================", getlocation);

      function toRad(degrees) {
        return degrees * (Math.PI / 180);
      }
      
      function calculateDistance(longitude1, latitude1, longitude2, latitude2) {
        const earthRadiusKm = 6371; // Earth's radius in kilometers
      
        const c = 
          Math.sin(toRad(latitude1)) * Math.sin(toRad(latitude2)) +
          Math.cos(toRad(latitude1)) * Math.cos(toRad(latitude2)) *
          Math.cos(toRad(longitude2) - toRad(longitude1));
      
        const adjustedC = c > 0 ? Math.min(1, c) : Math.max(-1, c);
      
        return earthRadiusKm * Math.acos(adjustedC); // Distance in kilometers
      }
const getDistance = await getlocation.filter((ele) => {
    // Avoid self-comparison
      const distance =  calculateDistance(
        ele.latitude,
        ele.longitude,
        req.body.datinationLatitude,
        req.body.datinationLongitude
      );
      arrayLocation.push({
        userId: ele.userId,
        distance: distance, // Store the calculated distance
        timeStamp: ele.timestamp
      });
      console.log("------------distance---------------", distance);
      return distance
});

return res.status(201).json({
  data: getlocation,
  distance: arrayLocation,
  message: "Location data fetched successfully"
})
    } catch (error) {
      console.log("------- error ----------", error);
      return res.status(500).json({
        data: false,
        message: error.message
      });
    }
  };









  exports.getOneDayRunningStatus = async (req, res) => {
    try {
      const userToken = tokenChek; 
      console.log("----------- userToken -------------", userToken);
  
      if (!userToken || !userToken.driverId) {
        return res.status(400).json({
          data: false,
          message: "Invalid token or driverId missing",
        });
      }
  
      const driverId = new mongoose.Types.ObjectId(userToken.driverId);
  
      const getlocation = await Driver.aggregate([
        {
          $lookup: {
            from: "locations", // Join with Locations collection
            localField: "_id", // Driver's _id field
            foreignField: "driverId", // Location's driverId field
            as: "driversDetails", // Result alias
          },
        },
        {
          $match: {
            _id: driverId, // Match specific driver
          },
        },
        {
          $unwind: {
            path: "$driversDetails",
            preserveNullAndEmptyArrays: true, // Preserve drivers even without locations
          },
        },
        {
          $group: {
            _id: "$_id", // Group by driver ID
            driverName: { $first: "$driverName" },
            carModel: { $first: "$carModel" },
            isActive: { $first: "$isActive" },
            driversDetails: { $push: "$driversDetails" }, // Collect all locations
          },
        },
      ]);
  
      console.log("========== getlocation ================", getlocation);
  
      if (!getlocation || getlocation.length === 0) {
        return res.status(404).json({
          data: false,
          message: "Driver not found or no data available",
        });
      }
  
      // Haversine formula to calculate distance
      function haversineDistance(lat1, lon1, lat2, lon2) {
        const toRadians = (degrees) => degrees * (Math.PI / 180);
        const R = 6371; // Earth's radius in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
      }
  
      const driverDetails = getlocation[0].driversDetails;
  
      if (!driverDetails || driverDetails.length < 2) {
        return res.status(200).json({
          data: getlocation,
          totalDistance: 0,
          message: "Not enough location data to calculate distance",
        });
      }
  
      let totalDistance = 0;
  
      for (let i = 0; i < driverDetails.length - 1; i++) {
        const { latitude: lat1, longitude: lon1 } = driverDetails[i];
        const { latitude: lat2, longitude: lon2 } = driverDetails[i + 1];
        totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
      }
  
      return res.status(200).json({
        data: getlocation,
        totalDistance,
        message: "Distance calculated successfully",
      });
    } catch (error) {
      console.log("--------- error ----------------", error);
      return res.status(500).json({
        data: false,
        message: error.message,
      });
    }
  };
  