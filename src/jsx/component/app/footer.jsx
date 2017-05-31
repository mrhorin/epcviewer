/*******************************************************
state
  autoUpdateCount: int
    自動更新用カウンター（単位: 秒）
********************************************************/
import React from 'react'
import { ipcRenderer } from 'electron'

export default class Footer extends React.Component {

  constructor(props) {
    super(props)
    this.state = { autoUpdateCount: 10 }
  }

  // スレタイ(レス数) を取得
  get currentThreadTitle() {
    var title = this.props.currentThread.title
    if (this.hasCurrentThread) {
      // レス数を付加
      title += `(${this.props.currentThread.posts.length+1})`
    }
    return title
  }

  // 現在のスレッドが存在するか  
  get hasCurrentThread() {
    return this.props.currentThread.posts.length > 0
  }

  // 更新状態がWAITか  
  get isWait() {
    return this.props.updateStatus=='WAIT'
  }

  // スレッドを更新  
  updateThread = () => {
    var state = {}
    if (this.isWait && this.props.isAutoUpdate && this.state.autoUpdateCount<=0) {
      // 更新処理
      this.props.updateCurrentThread()
      state['autoUpdateCount'] = 10
    } else if (this.isWait && this.props.isAutoUpdate) {
      // 1秒カウントダウン
      state['autoUpdateCount'] = this.state.autoUpdateCount - 1
    }
    this.setState(state)    
  }

  // 自動更新タイマーの開始
  startUpdateTimer = () => {
    this.updateTimerId = setInterval(() => {
      this.updateThread()
    }, 1000)
  }

  // 自動更新タイマーの停止  
  stopUpdateTimer = () => {
    clearInterval(this.updateTimerId)
  }

  _onClickFooterHandler = () => {
    this.props.switchShowWriteForm()
  }

  componentDidMount() {
    this.startUpdateTimer()
  }

  componentWillUnmount() {
    this.stopUpdateTimer()
  }

  render() {
    switch (this.props.updateStatus) {
      case 'WAIT':
        this.status = this.props.isAutoUpdate && this.hasCurrentThread ? this.state.autoUpdateCount : '停止中'
        break
      case 'UPDATING':
        this.status = '更新中'
        break
      case 'POSTING':
        this.status = '書き込み中'
        break
    }
    return(
      <footer className="toolbar toolbar-footer" onClick={this._onClickFooterHandler}>
        <div className="flex-container">
          <div className="flex-item update-status">
            {this.status}
          </div>
          <div className="flex-item thread-title">
            {this.currentThreadTitle}
          </div>
        </div>
      </footer>
    )
  }

}
