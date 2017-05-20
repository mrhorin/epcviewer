import React from 'react'

export default class Tab extends React.Component {

  constructor(props) {
    super(props)
  }

  _clickCloseHandler = () => {
    // タブを削除
    this.props.removeTab(this.props.url)
  }

  _clickTabHandler = () => {
    // タブが非アクティブなら選択状態にする
    if(!this.props.active) this.props.selectTab(this.props.index)
  }

  render() {
    const activeClass = this.props.active ? ' tab-item-active' : ''
    return (
      <div className={`tab-item${activeClass}`}>
        <span className="icon icon-cancel icon-close-tab" onClick={this._clickCloseHandler}></span>
        <div className="tab-item-name" onClick={this._clickTabHandler}>{this.props.name}</div>
      </div>
    )
  }

}