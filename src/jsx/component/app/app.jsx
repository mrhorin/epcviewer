import React from 'react'
import { ipcRenderer } from 'electron'

import Header from 'jsx/component/app/header'
import ThreadBox from 'jsx/component/app/thread_box'
import PostBox from 'jsx/component/app/post_box'
import Footer from 'jsx/component/app/footer'

// アプリケーションのメインウィンドウ
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.bindEvents = this.bindEvents.bind(this)
    this.bindEvents()
    ipcRenderer.send('add-arg-board')
  }

  bindEvents() {
    ipcRenderer.on('add-board-reply', (event, board) => {
      this.props.addBoard(board)
    })
    ipcRenderer.on('fetch-posts-reply', (event, posts) => {
      console.log(posts)
    })
  }

  render() {
    {/*一覧*/ }
    var compornents = {
      "THREADS": <ThreadBox state={this.props} />,
      "POSTS": <PostBox state={this.props} />
    }

    return (
      <div>
        <Header state={this.props} />
        {compornents[this.props.listMode]}
        {/*書き込み欄*/}
        <div id="post-form" className="form-group">
          <textarea className="form-control" rows="3" />
        </div>
        <Footer />
      </div>
    )
  }

}
