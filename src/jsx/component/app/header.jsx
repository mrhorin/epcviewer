import React from 'react'
import { ipcRenderer, remote } from 'electron'

const Menu = remote.Menu
const MenuItem =  remote.MenuItem
const clipboard = remote.clipboard

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
    let css = { boardsList: '', threadsList: '', autoUpdate: '', autoScroll: '', say: '', jimakuServer: '' }
    for (var key in css) {
      css[key] = 'btn btn-default btn-mini'
    }
    // アクティブ状態を付加
    if (this.props.isAutoUpdate) css.autoUpdate += ' active'
    if (this.props.isAutoScroll) css.autoScroll += ' active'
    if (this.props.isSay) css.say += ' active'
    if (this.props.isJimakuServer) css.jimakuServer += ' active'
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

  // 掲示板一覧に表示切り替え
  switchBoardsList = () => {
    if (this.props.listMode != "BOARDS") {
      this.props.setListMode("BOARDS")
      this.props.setCurrentUrl(this.props.getCurrentUrl("BOARDS"))
    }
  }

  // スレッド一覧に表示切り替え
  switchThreadsList = () => {
    if (this.props.listMode != "THREADS") {
      this.props.setListMode("THREADS")
      this.props.setCurrentUrl(this.props.getCurrentUrl("THREADS"))
    }
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
    let hasUrl = (event.target.value.replace(/\s/g,'').length >0)
    if (event.nativeEvent.key == 'Enter' && hasUrl) {
      this.props.fetchBoard(event.target.value)
    }
  }

  _onFocusInput = (event) => {
    event.target.select()
  }

  _onContextMenuCurrentUrl = (event) => {
    let menu = new Menu()
    menu.append(new MenuItem({
      label: 'コピー',
      click: ()=>{ clipboard.writeText(window.getSelection().toString()) }
    }))
    event.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }

  _onClickAutoUpdate = (event) => {
    let menu = new Menu()
    menu.append(new MenuItem({
      label: '自動更新',
      type: 'checkbox',
      checked: this.props.isAutoUpdate,
      click: () => {
        this.props.switchAutoUpdate()
        this.props.switchAutoScroll()
      }
    }))
    event.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }

  render() {
    let css = this.btnCssClassName

    return (
      <header className="toolbar toolbar-header">
        <div className="flex-container">
          {/*更新ボタン*/}
          <div className="flex-header-update-btns">
            <div className="btn-group">
              <button id="btn-update" className="btn btn-default btn-mini" onClick={this.props.updateCurrentList}>
                <span className="icon icon-arrows-ccw"></span>
              </button>
              <button id="btn-update-dropdown" className="btn btn-default btn-mini btn-dropdown" onClick={this._onClickAutoUpdate}/>
            </div>
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
              {/* 読み上げ */}
              <button id="btn-say" className={css.say} onClick={this.props.switchSay}>
                <span className="icon icon-sound"></span>
              </button>
              {/* 字幕サーバー */}
              <button id="btn-jimaku-server" className={css.jimakuServer} onClick={this.props.switchJimakuServer}>
                <span className="icon icon-network"></span>
              </button>
            </div>
          </div>
          {/*環境設定ボタン*/}
          <div className="flex-header-preferences-btns">
            <div className="btn-group">
              <button id="btn-preferences" className="btn btn-default btn-mini" onClick={this.props.openPreferences}>
                <span className="icon icon-cog"></span>
              </button>
            </div>
          </div>
          {/*URL欄*/}
          <div className="flex-header-url">
            <input type="text" value={this.props.currentUrl}
              onChange={e => { this.props.setCurrentUrl(e.target.value) }}
              onKeyUp={this._onKeyUpUrlHandler}
              onFocus={this._onFocusInput}
              onContextMenu={this._onContextMenuCurrentUrl}/>
          </div>
        </div>
      </header>
    )
  }

}
