import React from 'react'

export default class Footer extends React.Component {

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
            {this.props.currentThread.title}
          </div>
        </div>
      </footer>
    )
  }

}
