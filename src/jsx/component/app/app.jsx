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
    this.getCurrentUrl = this.getCurrentUrl.bind(this)
    this.bindEvents = this.bindEvents.bind(this)
    this.addBoard = this.addBoard.bind(this)
    this.addPosts = this.addPosts.bind(this)
    this.setListMode = this.setListMode.bind(this)
    this.setCurrentUrl = this.setCurrentUrl.bind(this)
    this.state = {
      boards: [],
      posts: [],
      currentBoard: 0,
      currentThread: 0,
      currentUrl: "",
      listMode: "THREADS"
    }
    this.bindEvents()
    ipcRenderer.send('add-arg-board')
  }

  get currentUrl() {
    let url = ""
    if (this.state.listMode == "THREADS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoard].url
    } else if(this.state.listMode == "POSTS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoard].threads[this.state.currentThread].url
    }
    return url    
  }

  getCurrentUrl(listMode) {
    let url = ""
    if (listMode == "THREADS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoard].url
    } else if(listMode == "POSTS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoard].threads[this.state.currentThread].url
    }
    return url    
  }

  bindEvents() {
    ipcRenderer.on('add-board-reply', (event, board) => {
      this.setState({ currentUrl: this.currentUrl })
      this.addBoard(board)
    })
    ipcRenderer.on('set-posts-reply', (event, posts) => {
      this.setPosts(posts)
    })
  }

  addBoard(board) {
    this.setState({ boards: this.state.boards.concat(board) })
  }

  addPosts(posts) {
    this.setState({
      posts: this.state.posts.concat(posts),
      listMode: "POSTS"
    })
  }

  setPosts(posts) {
    this.setState({
      posts: posts,
      listMode: "POSTS"
    })    
  }

  setListMode(listMode) {
    this.setState({ listMode: listMode })
  }

  setCurrentUrl(url) {
    this.setState({ currentUrl: url })
  }

  render() {
    {/*一覧*/ }
    var compornents = {
      "THREADS": <ThreadBox state={this.state} />,
      "POSTS": <PostBox state={this.state} posts={this.state.posts} />
    }

    return (
      <div>
        <Header state={this.state}
          setListMode={this.setListMode}
          setCurrentUrl={this.setCurrentUrl}
          getCurrentUrl={this.getCurrentUrl} />
        {compornents[this.state.listMode]}
        {/*書き込み欄*/}
        <div id="post-form" className="form-group">
          <textarea className="form-control" rows="3" />
        </div>
        <Footer />
      </div>
    )
  }

}
