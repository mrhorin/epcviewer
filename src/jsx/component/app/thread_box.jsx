import React from 'react'

import Thread from 'jsx/component/app/thread'

export default class ThreadBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    var threads = []
    if (this.props.state.boards.length > 0) {
      threads = this.props.state.boards[this.props.state.currentBoard].threads.map((thread, index) => {
        return <Thread key={index} thread={thread} />
      })
    }

    return (
      <div className="list" id="thread-box">
        {threads}
      </div>
    )
  }

}
