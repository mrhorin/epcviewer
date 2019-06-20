import request from 'superagent'

/*----------------------------------------------
  ブラウザ側からJimakuServerへレスを要求して表示する
  OBSのBrowserSourceはChromiumの為SpeechAPIの回数制限あり
----------------------------------------------*/
export default class JimakuBrowser{

  constructor(elementID, port = 3000) {
    this.port = port
    this.posts = []
    this.preferences = {}
    this.element = document.getElementById(elementID)
    this.seElement = document.getElementById('se')
    this.style = { 'font-size': '16px' }
    this.speech = new SpeechSynthesisUtterance()
    this.speech.lang = 'ja-JP'
    Promise.all([
      this.initializeJimakuServerPromise,
      this.fetchPreferencesPromise
    ]).finally(() => {
      this.startPullPosts()
      this.startShowJimaku()
    })
  }

  startShowJimaku = (interval = 300) => {
    this.showJimakuTimerID = setTimeout(() => {
      this.startShowJimaku(this.interval)
      if (!this.isSaying && this.hasPosts) {
        if(this.preferences.isJimakuSe) this.playSe()
        this.showJimaku()
        this.dequeuePost()
      } else if (!this.isSaying) {
        this.hideJimaku()
      }
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
      this.element.style.fontSize = this.preferences.jimakuFontSize + 'px'
      this.element.style.color = this.preferences.jimakuFontColor
      this.element.style.webkitTextStroke = `${this.preferences.jimakuFontOutlineSize}px ${this.preferences.jimakuFontOutlineColor}`
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

  playSe = () => {
    this.seElement.play()
  }

  dequeuePost = () => {
    this.posts.shift()
  }

  // 先頭の投稿を取得
  get post() {
    let ptn = new RegExp(/<("[^"]*"|'[^']*'|[^'">])*>/, "gi")
    return String(this.posts[0].body.replace(ptn, ""))
  }

  get interval() {
    if (this.posts.length <= 0) return 300
    else if (this.posts.length == 1) return 9000
    else if (2 <= this.posts.length <= 3) return 6000
    else if (4 <= this.posts.length <= 5) return 5000
    else if (6 <= this.posts.length <= 10) return 3500
    else if (11 <= this.posts.length <= 15) return 2000
    else return 1000
  }

  get isSaying() {
    return speechSynthesis.speaking
  }

  get hasPosts() {
    return (this.posts.length > 0)
  }

  // JimakuServerを初期化
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

  get fetchPreferencesPromise() {
    return new Promise((resolve, reject) => {
      request
      .get(`http://localhost:${this.port}/preferences.json`)
      .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          this.preferences = res.body
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

let jimaku = new JimakuBrowser('jimaku')