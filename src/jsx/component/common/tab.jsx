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
    return (
      <div className="tab-item">
        <span className="icon icon-cancel icon-close-tab" onClick={this._removeTab} />
        {this.props.name}
      </div>
    )
  }

}