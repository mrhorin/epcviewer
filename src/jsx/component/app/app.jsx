/*******************************************************
state
  boards: Board[]
    追加済み板一覧を格納
    Boardオブジェクトは2ch-parserを参照
  threads: Thread[]
    追加済みスレッド一覧を格納
    Threadオブジェクトは2ch-parserを参照
  currentBoardIndex: int
    boards内で現在開いている板のindex
  currentThreadIndex: int
    threads内で現在開いているスレッドのindex
  currentUrl: string
    現在のURL欄の値を
  listMode: string
    現在開いている画面が板一覧かスレッド一覧かを示す
    BOARDSは板一覧、THREADSはスレッド一覧
  updateThreadStatus: string
    スレッドの更新状態を示す
    WAITは更新可能
    UPDATINGは更新中
********************************************************/
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
    this.fetchCurrentBoard = this.fetchCurrentBoard.bind(this)
    this.fetchCurrentThread = this.fetchCurrentThread.bind(this)
    this.startUpdateTimer = this.startUpdateTimer.bind(this)
    this.stopUpdateTimer = this.stopUpdateTimer.bind(this)
    this.state = {
      boards: [],
      threads: [],
      currentBoardIndex: 0,
      currentThreadIndex: 0,
      currentUrl: "",
      listMode: "BOARDS",
      updateThreadStatus: "WAIT"
    }
  }

  bindEvents() {
    ipcRenderer.on('add-board-reply', (event, board) => {
      this.addBoard(board)
    })
    ipcRenderer.on('add-thread-reply', (event, thread) => {
      this.addThread(thread)
    })
    ipcRenderer.on('show-thread-reply', (event, threadUrl) => {
      let index = _.findIndex(this.state.threads, { url: threadUrl })
      if (index >= 0) {
        this.setState({
          currentUrl: threadUrl,
          currentThreadIndex: index,
          listMode: "THREADS"
        })        
      }
    })
    ipcRenderer.on('update-thread-reply', (event, thread) => {
      this.setState({ updateThreadStatus: "WAIT" })
      let index = _.findIndex(this.state.threads, { url: thread.url })
      if (index >= 0) {
        let threads = this.state.threads
        threads[index] = thread
        this.setState({ threads: threads })
      }
    })
    ipcRenderer.on('update-board-reply', (event, board) => {
      let index = _.findIndex(this.state.boards, { url: board.url })
      if (index >= 0) {
        let boards = this.state.boards
        boards[index] = board
        this.setState({ boards: boards })
      }
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

  fetchCurrentBoard() {
    if(this.state.boards.length > 0) ipcRenderer.send('update-board', this.currentBoard)
  }

  // 現在のスレッドの新着レスを取得
  fetchCurrentThread() {
    if (this.state.threads.length > 0 && this.state.updateThreadStatus == "WAIT") {
      this.setState({ updateThreadStatus: "UPDATING" })
      ipcRenderer.send('update-thread', this.currentThread)
    }
  }

  // 自動更新タイマーの開始
  startUpdateTimer() {
    this.updateTimerId = setInterval(() => {
      this.fetchCurrentThread()      
    }, 7000)
  }

  // 自動更新タイマーの停止  
  stopUpdateTimer() {
    clearTimeout(this.updateTimerId)
  }

  componentDidMount() {
    this.bindEvents()
    this.startUpdateTimer()
    ipcRenderer.send('add-arg-board')
  }

  componentWillUnmount() {
    this.stopUpdateTimer()
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
          fetchCurrentBoard={this.fetchCurrentBoard}
          fetchCurrentThread={this.fetchCurrentThread} />
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
