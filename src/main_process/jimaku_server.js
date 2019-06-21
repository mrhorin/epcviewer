import Store from 'js/store'

const http = require('http')
const html = require('fs').readFileSync(__dirname + '/../html/jimaku.html')
const js = require('fs').readFileSync(__dirname + '/jimaku_browser.js')

/*---------------------------------------
  字幕表示用のレスをJSONで返すサーバ
----------------------------------------*/
export default class JimakuServer{

  constructor(port = 3000) {
    this.port = port
    this.posts = []
    this.store = new Store()
    this.server = http.createServer((req, res) => {
      const routes = (url) => {
        let paths = {
          '/': () => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(html)
          },
          '/jimaku_browser.js': () => {
            res.writeHead(200, { 'Content-Type': 'application/javascript' })
            res.end(js)
          },
          '/posts.json': () => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(this.pullPostsJson())
          },
          '/preferences.json': () => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(this.store.preferences))
          },
          '/se.mp3': () => {
            const se = require('fs').readFileSync(this.store.preferences.jimakuSeFilePath)
            res.writeHead(200, { 'Content-Type': 'audio/mpeg' })
            res.end(se)
          },
          '/initialize_posts': () => {
            this.initializePosts()
            let success = (this.posts.length < 1)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(`{ "initializePosts": ${success} }`)
          }
        }
        if(paths[url]) paths[url]()
      }
      routes(req.url)
    })
  }

  get listening() {
    return this.server.listening
  }

  start = () => {
    if(!this.listening) this.server.listen(this.port)
  }

  stop = () => {
    if(this.listening) this.server.close()
  }

  pushPosts = (posts) => {
    if (this.posts.length > 1000) this.posts.shift()
    this.posts = this.posts.concat(posts)
  }

  pullPostsJson = () => {
    let json = JSON.stringify(this.posts)
    this.initializePosts()
    return json
  }

  initializePosts = () => {
    this.posts = []
  }

}