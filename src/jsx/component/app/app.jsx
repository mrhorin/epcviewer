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
********************************************************/
import React from 'react'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

import Storage from 'js/storage'

import Header from 'jsx/component/app/header'
import BoardBox from 'jsx/component/app/board_box'
import ThreadBox from 'jsx/component/app/thread_box'
import Footer from 'jsx/component/app/footer'

/* アプリケーションのメインウィンドウ */
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = Storage.defaultState
    // Shiftの押下状態
    this.isPressShift = false
  }

  bindEvents = () => {
    // 初回起動時に引数URL取得したboardを受け取る
    ipcRenderer.on('add-arg-board-reply', (event, board) => {
      Promise.all([Storage.statePromise, Storage.preferencesPromise]).then((values) => {
        // 環境設定の適用
        if (!values[1].isReturnBoards) {
          values[0].boards = []
          values[0].currentBoardIndex = 0
        }
        if (!values[1].isReturnThreads) {
          values[0].threads = []
          values[0].currentThreadIndex = 0
        }
        this.setState(values[0])
        if(board) this.addBoard(board)
      })
    })
    ipcRenderer.on('add-board-reply', (event, board) => { this.addBoard(board) })
    ipcRenderer.on('add-thread-reply', (event, thread) => { this.addThread(thread) })
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
      // threadがthreadsの何番目に存在するか
      let index = _.findIndex(this.state.threads, { url: thread.url })
      if (index >= 0) {
        let threads = this.state.threads
        // 新着レスを追加
        threads[index].posts = threads[index].posts.concat(thread.posts)
        this.setState({ threads: threads, updateStatus: "WAIT" })
      } else {
        this.setUpdateStatus('WAIT')
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
    ipcRenderer.on('post-write-reply', (event, res) => {
      this.setUpdateStatus('WAIT')
      this.writeFormTextarea.value = ""
      this.writeFormTextarea.disabled = false
      this.writeFormTextarea.focus()
      this.updateCurrentThread()
    })
    ipcRenderer.on('shortcut-tab-left', (event) => { this.moveLeftTab() })
    ipcRenderer.on('shortcut-tab-right', (event) => { this.moveRightTab() })
    ipcRenderer.on('shortcut-tab-close', (event) => { this.closeCurrentTab() })
    ipcRenderer.on('shortcut-show-boards', (event) => { this.setListMode('BOARDS') })
    ipcRenderer.on('shortcut-show-threads', (event) => { this.setListMode('THREADS') })
    ipcRenderer.on('shortcut-switch-auto-update', (event) => { this.switchAutoUpdate() })
    ipcRenderer.on('shortcut-switch-auto-scroll', (event) => { this.switchAutoScroll() })
    ipcRenderer.on('shortcut-update-current-list', (event) => { this.updateCurrentList() })
    ipcRenderer.on('shortcut-clear-storage', (event) => {
      Storage.clearStorage(() => {
        this.setState(Storage.defaultState)
      })
    })
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
    Storage.setState(this.state)
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
    Storage.setState(this.state)
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
      // threadを追加して表示
      this.setState({
        threads: this.state.threads.concat(thread),
        currentUrl: thread.url,
        currentThreadIndex: this.state.threads.length,
        listMode: "THREADS"
      })
    }
    Storage.setState(this.state)
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
    Storage.setState(this.state)
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

  // 現在の板を更新  
  updateCurrentBoard = () => {
    if (this.hasBoard) ipcRenderer.send('update-board', this.currentBoard)
  }

  // 現在のスレッドを更新
  updateCurrentThread = () => {
    if (this.hasThread && this.isWait) {
      this.setUpdateStatus('UPDATING')
      ipcRenderer.send('update-thread', this.currentThread)
    }
    Storage.setState(this.state)
  }

  // 書き込みの投稿
  postWriteForm = (message) => {
    if (this.currentThread.posts.length > 0 && this.isWait) {
      // 書き込み処理
      this.setUpdateStatus('POSTING')
      this.writeFormTextarea.disabled = true
      ipcRenderer.send('post-write', this.currentThread, message)      
    } else if (this.currentThread.posts.length > 0 && !this.isWait) {
      // 2秒後に再帰的に呼び出し
      setTimeout(() => { this.postWriteForm(message) }, 2000)
    } else {
      throw "The curentThread is empty. Please select thread from board."
    }
  }

  // スレッドの自動更新のON/OFF切り替え  
  switchAutoUpdate = () => {
    this.setState({ isAutoUpdate: !this.state.isAutoUpdate })
  }

  // スレッドのオートスクロールのON/OFF切り替え  
  switchAutoScroll = () => {
    this.setState({ isAutoScroll: !this.state.isAutoScroll })
  }

  // 書き込み欄の表示/非表示切り替え  
  switchShowWriteForm = () => {
    this.setState({ isShowWriteForm: !this.state.isShowWriteForm })
  }

  // stateを初期化
  initialize = () => {
    Storage.clearState((error) => {
      if(!error) this.setState(Storage.defaultState)
    })
  }

  // 書き込み欄でkeyDownハンドラ
  _pressWriteFormHandler = (event) => {
    if (event.nativeEvent.key == 'Shift') {
      // Shift押下状態を保持
      this.isPressShift = true
    } else if (event.nativeEvent.key == 'Enter' && this.isPressShift) {
      // Shift+Enterで投稿
      this.postWriteForm(event.target.value)
      this.isPressShift = false
    }
  }

  // 書き込み欄でkeyUpハンドラ  
  _releaseWriteFormHandler = (event) => {
    // Shift押下状態を解放
    this.isPressShift = false
  }

  componentDidUpdate() {
    if (this.state.isShowWriteForm) {
      this.writeFormTextarea.style.display = 'block'
    } else {
      this.writeFormTextarea.style.display = 'none'
    }
  }

  componentDidMount() {
    this.writeFormTextarea = document.getElementById('write-form-textarea')
    this.bindEvents()
    ipcRenderer.send('add-arg-board')
  }

  render() {
    let listBox
    switch (this.state.listMode) {
      case 'BOARDS':
        listBox = <BoardBox
          boards={this.state.boards} threads={this.state.threads} hasBoard={this.hasBoard} currentBoardIndex={this.state.currentBoardIndex}
          removeBoard={this.removeBoard} selectBoard={this.selectBoard} />
        break
      case 'THREADS':
        listBox = <ThreadBox
          boards={this.state.boards} threads={this.state.threads} posts={this.currentThread.posts}
          isAutoScroll={this.state.isAutoScroll} hasBoard={this.hasBoard} hasThread={this.hasThread}
          currentThreadIndex={this.state.currentThreadIndex}
          removeThread={this.removeThread} selectThread={this.selectThread} />
        break
    }

    return (
      <div>
        <Header
          listMode={this.state.listMode} currentUrl={this.state.currentUrl}
          isAutoUpdate={this.state.isAutoUpdate} isAutoScroll={this.state.isAutoScroll}
          setListMode={this.setListMode}
          setCurrentUrl={this.setCurrentUrl}
          getCurrentUrl={this.getCurrentUrl}
          updateCurrentList={this.updateCurrentList}
          switchAutoUpdate={this.switchAutoUpdate}
          switchAutoScroll={this.switchAutoScroll} />
        {/*リスト欄*/}
        {listBox}
        {/*書き込み欄*/}
        <div id="write-form" className="form-group">
          <textarea id="write-form-textarea" className="form-control" rows="3"
            onKeyDown={this._pressWriteFormHandler}
            onKeyUp={this._releaseWriteFormHandler} />
        </div>
        <Footer
          updateStatus={this.state.updateStatus}
          isAutoUpdate={this.state.isAutoUpdate}
          currentThread={this.currentThread}
          updateCurrentThread={this.updateCurrentThread}
          switchShowWriteForm={this.switchShowWriteForm} />
      </div>
    )
  }

}
