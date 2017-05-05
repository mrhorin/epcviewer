import React from 'react'
import { ipcRenderer } from 'electron'

export default class Thread extends React.Component {

  constructor(props) {
    super(props)
    this.fetchPosts = this.fetchPosts.bind(this)
  }

  // 書き込み一覧を取得  
  fetchPosts() {
    ipcRenderer.send('fetch-posts', this.props.thread.url)    
  }

  render() {
    return (
      <div className="thread" onClick={this.fetchPosts}>
        {this.props.thread.title}
      </div>
    )
  }

}
