import React from 'react'
import { emojify } from 'react-emojione'
import { shell } from 'electron'
import _ from 'lodash'

export default class Post extends React.Component {

  constructor(props) {
    super(props)
  }

  // IDがある場合は ID: を付加  
  printId = (id) => {
    return id ? `ID:${id}` : ''
  }

  parseBody = (text) => {
    return this.replaceUrl(_.unescape(text))
  }

  // URLを置換  
  replaceUrl = (text) => {
    var elements = []
    const ptn = /h?ttps?:\/\/[-_\.!~*'()a-zA-Z0-9;\/?:@&=+$,%#¥]+/ig
    // URLをセパレータで区切る
    text = text.replace(ptn, (url) => { return `<>${url}<>` })
    text.split("<>").map((element, index) => {
      if (element.match(ptn)) {
        // URLをリンク化
        elements.push(<a key={index} onClick={() => { this.openBrowser(element) }}>{element}</a>)
      } else {
        elements.push(this.replaceBr(element))
      }
    })
    return elements
  }

  // 改行タグを置換  
  replaceBr = (text) => {
    return text.split("<br>").map((line, index) => {
      return (
        <div className="post-body-line" key={index}>{this.replaceAnker(line)}</div>
      )
    })
  }

  // 安価を置換  
  replaceAnker = (text) => {
    var elements = []
    const ptn = /(<a href=.+)(>>[0-9]+)(<\/a>)/i
    text = text.replace(ptn, (match, astart, anker, aend) => { return `<>${anker}<>` })
    text.split('<>').map((element, index) => {
      if (element.match(/^(>>)([0-9]+)$/)) {
        elements.push(
          <a key={index} onMouseOver={this.onAnkerMouseOverrHandler} onMouseOut={this.onAnkerMouseOutHandler}>
            {element}
          </a>
        )
      } else {
        element = this.decodeNumRefToString(element)
        element = this.decodeEmoji(element)
        elements.push(element)
      }
    })
    return elements
  }

  // 数値文字参照を文字列に
  decodeNumRefToString = (text) => {
    return text.replace(/&#(\d+);/ig, (match, $code, idx, all) => {
      return String.fromCodePoint($code)
    })
  }

  // 絵文字  
  decodeEmoji = (text) => {
    const options = {
          convertShortnames: true,
          convertUnicode: true,
          convertAscii: true,
          style: {
            backgroundImage: 'url("../../src/img/common/emojione.sprites.png")',
            width: 14, height: 14, margin: 0, top: -2
          }
    }
    return emojify(text, options)
  }

  // 規定ブラウザで開く
  openBrowser = (url) => {
    shell.openExternal(url)
  }

  // レス安価onMouseOverハンドラ
  onAnkerMouseOverrHandler = (e) => {
    const no = Number(_.unescape(e.target.innerHTML).replace(/^>>/, ''))
    const post = this.props.getPost(no)
    if (post) {
      this.postElement.children[0].style.display = 'block'
      this.postElement.children[0].style.top = `${e.clientY}px`
      this.postElement.children[0].style.left = `${e.clientX+10}px`
      this.postElement.children[0].innerHTML = `${no}:${post.name}[${post.mail}]${post.date} ${this.printId(post.id)}<br>${post.body}`      
    }
  }

  // レス安価onMouseOutハンドラ
  onAnkerMouseOutHandler = (e) => {
    this.postElement.children[0].style.display = 'none'
    this.postElement.children[0].innerHTML = ''
  }

  componentDidMount() {
    this.postElement = window.document.getElementById(`post-${this.props.no}`)
  }

  render() {
    return (
      <div id={`post-${this.props.no}`} className="post">
        <div className="post-anker">
        </div>
        <div className="post-header">
          <span className="post-no">{this.props.post.no}</span>:
          <span className="post-name">{this.props.post.name}</span>
          <span className="post-mail">[{this.props.post.mail}]</span>
          <span className="post-date">{this.props.post.date}</span>
          <span className="post-id">{this.printId(this.props.post.id)}</span>
        </div>
        <div className="post-body">
          {this.parseBody(this.props.post.body)}
        </div>
      </div>
    )
  }

}
