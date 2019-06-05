/*
*/
import React from 'react'
import { emojify } from 'react-emojione'
import _ from 'lodash'

import PostAnchor from 'jsx/component/app/post_anchor'
import PostLink from 'jsx/component/app/post_link'
import PostId from 'jsx/component/app/post_id'

export default class Post extends React.Component {

  constructor(props) {
    super(props)
  }

  get name() {
    return this.escapeHtmlTag(this.props.post.name)
  }

  get body() {
    // 改行タグを置換
    let body = this.props.post.body.replace(/<br>/gi, "\n")
    // 文字実体参照と置換
    body = _.unescape( body)
    // 数値文字参照を置換
    body = this.decodeNumRefToString(body)
    // 絵文字をreact-emojioneの絵文字に置換
    body = this.decodeEmoji(body)
    // URLをPostLinkに置換
    let urlPtn = /h?ttps?:\/\/[-_\.!~*'()a-zA-Z0-9;\/?:@&=+$,%#¥]+/ig
    body = this.replaceStringWithComponent(body, urlPtn, (match, index) => {
      return (
        <PostLink key={index+'-'+this.randomKey} url={match} />
      )
    })
    // アンカーをPostAnchorに置換
    let anchorPtn = /<a.*?>>([0-9]+)<\/a>/gi
    let tagPtn = /<("[^"]*"|'[^']*'|[^'">])*>|>>/gi
    body = this.replaceStringWithComponent(body, anchorPtn, (match, index) => {
      // アンカー先のレスを取得
      let no = this.escapeHtmlTag(match)
      let anchored_post = this.props.getPost(no)
      return (
        <PostAnchor key={index+'-'+this.randomKey} anchored_post={anchored_post} getPost={this.props.getPost} />
      )     
    })
    return body
  }

  get isAdmin() {
    return Array.isArray(this.props.post.name.match(/★/gi))
  }

  get hasId() {
    return (this.props.post.id && !(this.props.post.id.match(/\?\?\?/gi))) ? true : false
  }

  get randomKey() {
    let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&=~/*-+"
    let res = ""
    for (let i = 0; i < 10; i++){
      res += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return res
  }

  getHtmlTagRegExp = (flags) => {
    return new RegExp(/<("[^"]*"|'[^']*'|[^'">])*>|>>/, flags)
  }

  // regexpにmatchした文字列をコンポーネントと置換
  replaceStringWithComponent = (body, regexp, componentFunc) => {
    const getComponent = (text) => {
      let elements = []
      // matchした箇所をセパレータで区切る
      text = text.replace(regexp, (match) => {
        return `<>${match}<>`
      })
      text.split("<>").map((currentValue, index) => {
        if (currentValue.match(regexp)) {
          // matchしたエレメント
          elements.push(
            componentFunc(currentValue, index)
          )
        } else {
          elements.push(currentValue)
        }
      })
      return elements
    }
    if (typeof body == "string") {
      // 文字列をコンポーネントと置換
      return getComponent(body)
    } else if (Array.isArray(body)) {
      // 配列の場合は文字列要素だけをコンポーネントと置換
      let res = []
      body.forEach((currentValue, index) => {
        if (typeof currentValue == "string") {
          res = res.concat(getComponent(currentValue))
        } else {
          res.push(currentValue)
        }
      })
      return res
    } else {
      throw "body isn't a string or array."
    }
  }

  escapeHtmlTag = (text) => {
    return text.replace(this.getHtmlTagRegExp("gi"), "")
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
            backgroundImage: 'url("../../src/img/common/emojione-3.1.2-32x32.png")',
            width: 14, height: 14, margin: 0, top: -2
          }
    }
    return emojify(text, options)
  }

  componentDidMount() {
    this.postElement = window.document.getElementById(`post-${this.props.no}`)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.post != nextProps.post
  }

  render() {
    let nameClass = (this.isAdmin) ? "post-name post-name-admin" : "post-name"
    let postId = (this.hasId) ? (
      <PostId getIdCounter={this.props.getIdCounter} id={this.props.post.id} no={this.props.post.no} />
    ) : ( "" )
    return (
      <div id={`post-${this.props.no}`} className="post">
        <div className="post-header">
          <span className="post-no">{this.props.post.no}</span>:
          <span className={nameClass}>{this.name}</span>
          <span className="post-mail">[{this.props.post.mail}]</span>
          <span className="post-date">{this.props.post.date}</span>
          {postId}
        </div>
        <div className="post-body">
          {this.body}
        </div>
      </div>
    )
  }

}
