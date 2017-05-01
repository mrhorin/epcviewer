import {app, BrowserWindow} from 'electron'
import {Board, Thread} from '2ch-parser'

var window = { app: null }

// 掲示板URL
const url = global.process.argv[2]

app.on('ready', ()=>{

  window.index = new BrowserWindow({
    width: 320,
    height: 640,
  })
  window.index.loadURL(`file://${__dirname}/html/app.html`)
  window.index.openDevTools()

  var jbbs = new Board(url)

})
