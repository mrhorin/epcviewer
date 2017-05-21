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

  getPost = (no) => {
    const index = _.findIndex(this.props.posts, { no: no })
    return this.props.posts[index]
  }

  // 書き込み一覧の一番下までスクロール  
  scrollBottom = () => {
    this.postBox.scrollIntoView(false)
  }

  showContextMenu = (e) => {
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
    if (this.props.boards.length > 0 && this.props.posts.length > 0) {
      posts = this.props.posts.map((post, index) => {
        return <Post key={index} no={index + 2} post={post} getPost={this.getPost}/>
      })
    }
    let tabs = []
    if (this.props.threads.length > 0) {
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
        <div id="post-box" onContextMenu={this.showContextMenu}>
          {posts}
          <div id="post-box-end"/>
        </div>
      </div>
    )
  }

}