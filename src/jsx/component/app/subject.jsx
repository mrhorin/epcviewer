import React from 'react'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

export default class Subject extends React.Component {

  constructor(props) {
    super(props)
    this.addThread = this.addThread.bind(this)
  }

  // スレッドを追加 
  addThread() {
    // 追加済みかスレッドか
    if (_.findIndex(this.props.threads, { url: this.props.thread.url }) >= 0) {
      ipcRenderer.send('show-thread', this.props.thread.url)
    } else {
      ipcRenderer.send('add-thread', this.props.thread.url)
    }
  }

  render() {
    return (
      <div className="thread" onClick={this.addThread}>
        {this.props.thread.title}
      </div>
    )
  }

}
