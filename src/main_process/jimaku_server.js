import express from 'express'
import path from 'path'
import Store from 'js/store'

const http = require('http')
const socketIO = require('socket.io')

export default class JimakuServer{

  constructor() {
    this.store = new Store()
    this.app = express()
    this.server = http.Server(this.app)
    this.io = socketIO(this.server)
    this.app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname + '/../html/jimaku.html'))
    })
    this.app.get('/jimaku_browser.js', (req, res) => {
      res.sendFile(path.resolve(__dirname + '/jimaku_browser.js'))
    })
    this.app.get('/se.mp3', (req, res) => {
      res.sendFile(path.resolve(this.store.preferences.jimakuSeFilePath))
    })
    this.io.on('connection', (socket) => {
      socket.emit('update preferences', this.store.preferences)
    })
  }

  emitPosts = (posts) => {
    this.io.emit('posts', posts)
  }

  listen = (port) => {
    this.server.listen(port)
  }

  close = () => {
    this.server.close()
  }

  get isListening() {
    return this.server.listening
  }

}
