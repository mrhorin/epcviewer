import { spawn } from 'child_process'

export default class Say {

  constructor() {
    this.posts = []
    this.isSaying = false
  }

  addPosts = (posts) => {
    this.posts = this.posts.concat(posts)
  }

  play = () => {
    if (!this.isSaying && this.hasPosts) {
      this.isSaying = true
      let sayPromise = new Promise((resolve, reject) => {
        let post = this.posts.shift()
        let say = spawn('say', [`[[ volm 0.3; ]] レス${post.no}、${this.omitBody(post.body)}、`])
        // 読み上げ終了時
        say.on('close', (code) => {
          resolve(post)
        })
        say.stderr.on('data', (data) => {
          reject(post)
        })
      })
      sayPromise.then((res) => {
        this.isSaying = false
        // 読み上げ待ちレスがある場合は再帰呼出し
        if (this.hasPosts) {
          this.play()
        }
      }).catch((res) => {
        this.isSaying = false
        // 読み上げ待ちレスがある場合は再帰呼出し
        if (this.hasPosts) {
          this.play()
        }
      })
    }
  }

  stop = () => {
    this.posts = []
    this.isSaying = false
  }

  omitBody = (body) => {
    // URLを省略、開業タグを削除
    body = body.replace(/h?ttps?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/gi, 'URL').replace(/<br>/gi, "")
    // 長文以下省略
    if (body.length > 100) {
      body = body.substr(0,140) + '、以下省略、'
    }
    return body
  }

  get hasPosts() {
    if (this.posts.length > 0) {
      return true
    } else {
      return false
    }
  }

}