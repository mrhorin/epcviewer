import React from 'react'
import { shell } from 'electron'

export default class Post extends React.Component {

  constructor(props) {
    super(props)
  }
  
  parseBody = (text) => {
    return this.replaceUrl(text)
  }

  // URLを置換  
  replaceUrl = (text) => {
    var elements = []
    const ptn = /h?ttps?:\/\/[-_\.!~*'()a-zA-Z0-9;\/?:@&=+$,%#¥]+/i
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
        <div className="post-body-line" key={index}>{line}</div>
      )
    })
  }

  // 規定ブラウザで開く
  openBrowser = (url) => {
    shell.openExternal(url)
  }

  render() {
    // IDがある場合は ID: を付加する
    if(this.props.post.id) this.props.post.id = "ID:"+this.props.post.id

    return (
      <div className="post">
        <div className="post-header">
          <span className="post-no">{this.props.post.no}</span>
          <span className="post-name">{this.props.post.name}</span>
          <span className="post-mail">[{this.props.post.mail}]</span>
          <span className="post-date">{this.props.post.date}</span>
          <span className="post-id">{this.props.post.id}</span>
        </div>
        <div className="post-body">
          {this.parseBody(this.props.post.body)}
        </div>
      </div>
    )
  }

}
