import React from 'react'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

import Header from 'jsx/component/app/header'
import BoardBox from 'jsx/component/app/board_box'
import ThreadBox from 'jsx/component/app/thread_box'
import Footer from 'jsx/component/app/footer'

/* アプリケーションのメインウィンドウ */
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.bindEvents = this.bindEvents.bind(this)
    this.addBoard = this.addBoard.bind(this)
    this.addThread = this.addThread.bind(this)
    this.getCurrentUrl = this.getCurrentUrl.bind(this)
    this.setCurrentUrl = this.setCurrentUrl.bind(this)
    this.setListMode = this.setListMode.bind(this)
    this.updateCurrentBoard = this.updateCurrentBoard.bind(this)
    this.updateCurrentThread = this.updateCurrentThread.bind(this)
    this.state = {
      boards: [],
      threads: [],
      currentBoardIndex: 0,
      currentThreadIndex: 0,
      currentUrl: "",
      listMode: "BOARDS"
    }
  }

  bindEvents() {
    ipcRenderer.on('add-board-reply', (event, board) => {
      this.addBoard(board)
    })
    ipcRenderer.on('add-thread-reply', (event, thread) => {
      this.addThread(thread)
    })
  }

  addBoard(board) {
    // state.boards内のboardの位置
    let index = _.findIndex(this.state.boards, { url: board.url })
    if (index >= 0) {
      // boardを表示
      this.setState({
        currentUrl: board.url,
        currentBoardIndex: index,
        listMode: "BOARDS"
      })
    } else {
      // boardを追加して表示
      this.setState({
        boards: this.state.boards.concat(board),
        currentUrl: board.url,
        currentBoardIndex: this.state.boards.length,
        listMode: "BOARDS"
      })      
    }
  }

  addThread(thread) {
    // state.threads内のthreadの位置
    let index = _.findIndex(this.state.threads, { url: thread.url })
    if (index >= 0) {
      // threadを表示
      this.setState({
        currentUrl: thread.url,
        currentThreadIndex: index,
        listMode: "THREADS"
      })
    } else {
      // threadを追加して表示
      this.setState({
        threads: this.state.threads.concat(thread),
        currentUrl: thread.url,
        currentThreadIndex: this.state.threads.length,
        listMode: "THREADS"
      })      
    }
  }

  // 現在の板を取得  
  get currentBoard() {
    if (this.state.boards.length > 0) {
      return this.state.boards[this.state.currentBoardIndex]
    } else {
      return { subjectUrl: "", url: "", threads: [] }
    }    
  }

  // 現在のスレッドを取得
  get currentThread() {
    if (this.state.threads.length > 0) {
      return this.state.threads[this.state.currentThreadIndex]
    } else {
      return { datUrl: "", headers: {},url: "", posts: [], title: "" }
    }
  }

  // 指定したリストモードの現在のURLを取得  
  getCurrentUrl(listMode) {
    let url = ""
    if (listMode == "BOARDS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoardIndex].url
    } else if(listMode == "THREADS" && this.state.boards.length > 0) {
      url = this.state.boards[this.state.currentBoardIndex].threads[this.state.currentThreadIndex].url
    }
    return url    
  }

  setCurrentUrl(url) {
    this.setState({ currentUrl: url })
  }

  setListMode(listMode) {
    this.setState({ listMode: listMode })
  }

  // 現在の板を更新  
  updateCurrentBoard() {
    console.log("BOARD")
  }

  // 現在のスレッドを更新  
  updateCurrentThread() {
    console.log("THREAD")
  }

  componentDidMount() {
    this.bindEvents()
    ipcRenderer.send('add-arg-board')
  }

  render() {
    var components = {
      "BOARDS": <BoardBox state={this.state} />,
      "THREADS": <ThreadBox state={this.state} posts={this.currentThread.posts} />
    }

    return (
      <div>
        <Header state={this.state}
          setListMode={this.setListMode}
          setCurrentUrl={this.setCurrentUrl}
          getCurrentUrl={this.getCurrentUrl}
          updateCurrentBoard={this.updateCurrentBoard}
          updateCurrentThread={this.updateCurrentThread} />
        {components[this.state.listMode]}
        {/*書き込み欄*/}
        <div id="post-form" className="form-group">
          <textarea className="form-control" rows="3" />
        </div>
        <Footer />
      </div>
    )
  }

}
