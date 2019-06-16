import request from 'superagent'

/*----------------------------------------------
  ブラウザからJimakuServerからレスを取得して表示する
----------------------------------------------*/
export default class Jimaku{
  
  constructor(elementID, port = 3000) {
    this.port = port
    this.posts = []
    this.element = document.getElementById(elementID)
    this.style = { 'font-size': '16px' }
    this.speech = new SpeechSynthesisUtterance()
    this.speech.lang = 'ja-JP'
    this.initializeJimakuServerPromise.finally(() => {
      this.showJimakuTimerID
      this.pullPostsTimerID
    })
  }

  startShowJimaku = (interval = 300) => {
    this.showJimakuTimerID = setTimeout(() => {
      if (!this.isSaying && this.hasPosts) {
        this.showJimaku()
        this.say()
        this.dequeuePost()
      } else if (!this.isSaying) {
        this.hideJimaku()
      }
      this.startShowJimaku()
    }, interval)
  }

  startPullPosts = (interval = 3000) => {
    this.pullPostsTimerID = setTimeout(() => {
      this.pullPostsPromise.finally(() => {
        this.startPullPosts()
      })
    }, interval)
  }

  showJimaku = () => {
    if (this.posts.length > 0) {
      this.element.innerHTML = this.post
    }
  }

  hideJimaku = () => {
    this.element.innerHTML = ""
  }

  say = () => {
    this.speech.text = this.post
    speechSynthesis.speak(this.speech)
  }

  dequeuePost = () => {
    this.posts.shift()    
  }

  // 先頭の投稿を取得
  get post() {
    let ptn = new RegExp(/<("[^"]*"|'[^']*'|[^'">])*>/, "gi")
    return String(this.posts[0].body.replace(ptn, ""))
  }

  get isSaying() {
    return speechSynthesis.speaking
  }

  get hasPosts() {
    return (this.posts.length > 0)
  }

  get initializeJimakuServerPromise() {
    return new Promise((resolve, reject) => {
      request
        .get(`http://localhost:${this.port}/initialize_posts`)
        .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  get pullPostsPromise() {
    return new Promise((resolve, reject) => {
      request
        .get(`http://localhost:${this.port}/posts.json`)
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            this.posts = this.posts.concat(res.body)
            resolve(res)        
          }
        })
    })
  }

}

let jimaku = new Jimaku('jimaku')
jimaku.startPullPosts()
jimaku.startShowJimaku()