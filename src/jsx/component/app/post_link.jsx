import React from 'react'
import { shell, remote } from 'electron'

export default class PostLink extends React.Component {

  constructor(props) {
    super(props)
  }

  get fullURL() {
    let url = this.props.url
    // hなしの場合をhを付加
    if (url[0] != 'h') url = 'h' + url
    return url
  }

  // 規定ブラウザで開く
  openBrowser = () => {
    shell.openExternal(this.fullURL)
  }

  showContextMenu = (event) => {
    const clipboard = remote.clipboard
    const Menu =  remote.Menu
    const MenuItem =  remote.MenuItem
    let menu = new Menu()
    menu.append(new MenuItem({
      label: '既定ブラウザで開く',
      click: ()=>{ this.openBrowser() }
    }))
    menu.append(new MenuItem({
      type: 'separator'
    }))
    menu.append(new MenuItem({
      label: 'コピー',
      click: ()=>{ clipboard.writeText(this.fullURL) }
    }))
    event.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }

  render() {
    return (
      <div className="post-body-link" onClick={this.openBrowser} onContextMenu={this.showContextMenu}>
        {this.props.url}
      </div>
    )
  }

}