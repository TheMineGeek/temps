var mongoose = require('mongoose')

var tempSchema = mongoose.Schema({
  temps: {
    cpu0: {
      type: [Number]
    },
    cpu1: {
      type: [Number]
    },
    avcpu0: Number,
    avcpu1: Number,

    disks: [mongoose.Schema.Types.Mixed],
    avdisks: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
})

var Temp = mongoose.model('Temp', tempSchema)

module.exports = Temp