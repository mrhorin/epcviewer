import React from 'react'
import { ChromePicker } from 'react-color'

/* 字幕設定 */
export default class PreferencesJimaku extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      showFontPicker: false,
      showFontOutlinePicker: false
    }
  }

  _onChangeForm = (e, key) => {
    this.props.onChange(key, e.target.value)
  }

  _handleChangeCompletePicker = (color, key) => {
    this.props.onChange(key, color.hex)
  }

  _handleClickPickerButton = (e, key) => {
    e.stopPropagation()
    this.setState({ [key]: true })
  }

  _handleClickPicker = (e) => {
    e.stopPropagation()
  }

  _handleClickPreferencesJimaku = (e) => {
    this.setState({ showFontPicker: false, showFontOutlinePicker: false })
  }


  render() {
    let styles = {
      fontColorPicker: { display: 'none' },
      fontColorPickerButton: { background: this.props.fontColor },
      fontOutlineColorPicker: { display: 'none' },
      fontOutlineColorPickerButton: { background: this.props.fontOutlineColor },
    }
    if (this.state.showFontPicker) styles.fontColorPicker = { display: 'block' }
    if (this.state.showFontOutlinePicker) styles.fontOutlineColorPicker = { display: 'block' }
    return (
      <div id="preferences-box" onClick={e => this._handleClickPreferencesJimaku(e)}>
        {/* ポート番号 */}
        <div id="preferences-jimaku-port" className="preferences-item">
          <div className="preferences-title">ポート番号</div>
          <input type="number" min="1" value={this.props.port}
            onChange={e => this._onChangeForm(e, 'jimakuPort')} />
        </div>
        {/* 文字サイズ */}
        <div id="preferences-jimaku-fontsize" className="preferences-item">
          <div className="preferences-title">文字サイズ</div>
          <input type="number" min="1" value={this.props.fontSize}
            onChange={e => this._onChangeForm(e, 'jimakuFontSize')} /> px
        </div>
        {/* 輪郭サイズ */}
        <div id="preferences-jimaku-fontoutlinesize" className="preferences-item">
          <div className="preferences-title">輪郭サイズ</div>
          <input type="number" min="1" value={this.props.fontOutlineSize}
            onChange={e => this._onChangeForm(e, 'jimakuFontOutlineSize')} /> px
        </div>
        {/* 文字色 */}
        <div id="preferences-jimaku-fontcolor" className="preferences-item">
          <div className="preferences-title">文字色</div>
          <button className="btn-color" style={styles.fontColorPickerButton}
            onClick={e => this._handleClickPickerButton(e, 'showFontPicker')}>
            {this.props.fontColor}
          </button>
          <div style={styles.fontColorPicker} onClick={e => this._handleClickPicker(e)}>
            <ChromePicker onChangeComplete={c => this._handleChangeCompletePicker(c, 'jimakuFontColor')}
              color={this.props.fontColor}/>
          </div>
        </div>
        {/* 輪郭色 */}
        <div id="preferences-jimaku-fontoutlinecolor" className="preferences-item">
          <div className="preferences-title">輪郭色</div>
          <button className="btn-color" style={styles.fontOutlineColorPickerButton}
            onClick={e => this._handleClickPickerButton(e, 'showFontOutlinePicker')}>
            {this.props.fontOutlineColor}
          </button>
          <div style={styles.fontOutlineColorPicker} onClick={e => this._handleClickPicker(e)}>
            <ChromePicker onChangeComplete={c => this._handleChangeCompletePicker(c, 'jimakuFontOutlineColor')}
              color={this.props.fontOutlineColor} />
          </div>
        </div>
      </div>       
    )
  }

}