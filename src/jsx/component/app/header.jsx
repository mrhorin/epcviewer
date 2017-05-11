import React from 'react'

export default class Header extends React.Component {

  constructor(props) {
    super(props)
    this.updateList = this.updateList.bind(this)
    this.switchBoardsList = this.switchBoardsList.bind(this)
    this.switchThreadsList = this.switchThreadsList.bind(this)
    this.switchList = this.switchList.bind(this)
  }

  // 一覧が表示されているか
  get isListShown() {
    return window.outerHeight > 130
  }

  // 一覧を更新  
  updateList() {
    switch (this.props.state.listMode) {
      case "BOARDS":
        this.props.updateCurrentBoard()
        break
      case "THREADS":
        this.props.updateCurrentThread()
        break
      default:
        console.log("default")
    }
  }

  // 掲示板一覧に表示切り替え
  switchBoardsList() {
    this.props.setListMode("BOARDS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("BOARDS"))
    if (this.isListShown && this.props.state.listMode != "BOARDS") return
    this.switchList()
  }

  // スレッド一覧に表示切り替え
  switchThreadsList() {
    this.props.setListMode("THREADS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("THREADS"))
    if (this.isListShown && this.props.state.listMode != "THREADS") return
    this.switchList()
  }

  // 一覧の表示/非表示を切り替え
  switchList() {
    if (this.isListShown) {
      window.resizeTo(window.outerWidth, 130)
    } else {
      window.resizeTo(window.outerWidth, 600)
    }
  }

  render() {
    return (
      <header className="toolbar toolbar-header">
        <div className="flex-container">
          <div className="flex-header-btns">
            <div className="btn-group">
              {/*更新*/}
              <button className="btn btn-default btn-mini" onClick={this.updateList}>
                <span className="icon icon-arrows-ccw"></span>
              </button>
              {/*掲示板一覧*/}
              <button className="btn btn-default btn-mini" onClick={this.switchBoardsList}>
                <span className="icon icon-menu"></span>
              </button>
              {/*スレッド一覧*/}
              <button className="btn btn-default btn-mini" onClick={this.switchThreadsList}>
                <span className="icon icon-window"></span>
              </button>
            </div>
          </div>
          {/*URL欄*/}
          <div className="flex-header-url">
            <input type="text" value={this.props.state.currentUrl} onChange={e=>{ this.props.setCurrentUrl(e.target.value) }}/>
          </div>
        </div>
      </header>
    )
  }

}
