import React from 'react'

/* 字幕設定 */
export default class PreferencesJimaku extends React.Component {

  constructor(props) {
    super(props)
  }

  _onChangeForm = (e, key) => {
    this.props.onChange(key, e.target.value)
  }

  render() {
    return (
      <div id="preferences-box">
        {/* テーマ */}
        <div id="preferences-jimaku-fontsize" className="preferences-item">
          <div className="preferences-title">フォントサイズ</div>
          <input type="number" min="1" value={this.props.fontSize}
            onChange={e => this._onChangeForm(e, 'jimakuFontSize')} />
        </div>
      </div>       
    )
  }

}