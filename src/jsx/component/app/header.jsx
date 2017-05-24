import React from 'react'
import { ipcRenderer } from 'electron'

export default class Header extends React.Component {

  constructor(props) {
    super(props)
  }

  // 一覧が表示されているか
  get isListShown() {
    return window.outerHeight > 151
  }

  // ボタン用のCSSクラス
  get btnCssClassName() {
    let css = { boardsList: '', threadsList: '', autoUpdate: '', autoScroll: '' }
    for (var key in css) {
      css[key] = 'btn btn-default btn-mini'
    }
    // アクティブ状態を付加
    if (this.props.isAutoUpdate) css.autoUpdate += ' active'
    if (this.props.isAutoScroll) css.autoScroll += ' active'
    switch (this.props.listMode) {
      case 'BOARDS':
        css.boardsList += ' active'
        break
      case 'THREADS':
        css.threadsList += ' active'
        break
    }
    return css
  }

  // 一覧を更新  
  updateList = () => {
    switch (this.props.listMode) {
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
  switchBoardsList = () => {
    this.props.setListMode("BOARDS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("BOARDS"))
    if (this.isListShown && this.props.listMode != "BOARDS") return
    this.switchList()
  }

  // スレッド一覧に表示切り替え
  switchThreadsList = () => {
    this.props.setListMode("THREADS")
    this.props.setCurrentUrl(this.props.getCurrentUrl("THREADS"))
    if (this.isListShown && this.props.listMode != "THREADS") return
    this.switchList()
  }

  // 一覧の表示/非表示を切り替え
  switchList = () => {
    if (this.isListShown) {
      window.resizeTo(window.outerWidth, 151)
    } else {
      window.resizeTo(window.outerWidth, 600)
    }
  }

  _onKeyUpUrlHandler = (event) => {
    if (event.nativeEvent.key == 'Enter') {
      ipcRenderer.send('add-board', event.target.value)
    }
  }

  render() {
    let css = this.btnCssClassName

    return (
      <header className="toolbar toolbar-header">
        <div className="flex-container">
          {/*更新ボタン*/}
          <div className="flex-header-update-btns">
            <button id="btn-update" className="btn btn-default btn-mini" onClick={this.updateList}>
              <span className="icon icon-arrows-ccw"></span>
            </button>
          </div>
          {/*リストボタン*/}
          <div className="flex-header-list-btns">
            <div className="btn-group">
              {/*掲示板一覧*/}
              <button id="btn-boards" className={css.boardsList} onClick={this.switchBoardsList}>
                <span className="icon icon-menu"></span>
              </button>
              {/*スレッド一覧*/}
              <button id="btn-threads" className={css.threadsList} onClick={this.switchThreadsList}>
                <span className="icon icon-window"></span>
              </button>
            </div>
          </div>
          {/*スレッドボタン*/}
          <div className="flex-header-thread-btns">
            <div className="btn-group">
              {/*自動更新*/}
              <button id="btn-auto-update" className={css.autoUpdate} onClick={this.props.switchAutoUpdate}>
                <span className="icon icon-clock"></span>
              </button>
              {/*自動スクロール*/}
              <button id="btn-auto-scroll" className={css.autoScroll} onClick={this.props.switchAutoScroll}>
                <span className="icon icon-down-bold"></span>
              </button>
            </div>  
          </div>
          {/*URL欄*/}
          <div className="flex-header-url">
            <input type="text" value={this.props.currentUrl}
              onChange={e => { this.props.setCurrentUrl(e.target.value) }}
              onKeyUp={this._onKeyUpUrlHandler}
              onFocus={e => { e.target.select() }}/>
          </div>
        </div>
      </header>
    )
  }

}
