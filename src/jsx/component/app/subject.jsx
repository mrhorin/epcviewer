/*******************************************************
  This component is part of subjects to show thread title in board_box.
  It need has thread title, no. count.
*******************************************************/
import React from 'react'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

export default class Subject extends React.Component {

  constructor(props) {
    super(props)
  }
  
  _onClickSubjectHandler = () => {
    // 追加済みかスレッドか
    if (_.findIndex(this.props.threads, { url: this.props.subject.url }) >= 0) {
      ipcRenderer.send('show-thread', this.props.subject.url)
    } else {
      ipcRenderer.send('add-thread', this.props.subject.url)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.subject != nextProps.subject
  }

  render() {
    return (
      <div className="subject" onClick={this._onClickSubjectHandler}>
        {`${this.props.subject.title}(${this.props.subject.count})`}
      </div>
    )
  }

}
