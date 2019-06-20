import storage from 'js/storage'

const http = require('http')
const html = require('fs').readFileSync('dist/html/jimaku.html')
const js = require('fs').readFileSync('dist/js/jimaku_browser.js')

/*---------------------------------------
  字幕表示用のレスをJSONで返すサーバ
----------------------------------------*/
export default class JimakuServer{

  constructor(port = 3000) {
    this.posts = []
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
            storage.preferencesPromise.then((preference) => {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(preference))
            })
          },
          '/se.mp3': () => {
            storage.preferencesPromise.then((preference) => {
              const se = require('fs').readFileSync(preference.jimakuSeFilePath)
              res.writeHead(200, { 'Content-Type': 'audio/mpeg' })
              res.end(se)
            })
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
    }).listen(port)
  }

  pushPosts = (posts) => {
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