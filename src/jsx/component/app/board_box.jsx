/*******************************************************
  state
    subjectsSortMode: string
      スレッド一覧の並び順を示す
      PEERCAST:
        peercast実況向けモード
        進んでいるスレを上に、1000到達しているスレは下に配置
*******************************************************/
import React from 'react'

import Tab from 'jsx/component/common/tab'
import Subject from 'jsx/component/app/subject'

/* 板一覧 */
export default class BoardBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = { subjectsSortMode: 'PEERCAST' }
  }

  get currentBoard() {
    if(this.props.hasBoard) return this.props.boards[this.props.currentBoardIndex]
  }

  // Subjectコンポーネントに渡す用のハッシュ
  getSubjects = (board) => {
    let subjects= board.threads.map((thread, index) => {
      // スレッド名とレス数を抽出
      const match = thread.title.match(/^(.+)\((\d+)\)$/)
      return { 'no': Number(index+1), 'title': match[1], 'count': Number(match[2]), 'url': thread.url }
    })
    return this.sortSubjects(subjects)
  }

  sortSubjects = (subjects) => {
    switch (this.state.subjectsSortMode) {
      case 'PEERCAST':
        let disabledSubject = subjects.filter(subject => { if (subject.count >= 1000) return true })
        let enabledSubject = subjects.filter(subject => { if (subject.count < 1000) return true })
        subjects = enabledSubject.concat(disabledSubject)
        break
    }
    return subjects
  }

  _removeBoard = (boardUrl) => {
    if(this.props.hasBoard) this.props.removeBoard(boardUrl)
  }

  _selectBoard = (index) => {
    if(this.props.hasBoard) this.props.selectBoard(index)
  }

  render() {
    let subjects = []
    let tabs = []
    if (this.props.hasBoard) {
      subjects = this.getSubjects(this.currentBoard).map((subject) => {
        return <Subject key={subject.no} subject={subject} fetchThread={this.props.fetchThread}/>
      })
      tabs = this.props.boards.map((board, index) => {
        const active = this.props.currentBoardIndex==index
        return (
          <Tab key={index} index={index} name={board.title} url={board.url} active={active}
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
