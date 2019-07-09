import request from 'superagent'
import io from 'socket.io-client'

/*----------------------------------------------
  ブラウザ側からJimakuServerへレスを要求して表示する
  OBSのBrowserSourceはChromiumの為SpeechAPIの回数制限あり
----------------------------------------------*/
export default class JimakuBrowser{

  constructor(elementID) {
    this._posts = []
    this.preferences = {}
    this.port = location.port
    this.element = document.getElementById(elementID)
    this.seElement = document.getElementById('se')
    this.style = { 'font-size': '16px' }
    this.speech = new SpeechSynthesisUtterance()
    this.speech.lang = 'ja-JP'
    this.socket = io.connect(`http://localhost:${this.port}`)
    this.socket.on('update preferences', (preferences) => {
      this.preferences = preferences
    })
    this.socket.on('posts', (posts) => {
      this.pushPosts(posts)
    })
    this.startShowJimaku()
  }

  startShowJimaku = (interval = 100) => {
    this.showJimakuTimerID = setTimeout(() => {
      this.startShowJimaku(this.interval)
      if (!this.isSaying && this.hasPosts) {
        if (this.preferences.isJimakuSe) this.playSe()
        this.showJimaku()
        this.dequeueCurrentPost()
      } else if (!this.isSaying) {
        this.hideJimaku()
      }
    }, interval)
  }

  showJimaku = () => {
    this.element.style.fontSize = this.preferences.jimakuFontSize + 'px'
    this.element.style.color = this.preferences.jimakuFontColor
    this.element.style.webkitTextStroke = `${this.preferences.jimakuFontOutlineSize}px ${this.preferences.jimakuFontOutlineColor}`
    this.element.innerHTML = this.currentPost
  }

  hideJimaku = () => {
    this.element.innerHTML = ""
  }

  dequeueCurrentPost = () => {
    this._posts.shift()
  }

  say = () => {
    this.speech.text = this.post
    speechSynthesis.speak(this.speech)
  }

  playSe = () => {
    if (this.preferences.jimakuSeFilePath) {
      this.seElement.volume = Number(this.preferences.jimakuSeVolume) / 10
      this.seElement.play()
    }
  }

  pushPosts = (posts) => {
    this.posts = this.posts.concat(posts)
  }

  get posts() {
    return this._posts
  }

  set posts(posts) {
    this._posts = posts
  }

  get currentPost() {
    let ptn = new RegExp(/(?!<br>)<("[^"]*"|'[^']*'|[^'">])*>/, "gi")
    return String(this.posts[0].body.replace(ptn, ""))
  }

  get interval() {
    let length = this.posts.length
    if (length <= 0) return 100
    else if (length == 1) return 9000
    else if (2 <= length && length <= 3) return 7000
    else if (4 <= length && length <= 5) return 5000
    else if (6 <= length && length <= 10) return 3500
    else if (11 <= length && length <= 15) return 2000
    else return 1000
  }

  get isSaying() {
    return speechSynthesis.speaking
  }

  // 未読のレスがあるか
  get hasPosts() {
    return (this.posts.length > 0)
  }

}

let jimaku = new JimakuBrowser('jimaku')