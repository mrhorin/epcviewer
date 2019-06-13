const http = require('http')
const html = require('fs').readFileSync('dist/html/jimaku.html')
const js = require('fs').readFileSync('dist/js/jimaku.js')

/*---------------------------------------
  ブラウザウィンドウで取り組む用の字幕サーバー
  main.jsで新着レスをpushPosts
  新着レスはJSONで返す
  jimaku.js タイマーを回して定期的にJSONを要求
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
          '/jimaku.js': () => {
            res.writeHead(200, { 'Content-Type': 'application/javascript' })
            res.end(js)
          },
          '/posts.json': () => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(this.pullPostsJson())
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

  initializePosts = () => {
    this.posts = []
  }

  pullPostsJson = () => {
    let json = JSON.stringify(this.posts)
    this.initializePosts()
    return json
  }

}