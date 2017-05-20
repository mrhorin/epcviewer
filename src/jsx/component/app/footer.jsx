/*******************************************************
state
  autoUpdateCount: int
    自動更新用カウンター（単位: 秒）
********************************************************/
import React from 'react'

export default class Footer extends React.Component {

  constructor(props) {
    super(props)
    this.state = { autoUpdateCount: 10 }
  }

  // スレタイ(レス数) を取得
  get currentThreadTitle() {
    var title = this.props.currentThread.title
    if (this.isCurrentThread) {
      // レス数を付加
      title += `(${this.props.currentThread.posts.length+1})`
    }
    return title
  }

  // 現在のスレッドが存在するか  
  get isCurrentThread() {
    return this.props.currentThread.posts.length > 0
  }

  // 自動更新タイマーの開始
  startUpdateTimer = () => {
    this.updateTimerId = setInterval(() => {
      if (this.props.updateStatus=='WAIT' && this.props.isAutoUpdate && this.state.autoUpdateCount<=0) {
        // 更新処理
        this.props.updateCurrentThread()
        this.setState({ autoUpdateCount: 10 })
      } else if (this.props.updateStatus=='WAIT' && this.props.isAutoUpdate) {
        // 1秒カウントダウン
        this.setState({ autoUpdateCount: this.state.autoUpdateCount-1 })
      }
    }, 1000)
  }

  // 自動更新タイマーの停止  
  stopUpdateTimer = () => {
    clearInterval(this.updateTimerId)
  }

  componentDidMount() {
    this.startUpdateTimer()
  }

  componentWillUnmount() {
    this.stopUpdateTimer()
  }


  render() {
    var status = ''
    switch (this.props.updateStatus) {
      case 'WAIT':
        status = this.props.isAutoUpdate && this.isCurrentThread ? this.state.autoUpdateCount : '停止中'
        break
      case 'UPDATING':
        status = '更新中'
        break
      case 'POSTING':
        status = '書き込み中'
        break
    }
    return(
      <footer className="toolbar toolbar-footer">
        <div className="flex-container">
          <div className="flex-item update-status">
            {status}
          </div>
          <div className="flex-item thread-title">
            {this.currentThreadTitle}
          </div>
        </div>
      </footer>
    )
  }

}
