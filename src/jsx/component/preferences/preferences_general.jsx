import React from 'react'

/* 一般設定 */
export default class PreferencesGeneral extends React.Component {

  constructor(props) {
    super(props)
  }

  _onChangeCheckbox = (e, key) => {
    this.props.onChange(key, e.target.checked)
  }

  _onClickCheckbox = (e, key) => {
    this.props.onChange(key, !this.refs[key].checked)
  }

  _onChangeSelect = (e, key) => {
    this.props.onChange(key, e.target.value)
  }

  render() {
    return (
      <div id="preferences-box">
        {/* 起動時 */}
        <div className="preferences-item-column">
          <div id="preferences-startup">
            <div className="preferences-title">起動時</div>
            <div id="preferences-startup-boards">
              <input ref="isReturnBoards" type="checkbox" onChange={e => this._onChangeCheckbox(e, 'isReturnBoards')} checked={this.props.isReturnBoards} />
              <span className="checkbox-label" onClick={e => this._onClickCheckbox(e, 'isReturnBoards')}>
                板一覧を復帰
              </span>
            </div>
            <div id="preferences-startup-threads">
              <input ref="isReturnThreads" type="checkbox" onChange={e => this._onChangeCheckbox(e, 'isReturnThreads')} checked={this.props.isReturnThreads} />
              <span className="checkbox-label" onClick={e => this._onClickCheckbox(e, 'isReturnThreads')}>
                スレッド一覧を復帰
              </span>
            </div>
          </div>
        </div>
        {/* 通信 */}
        <div className="preferences-item-column">
          <div className="preferences-title">通信</div>
          <div id="preferences-disable-https">
            <input ref="isDisableHttps" type="checkbox" onChange={e => this._onChangeCheckbox(e, 'isDisableHttps')} checked={this.props.isDisableHttps} />
            <span className="checkbox-label" onClick={e => this._onClickCheckbox(e, 'isDisableHttps')}>
              https通信を無効化
            </span>
          </div>
        </div>
        {/* テーマ */}
        <div className="preferences-item-column">
          <div id="preferences-theme">
            <div className="preferences-title">テーマ</div>
            <div className=" form-group">
              <select ref="theme" onChange={e => this._onChangeSelect(e, 'theme')} value={this.props.theme}>
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

}