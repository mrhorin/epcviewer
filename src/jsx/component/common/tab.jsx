import React from 'react'

export default class Tab extends React.Component {

  constructor(props) {
    super(props)
  }

  // タブを削除  
  _removeTab = () => {
    this.props.removeTab(this.props.url)
  }

  render() {
    const activeClass = this.props.active ? ' tab-item-active' : ''
    return (
      <div className={`tab-item${activeClass}`}>
        <span className="icon icon-cancel icon-close-tab" onClick={this._removeTab} />
        {this.props.name}
      </div>
    )
  }

}