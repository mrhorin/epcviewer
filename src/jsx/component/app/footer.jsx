import React from 'react'

export default class Footer extends React.Component {

  get currentThreadTitle() {
    var title = this.props.currentThread.title
    if (this.props.currentThread.posts.length > 0) {
      title += `(${this.props.currentThread.posts.length+1})`
    }
    return title
  }

  render() {
    var status = ''
    switch (this.props.updateStatus) {
      case 'WAIT':
        status = 'OK'
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
