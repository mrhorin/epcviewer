import React from 'react'
import { ipcRenderer } from 'electron'

export default class Subject extends React.Component {

  constructor(props) {
    super(props)
    this.addThread = this.addThread.bind(this)
  }

  // スレッドを追加 
  addThread() {
    ipcRenderer.send('add-thread', this.props.thread.url)
  }

  render() {
    return (
      <div className="thread" onClick={this.addThread}>
        {this.props.thread.title}
      </div>
    )
  }

}
