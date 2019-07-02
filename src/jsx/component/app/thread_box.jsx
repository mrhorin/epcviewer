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

  get currentThread() {
    return this.props.threads[this.props.currentThreadIndex]
  }

  get currentPosts() {
    return this.props.threads[this.props.currentThreadIndex].posts
  }

  get hasPost() {
    return this.currentPosts.length > 0
  }

  // 一番下までスクロールしているか
  get isMostBottom() {
    // ウィンドウ縦サイズを取得
    const getWindowHeight = () => {
      let height = window.innerHeight
      if (!height) {
          let mode = document.compatMode
          if (mode) {
              let domObject = mode == "CSS1Compat" ? document.documentElement : document.body
              height = domObject.clientHeight
          }
      }
      return height
    }
    var offsetY = this.postBox.getBoundingClientRect().top
    var viewportHeight = getWindowHeight()
    var style = this.postBox.currentStyle || document.defaultView.getComputedStyle(this.postBox, '')
    var height = parseInt(style.height)
    return (0 < offsetY && offsetY + height < viewportHeight)
  }

  // 引数の番号のレスを取得
  getPost = (no) => {
    const index = _.findIndex(this.currentPosts, { no: Number(no) })
    return this.currentPosts[index]
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

  shouldComponentUpdate(nextProps) {
    return (this.currentPosts !== nextProps.posts) ||
      (this.props.threads !== nextProps.threads) ||
      (this.props.isAutoScroll !== nextProps.isAutoScroll) ||
      (this.props.isShowWriteForm !== nextProps.isShowWriteForm)
  }

  componentDidUpdate(prevProps) {
    // 書き込み欄が表示されたら && 一番下なら || 新着レスがあったら強制スクロール
    if (this.props.isAutoScroll || this.isMostBottom) {
      this.scrollBottom()
    }
  }

  render() {
    let posts = []
    if (this.props.hasBoard && this.hasPost) {
      posts = this.currentPosts.map((post, index) => {
        let idCounter = post.id ? this.currentThread.idCounter[post.id] : []
        return <Post key={index} no={index + 2} post={post} getPost={this.getPost} idCounter={idCounter} />
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