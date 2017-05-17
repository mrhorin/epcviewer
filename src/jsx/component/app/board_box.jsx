import React from 'react'

import Subject from 'jsx/component/app/subject'

/* 板一覧 */
export default class BoardBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    var subjects = []
    if (this.props.boards.length > 0) {
      subjects = this.props.boards[this.props.currentBoardIndex].threads.map((subject, index) => {
        return <Subject key={index} thread={subject} threads={this.props.threads}/>
      })
    }

    return (
      <div id="board-box">
        {/*板タブ*/}
        <div id="board-tab-box">
          <div className="tab-group">
          </div>
        </div>
        {/*スレッド名一覧*/}
        <div id="subject-box">
          {subjects}
        </div>
      </div>
    )
  }

}
