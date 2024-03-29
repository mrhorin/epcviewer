import React from 'react'
import { ipcRenderer } from 'electron'

import Store from 'js/store'

import PreferencesGeneral from 'jsx/component/preferences/preferences_general'
import PreferencesJimaku from 'jsx/component/preferences/preferences_jimaku'

/* 環境設定のメインウィンドウ */
export default class Preferences extends React.Component {

  constructor(props) {
    super(props)
    this.store = new Store()
    this.state = this.store.defaultPreferences
  }

  // ウィンドウを閉じる
  close = (preferences = {}) => {
    ipcRenderer.send('close-preferences-window', preferences)
  }

  onChange = (key, value) => {
    this.setState({ [key]: value })
  }

  _onClickTab = (tabIndex) => {
    this.setState({ currentTabIndex: tabIndex })
  }

  _onClickOk = (event) => {
    this.state.currentTabIndex = 0
    this.store.setPreferences(this.state)
    this.close(this.state)
  }

  _onClickCancel = (event) => {
    this.close()
  }

  componentDidMount() {
    this.setState(this.store.preferences)
  }

  render() {
    let components = [{
        name: '全般',
        component:
          <PreferencesGeneral key={0} onChange={this.onChange} theme={this.state.theme}
            isReturnBoards={this.state.isReturnBoards} isReturnThreads={this.state.isReturnThreads} isDisableHttps={this.state.isDisableHttps} />
      }, {
        name: '字幕',
        component:
          <PreferencesJimaku key={1} onChange={this.onChange} port={this.state.jimakuPort}
            fontSize={this.state.jimakuFontSize} fontOutlineSize={this.state.jimakuFontOutlineSize}
            fontColor={this.state.jimakuFontColor} fontOutlineColor={this.state.jimakuFontOutlineColor}
            isJimakuSe={this.state.isJimakuSe} jimakuSeVolume={this.state.jimakuSeVolume}
            jimakuSeFilePath={this.state.jimakuSeFilePath} />
      }
    ]
    let tabs = components.map((value, index) => {
      let tabClassName = (index == this.state.currentTabIndex) ? ('tab-item tab-item-active') : ('tab-item')
      return <div key={index} className={tabClassName} onClick={e => this._onClickTab(index)}>{value.name}</div>
    })
    return (
      <div id="preferences" className={this.state.theme}>
        {/* タブ */}
        <div id="preferences-tab-box">
          <div className="tab-group">{tabs}</div>
        </div>
        {components[this.state.currentTabIndex].component}
        {/* ボタン */}
        <div id="preferences-btns">
          <button className="btn btn-default btn-mini" onClick={this._onClickCancel}>キャンセル</button>
          <button className="btn btn-primary btn-mini" onClick={this._onClickOk}>保存</button>
        </div>
      </div>
    )
  }

}