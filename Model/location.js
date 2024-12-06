const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver', 
    required: true 
},
  latitude: { 
    type: Number, 
    required: true 
},
  longitude: { 
    type: Number, 
    required: true 
},
  timestamp: { 
    type: Date, 
    default: Date.now 
}
});

module.exports = mongoose.model('Location', locationSchema);


