import React from 'react'

import Tab from 'jsx/component/common/tab'
import Subject from 'jsx/component/app/subject'

/* 板一覧 */
export default class BoardBox extends React.Component {

  constructor(props) {
    super(props)
  }

  _removeBoard = (boardUrl) => {
    this.props.removeBoard(boardUrl)
  }

  _selectBoard = (index) => {
    this.props.selectBoard(index)
  }

  render() {
    var subjects = []
    if (this.props.boards.length > 0) {
      subjects = this.props.boards[this.props.currentBoardIndex].threads.map((subject, index) => {
        return <Subject key={index} thread={subject} threads={this.props.threads}/>
      })
    }
    let tabs = []
    if (this.props.boards.length > 0) {
      tabs = this.props.boards.map((board, index) => {
        const active = this.props.currentBoardIndex==index
        return (
          <Tab key={index} index={index} name={board.url} url={board.url} active={active}
            removeTab={this._removeBoard} selectTab={this._selectBoard} />
        )
      })
    }

    return (
      <div id="board-box">
        {/*板タブ*/}
        <div id="board-tab-box">
          <div className="tab-group">
            {tabs}
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
