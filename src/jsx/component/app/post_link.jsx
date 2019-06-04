import React from 'react'
import { shell } from 'electron'

export default class PostLink extends React.Component {

  constructor(props) {
    super(props)
  }

  // 規定ブラウザで開く
  openBrowser = () => {
    let url = this.props.url
    // hなしの場合をhを付加
    if(url[0] != 'h') url = 'h' + url
    shell.openExternal(url)
  }

  render() {
    return (
      <div className="post-body-link" onClick={this.openBrowser}>
        {this.props.url}
      </div>      
    )
  }

}