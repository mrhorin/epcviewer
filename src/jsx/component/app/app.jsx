/*******************************************************
state
  boards: Board[]
    追加済み板一覧を格納
    Boardオブジェクトは2ch-parserを参照
  threads: Thread[]
    追加済みスレッド一覧を格納
    Threadオブジェクトは2ch-parserを参照
  currentBoardIndex: int
    state.boards内で現在開いている板のindex
  currentThreadIndex: int
    state.threads内で現在開いているスレッドのindex
  currentUrl: string
    現在のURL欄の値
  listMode: string
    現在開いている画面が板一覧かスレッド一覧かを示す
    BOARDSは板一覧画面
    THREADSはスレッド一覧画面
  updateStatus: string
    現在の更新状態を示す
    WAITは待機中
    UPDATINGは更新中
    POSTINGは投稿中
  isAutoUpdate: bool
    スレッドの自動更新のON/OFF状態
  isAutoScroll: bool
    スレッドのオートスクロールのON/OFF状態
  isJimakuServer: bool
    字幕サーバーの起動状態のON/OFF状態
********************************************************/
import React from 'react'
import { ipcRenderer, shell } from 'electron'

import Header from 'jsx/component/app/header'
import BoardBox from 'jsx/component/app/board_box'
import ThreadBox from 'jsx/component/app/thread_box'
import Footer from 'jsx/component/app/footer'

import Store from 'js/store'

import _ from 'lodash'
import { Map, List } from 'immutable'

/* アプリケーションのメインウィンドウ */
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.store = new Store()
    this.state = this.store.defaultAppState
    this.preferences = this.store.preferences
    this.bindEvents()
  }

  bindEvents = () => {
    ipcRenderer.on('add-board-reply', (event, board, err) => {
      if (err) this.outputLog('板取得失敗')
      if (board) this.addBoard(board)
      this.setUpdateStatus('WAIT')
    })
    ipcRenderer.on('add-thread-reply', (event, thread, err) => {
      if (err) this.outputLog('スレッド取得失敗')
      if (thread) this.addThread(thread)
      this.setUpdateStatus('WAIT')
    })
    ipcRenderer.on('update-thread-reply', (event, thread) => {
      let index = this.findIndexOfThreads(thread)
      // 新着レスがあるか
      if ((index >= 0) && (thread.posts.length > 0) && (this.state.currentThreadIndex == index)) {
        let nextState = this.state
        // 新着レスをstateにセット
        nextState.threads[index].posts = nextState.threads[index].posts.concat(thread.posts)
        nextState.threads[index].headers.contentLength += thread.headers.contentLength
        nextState.threads[index].headers.lastModified = thread.headers.lastModified
        nextState.threads[index].idCounter = this.getIdCounter(nextState.threads[index].posts)
        this.setState({ threads: nextState.threads, updateStatus: "WAIT" })
        // stateの状態を保存
        this.store.setAppState(nextState)
      } else {
        this.setUpdateStatus('WAIT')
      }
    })
    ipcRenderer.on('update-board-reply', (event, board, err) => {
      if (err) {
        this.outputLog('板更新失敗')
      } else {
        let index = _.findIndex(this.state.boards, { url: board.url })
        if (index >= 0) {
          let boards = this.state.boards
          board.title = boards[index].title
          boards[index] = board
          this.setState({ boards: boards })
        }
      }
      this.setUpdateStatus('WAIT')
    })
    ipcRenderer.on('post-write-reply', (event, res) => {
      this.setUpdateStatus('WAIT')
      if (res.statusCode == 200) {
        this.writeFormTextarea.value = ""
      } else {
        // レスポンスヘッダのcontent-lengthからエラー内容を判別
        let messages = {
          '605': 'ホスト規制中',
          '615': 'NGワードが含まれています',
          '634': '多重書き込みです',
          'etc': '書き込み失敗'
        }
        let length = res.headers['content-length'] ? String(res.headers['content-length']) : '0'
        let key = (Object.keys(messages).indexOf(length) >= 0) ? (length) : ('etc')
        this.outputLog(`${messages[key]}`)
      }
      this.writeFormTextarea.disabled = false
      this.writeFormTextarea.focus()
    })
    ipcRenderer.on('update-preferences', (event, preferences) => {
      this.preferences = preferences
      this.setState({ theme: preferences.theme })
    })
    ipcRenderer.on('shortcut-tab-left', (event) => { this.moveLeftTab() })
    ipcRenderer.on('shortcut-tab-right', (event) => { this.moveRightTab() })
    ipcRenderer.on('shortcut-tab-close', (event) => { this.closeCurrentTab() })
    ipcRenderer.on('shortcut-show-boards', (event) => { this.setListMode('BOARDS') })
    ipcRenderer.on('shortcut-show-threads', (event) => { this.setListMode('THREADS') })
    ipcRenderer.on('shortcut-switch-write-form', (event) => {
      this.switchShowWriteForm()
      this.writeFormTextarea.focus()
    })
    ipcRenderer.on('shortcut-switch-auto-update', (event) => { this.switchAutoUpdate() })
    ipcRenderer.on('shortcut-switch-auto-scroll', (event) => { this.switchAutoScroll() })
    ipcRenderer.on('shortcut-update-current-list', (event) => { this.updateCurrentList() })
    ipcRenderer.on('shortcut-post-write-form', (event) => { this.postWriteForm() })
    ipcRenderer.on('shortcut-clear-storage', (event) => {
      this.store.clear()
      this.setState(this.store.defaultAppState)
    })
    ipcRenderer.on('outputlog', (event, message) => { this.outputLog(message) })
  }

  addBoard = (board) => {
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

  removeBoard = (boardUrl) => {
    // 削除する要素
    const removeIndex = _.findIndex(this.state.boards, { url: boardUrl })
    if(removeIndex<0) return
    // state.boardsをコピー
    let boards = this.state.boards.concat()
    boards.splice(removeIndex, 1)
    // 削除後のcurrentIndex
    let afterCurrentIndex = this.state.currentBoardIndex >= removeIndex ? (
      this.state.currentBoardIndex - 1
    ) : (
      this.state.currentBoardIndex
      )
    if(afterCurrentIndex<0) afterCurrentIndex = 0
    this.setState({
      boards: boards,
      currentBoardIndex: afterCurrentIndex
    })
  }

  selectBoard = (index) => {
    this.setState({ currentBoardIndex: index })
  }

  addThread = (thread) => {
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
      thread.idCounter = this.getIdCounter(thread.posts)
      // threadを追加して表示
      this.setState({
        threads: this.state.threads.concat(thread),
        currentUrl: thread.url,
        currentThreadIndex: this.state.threads.length,
        listMode: "THREADS"
      })
    }
  }

  removeThread = (threadUrl) => {
    // 削除する要素
    const removeIndex = _.findIndex(this.state.threads, { url: threadUrl })
    if(removeIndex<0) return
    // state.threadsをコピー
    let threads = this.state.threads.concat()
    threads.splice(removeIndex, 1)
    // 削除後のcurrentIndex
    let afterCurrentIndex = this.state.currentThreadIndex >= removeIndex ? (
      this.state.currentThreadIndex - 1
    ) : (
      this.state.currentThreadIndex
    )
    if (afterCurrentIndex < 0) afterCurrentIndex = 0
    this.selectThread(afterCurrentIndex)
    this.setState({ threads: threads })
  }

  selectThread = (index) => {
    this.setState({ currentThreadIndex: index })
  }

  // タブを左に移動
  moveLeftTab = () => {
    switch (this.state.listMode) {
      case 'BOARDS':
        if (this.state.currentBoardIndex <= 0) {
          this.setState({ currentBoardIndex: this.state.boards.length-1 })
        } else {
          this.setState({ currentBoardIndex: this.state.currentBoardIndex-1 })
        }
        break
      case 'THREADS':
        if (this.state.currentThreadIndex <= 0) {
          this.setState({ currentThreadIndex: this.state.threads.length-1 })
        } else {
          this.setState({ currentThreadIndex: this.state.currentThreadIndex-1 })
        }
        break
    }
  }

  // タブを右に移動
  moveRightTab = () => {
    switch (this.state.listMode) {
      case 'BOARDS':
        if (this.state.currentBoardIndex >= this.state.boards.length-1) {
          this.setState({ currentBoardIndex: 0 })
        } else {
          this.setState({ currentBoardIndex: this.state.currentBoardIndex+1 })
        }
        break
      case 'THREADS':
        if (this.state.currentThreadIndex >= this.state.threads.length-1) {
          this.setState({ currentThreadIndex: 0 })
        } else {
          this.setState({ currentThreadIndex: this.state.currentThreadIndex+1 })
        }
        break
    }
  }

  // 現在のタブを閉じる
  closeCurrentTab = () => {
    switch (this.state.listMode) {
      case 'BOARDS':
        if(this.currentBoard.url) this.removeBoard(this.currentBoard.url)
        break
      case 'THREADS':
        if(this.currentThread.url) this.removeThread(this.currentThread.url)
        break
    }
  }

  // 引数の番号のレスのIDカウンターを取得
  getIdCounter = (posts) => {
    // 全IDごとの格納位置を集計
    let idCounter = {}
    posts.forEach((post, index) => {
      if ((idCounter[post.id]) && !(post.id.match(/\?\?\?/gi))) {
        idCounter[post.id].push(index+1)
      } else if (post.id && !(post.id.match(/\?\?\?/gi))) {
        idCounter[post.id] = [index+1]
      }
    })
    return Map(idCounter).map(idList => List(idList))
  }

  // 更新状態がWAITか
  get isWait() {
    return this.state.updateStatus == 'WAIT'
  }

  // 板が存在するか
  get hasBoard() {
    return this.state.boards.length > 0
  }

  // スレッドが存在するか
  get hasThread() {
    return this.state.threads.length > 0
  }

  // 現在の板を取得
  get currentBoard() {
    if (this.hasBoard) {
      return this.state.boards[this.state.currentBoardIndex]
    } else {
      return { subjectUrl: "", url: "", threads: [] }
    }
  }

  // 現在のスレッドを取得
  get currentThread() {
    if (this.hasThread) {
      return this.state.threads[this.state.currentThreadIndex]
    } else {
      return { datUrl: "", headers: {}, url: "", posts: [], title: "" }
    }
  }

  // 指定したリストモードの現在のURLを取得
  getCurrentUrl = (listMode) => {
    let url = ""
    if (listMode == "BOARDS" && this.hasBoard) {
      url = this.state.boards[this.state.currentBoardIndex].url
    } else if (listMode == "THREADS" && this.hasThread) {
      url = this.state.boards[this.state.currentBoardIndex].threads[this.state.currentThreadIndex].url
    }
    return url
  }

  setCurrentUrl = (url) => {
    this.setState({ currentUrl: url })
  }

  setListMode = (listMode) => {
    switch (listMode) {
      case 'BOARDS':
        this.setState({ listMode: 'BOARDS' })
        break
      case 'THREADS':
        this.setState({ listMode: 'THREADS' })
        break
    }
  }

  setUpdateStatus = (updateStatus) => {
    switch (updateStatus) {
      case 'WAIT':
        this.setState({ updateStatus: 'WAIT' })
        break
      case 'UPDATING':
        this.setState({ updateStatus: 'UPDATING' })
        break
      case 'POSTING':
        this.setState({ updateStatus: 'POSTING' })
        break
    }
  }

  updateCurrentList = () => {
    switch (this.state.listMode) {
      case "BOARDS":
        this.updateCurrentBoard()
        break
      case "THREADS":
        this.updateCurrentThread()
        break
    }
  }

  // 板を取得
  fetchBoard = (url) => {
    if (this.isWait) {
      let index = _.findIndex(this.state.boards, { url: url })
      if (index >= 0) {
        // 既に取得済みの場合は板を表示
        this.setState({
          currentUrl: url,
          currentBoardIndex: index,
          listMode: "BOARDS"
        })
      } else {
        ipcRenderer.send('add-board', url)
        this.setUpdateStatus('UPDATING')
      }
    }
  }

  // 現在の板を更新
  updateCurrentBoard = () => {
    if (this.isWait && this.hasBoard) {
      this.setUpdateStatus('UPDATING')
      ipcRenderer.send('update-board', this.currentBoard)
    }
  }

  // スレッドを取得
  fetchThread = (url) => {
    if (this.isWait) {
      let index = _.findIndex(this.state.threads, { url: url })
      if (index >= 0) {
        // 既に存在する場合はスレッドを表示
        this.setState({
          currentUrl: url,
          currentThreadIndex: index,
          listMode: "THREADS"
        })
      } else {
        ipcRenderer.send('add-thread', url)
        this.setUpdateStatus('UPDATING')
      }
    }
  }

  // 現在のスレッドを更新
  updateCurrentThread = () => {
    if (this.isWait && this.hasThread) {
      this.setUpdateStatus('UPDATING')
      ipcRenderer.send('update-thread', this.currentThread)
    }
  }

  // 書き込みの投稿
  postWriteForm = () => {
    let message = this.writeFormTextarea.value
    // スペースを除いた書き込み文字数が1以上あるか
    let hasMesssage = (message.replace(/\s/g, '').length > 0)
    if ((this.currentThread.posts.length > 0 && hasMesssage) && this.isWait) {
      // 書き込み処理
      this.setUpdateStatus('POSTING')
      this.writeFormTextarea.disabled = true
      ipcRenderer.send('post-write', this.currentThread, message)
    }
  }

  findIndexOfThreads = (thread) => {
    let index = -1
    for(let i=0; i < this.state.threads.length; i++){
      if (thread.url == this.state.threads[i].url) {
        index = i
        break
      }
    }
    return index
  }

  // スレッドの自動更新のON/OFF切り替え
  switchAutoUpdate = () => {
    this.setState({ isAutoUpdate: !this.state.isAutoUpdate })
  }

  // スレッドのオートスクロールのON/OFF切り替え
  switchAutoScroll = () => {
    this.setState({ isAutoScroll: !this.state.isAutoScroll })
  }

  // 字幕サーバーの起動状態のON/OFF切り替え
  switchJimakuServer = () => {
    ipcRenderer.send('switch-jimaku-server', !this.state.isJimakuServer)
    this.setState({ isJimakuServer: !this.state.isJimakuServer })
  }

  // 書き込み欄の表示/非表示切り替え
  switchShowWriteForm = () => {
    this.setState({ isShowWriteForm: !this.state.isShowWriteForm })
  }

  // 環境設定を開く
  openPreferences = () => {
    ipcRenderer.send('open-preferences-window')
  }

  outputLog = (log) => {
    this.setState({ log: log })
    shell.beep()
    setTimeout(this.clearLog, 3500)
  }

  clearLog = () => {
    this.setState({ log: "" })
  }

  // 書き込み欄でkeyDownハンドラ
  _pressWriteFormHandler = (event) => {
    if (event.shiftKey && event.nativeEvent.key == 'Enter' && event.nativeEvent.type == 'keydown') {
      this.postWriteForm()
    }
  }

  componentWillMount() {
    // stateの状態復帰
    let prevState = this.store.appState
    let state = this.store.defaultAppState
    if (this.state.boards) state.boards = this.state.boards
    if (this.state.currentUrl) state.currentUrl = this.state.currentUrl
    state.theme = this.preferences.theme
    state.isAutoUpdate = prevState.isAutoUpdate
    state.isAutoScroll = prevState.isAutoScroll
    state.isJimakuServer = prevState.isJimakuServer
    state.isShowWriteForm = prevState.isShowWriteForm
    if (this.preferences.isReturnBoards) {
      state.boards = state.boards.concat(prevState.boards)
      state.currentBoardIndex = prevState.currentBoardIndex
    }
    if (this.preferences.isReturnThreads) {
      state.threads = prevState.threads
      state.currentThreadIndex = prevState.currentThreadIndex
    }
    this.setState(state)
    // 字幕サーバーを起動
    if (state.isJimakuServer) ipcRenderer.send('switch-jimaku-server', state.isJimakuServer)
  }

  componentDidMount() {
    this.writeFormTextarea = document.getElementById('write-form-textarea')
    // 引数URLから板情報を取得
    ipcRenderer.send('add-arg-board')
    this.setUpdateStatus('UPDATING')
  }

  render() {
    let writeFormTextareaStyle = (this.state.isShowWriteForm) ? { display: 'block' } : { display: 'none' }
    let listComponent
    if (this.state.listMode == 'BOARDS') {
      listComponent = <BoardBox
                        boards={this.state.boards} threads={this.state.threads} hasBoard={this.hasBoard} currentBoardIndex={this.state.currentBoardIndex}
                        fetchThread={this.fetchThread} removeBoard={this.removeBoard} selectBoard={this.selectBoard} />
    } else if (this.state.listMode == 'THREADS') {
      listComponent = <ThreadBox
                        boards={this.state.boards} threads={this.state.threads} currentThreadIndex={this.state.currentThreadIndex}
                        isAutoScroll={this.state.isAutoScroll} isShowWriteForm={this.state.isShowWriteForm}
                        hasBoard={this.hasBoard} hasThread={this.hasThread}
                        removeThread={this.removeThread} selectThread={this.selectThread} />
    }
    return (
      <div id="container" className={this.state.theme}>
        <Header
          listMode={this.state.listMode} currentUrl={this.state.currentUrl}
          fetchBoard={this.fetchBoard} updateCurrentList={this.updateCurrentList} openPreferences={this.openPreferences}
          isAutoUpdate={this.state.isAutoUpdate} isAutoScroll={this.state.isAutoScroll} isJimakuServer={this.state.isJimakuServer}
          setListMode={this.setListMode} setCurrentUrl={this.setCurrentUrl} getCurrentUrl={this.getCurrentUrl}
          switchAutoUpdate={this.switchAutoUpdate} switchAutoScroll={this.switchAutoScroll} switchJimakuServer={this.switchJimakuServer} />
        {/*リスト欄*/}
        {listComponent}
        {/*書き込み欄*/}
        <div id="write-form" className="form-group">
          <textarea id="write-form-textarea" className="form-control"
            rows="3" style={writeFormTextareaStyle}
            onKeyDown={this._pressWriteFormHandler} />
        </div>
        <Footer
          updateStatus={this.state.updateStatus}
          log={this.state.log}
          isAutoUpdate={this.state.isAutoUpdate}
          currentThread={this.currentThread}
          updateCurrentThread={this.updateCurrentThread}
          switchShowWriteForm={this.switchShowWriteForm} />
      </div>
    )
  }

}