const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')

const Temp = require("./models/temp")
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

mongoose.connect('mongodb://mongo.local/temp', (err) => {
  if(err) throw err
  else console.log('Connected to database')
})

app.get('/info', (req, res) => {
  res.send('API running')
})

app.get('/', (req, res) => {
  Temp.find().limit(50).exec((err, data) => {
    if(err) throw err;
    res.send(data);
  })
})

app.post('/', (req, res) => {
  let cpusData = req.body.cpus.split("\n")
  let hddData = req.body.disks.split("\n")

  let i = 0;
  while(i != cpusData.length) {
    if(cpusData[i][0] == "C") {
      i++
    } else {
      cpusData.splice(i, 1)
    }
  }

  var cores = []
  var avs = [] // averages
  for(let j = 0; j < 2; j++) {
    cores[j] = []
    let av = 0;
    for(let k = 0; k < 8; k++) {
      //console.log(cpusData[(j+1)*k].match(/(\d{2}.\d)/)[0])
      cores[j][k] = parseInt(cpusData[(j+1)*k].match(/(\d{2}.\d)/)[0])
      av += cores[j][k]
    }
    avs[j] = (av / 8).toFixed(1)
  }

  var brandRE = /\s([a-zA-Z0-9-]*)\s/
  var modelRE = /\s([a-zA-Z0-9-]*):/
  var tempRE = /(\d+)°C/

  var disks = []
  let avdisks = 0

  for(let j = 0; j < hddData.length; j++) {
    let _disk = {
      brand: hddData[j].match(brandRE)[0],
      model: hddData[j].match(modelRE)[0],
      temp: parseInt(hddData[j].match(tempRE))
    }
    avdisks += _disk.temp
    disks[j] = _disk
  }

  avdisks = (avdisks / hddData.length).toFixed(1)

  let tempReport = new Temp()
  tempReport.temps.cpu0 = cores[0]
  tempReport.temps.cpu1 = cores[1]
  tempReport.temps.avcpu0 = avs[0]
  tempReport.temps.avcpu1 = avs[1]
  tempReport.temps.disks = disks
  tempReport.temps.avdisks = avdisks

  tempReport.save((err) => {
    if(err) throw err
    console.log(Date.now + "Saved to database")
    res.send("done")
  })
})

app.listen(3000, () => {
  console.log("Start listening on port 3000")
})