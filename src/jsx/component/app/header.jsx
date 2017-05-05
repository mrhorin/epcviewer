import React from 'react'

export default class Header extends React.Component {

  constructor(props) {
    super(props)
    this.switchThreadsList = this.switchThreadsList.bind(this)
    this.switchPostsList = this.switchPostsList.bind(this)
    this.switchList = this.switchList.bind(this)
  }

  // 一覧が表示されているか
  get isListShown() {
    return window.outerHeight > 130
  }

  // スレッド一覧表示切り替え
  switchThreadsList() {
    this.props.setListMode("THREADS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("THREADS"))
    if (this.isListShown && this.props.state.listMode != "THREADS") return
    this.switchList()
  }

  // 書き込み一覧表示切り替え
  switchPostsList() {
    this.props.setListMode("POSTS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("POSTS"))
    if (this.isListShown && this.props.state.listMode != "POSTS") return
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
              <button className="btn btn-default btn-mini">
                <span className="icon icon-arrows-ccw"></span>
              </button>
              {/*スレッド一覧*/}
              <button className="btn btn-default btn-mini" onClick={this.switchThreadsList}>
                <span className="icon icon-menu"></span>
              </button>
              {/*書き込み一覧*/}
              <button className="btn btn-default btn-mini" onClick={this.switchPostsList}>
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
