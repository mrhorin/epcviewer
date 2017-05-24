import React from 'react'
import { ipcRenderer } from 'electron'

import Storage from 'js/storage'

/* 環境設定のメインウィンドウ */
export default class Preferences extends React.Component {

  constructor(props) {
    super(props)
    this.state = Storage.defaultPreferences
  }

  // ウィンドウを閉じる
  close = () => {
    ipcRenderer.send('close-preferences-window')
  }

  _onChangeReturnBoards = (event) => {
    this.setState({ isReturnBoards: event.target.checked })
  }

  _onChangeReturnThreads = (event) => {
    this.setState({ isReturnThreads: event.target.checked })    
  }

  _onClickOk = (event) => {
    Storage.setPreferences(this.state, () => {
      this.close()
    })
  }

  _onClickCancel = (event) => {
    this.close()
  }

  componentDidMount() {
    Storage.preferencesPromise.then((preferences) => {
      this.setState(preferences)
    })
  }

  render() {
    return (
      <div id="preferences-flex-container">
        <div className="preferences-title">起動時</div>
        <div className="preferences-item" id="preferences-save-boards">
          <input type="checkbox" onChange={this._onChangeReturnBoards} checked={this.state.isReturnBoards} />
          <span className="checkbox-label">板一覧を復帰</span>
        </div>
        <div className="preferences-item" id="preferences-save-threads">
          <input type="checkbox" onChange={this._onChangeReturnThreads} checked={this.state.isReturnThreads} />
          <span className="checkbox-label">スレッド一覧を復帰</span>          
        </div>
        <div id="preferences-btns">
          <button className="btn btn-primary btn-mini" onClick={this._onClickOk}>OK</button>
          <button className="btn btn-default btn-mini" onClick={this._onClickCancel}>キャンセル</button>
        </div>
      </div>  
    )    
  }

}