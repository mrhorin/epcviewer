import React from 'react'
import { shell, remote } from 'electron'
import _ from 'lodash'

import Tab from 'jsx/component/common/tab'
import Post from 'jsx/component/app/post'

/* スレッド一覧 */
export default class ThreadBox extends React.Component {

  constructor(props) {
    super(props)
  }

  get hasPost() {
    return this.props.posts.length > 0
  }

  // 引数の番号のレスを取得  
  getPost = (no) => {
    const index = _.findIndex(this.props.posts, { no: Number(no) })
    return this.props.posts[index]
  }

  // 引数の番号のレスのIDカウンターを取得
  getIdCounter = (no) => {
    // 全IDごとの格納位置を集計
    let idCounters = {}
    this.props.posts.forEach((currentValue, index) => {
      if ((idCounters[currentValue.id]) && !(currentValue.id.match(/\?\?\?/gi))) {
        idCounters[currentValue.id].push(index+1)
      } else if (currentValue.id && !(currentValue.id.match(/\?\?\?/gi))) {
        idCounters[currentValue.id] = [index+1]
      }
    })
    // no番のレスのIDが何回目の発言か
    let noIndex = Number(no) - 1
    let id = this.props.posts[noIndex].id
    let count = idCounters[id].findIndex((value, index) => {
      return value == no
    })
    return { count: Number(count) + 1, total: idCounters[id].length }
  }

  // 書き込み一覧の一番下までスクロール
  scrollBottom = () => {
    this.postBox.scrollIntoView(false)
  }

  // 規定ブラウザで開く
  openBrowser = (url) => {
    shell.openExternal(url)
  }
  
  _removeThread = (threadUrl) => {
    this.props.removeThread(threadUrl)
  }

  _selectThread = (index) => {
    this.props.selectThread(index)
  }

  _onContextMenuPostBoxHandler = (e) => {
    const clipboard = remote.clipboard
    const Menu =  remote.Menu
    const MenuItem =  remote.MenuItem
    let menu = new Menu()
    menu.append(new MenuItem({
      label: 'コピー',
      click: () => {
        clipboard.writeText(document.getSelection().toString())
      }
    }))
    menu.append(new MenuItem({
      label: 'Googleで検索',
      click: () => {
        let q = document.getSelection().toString().replace(/\s/gi, '+')
        this.openBrowser(`https://www.google.co.jp/search?q=${q}`)  
      }
    }))
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }

  componentDidMount() {
    this.postBox = window.document.getElementById("post-box-end")
    this.scrollBottom()
  }

  componentDidUpdate() {
    // オートスクロール
    if(this.props.isAutoScroll) this.scrollBottom()
  }

  render() {
    let posts = []
    if (this.props.hasBoard && this.hasPost) {
      posts = this.props.posts.map((post, index) => {
        return <Post key={index} no={index + 2} post={post} getPost={this.getPost} getIdCounter={this.getIdCounter}/>
      })
    }
    let tabs = []
    if (this.props.hasThread) {
      tabs = this.props.threads.map((thread, index) => {
        const active = this.props.currentThreadIndex==index
        return (
          <Tab key={index} index={index} name={thread.title} url={thread.url} active={active}
            removeTab={this._removeThread} selectTab={this._selectThread} />
        )
      })
    }
    return (
      <div id="thread-box">
        {/*スレッドタブ*/}
        <div id="thread-tab-box">
          <div className="tab-group">
            {tabs}
          </div>
        </div>
        {/*書き込み一覧*/}
        <div id="post-box" onContextMenu={this._onContextMenuPostBoxHandler}>
          {posts}
          <div id="post-box-end"/>
        </div>
      </div>
    )
  }

}