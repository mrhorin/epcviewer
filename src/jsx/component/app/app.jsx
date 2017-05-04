import React from 'react'
import {ipcRenderer} from 'electron'

import Header from 'jsx/component/app/header'
import Footer from 'jsx/component/app/footer'

// アプリケーションのメインウィンドウ
export default class App extends React.Component {

  constructor(props){
    super(props)
    this.bindEvents = this.bindEvents.bind(this)
    this.bindEvents()
    ipcRenderer.send('arg-url')
  }

  bindEvents(){
    ipcRenderer.on('arg-url-reply', (event, argUrl)=>{
      console.log(argUrl)
    })
  }

  render() {
    return(
      <div>
        <Header addBoard={this.props.addBoard}/>
        <div id="post-form" className="form-group">
          <textarea className="form-control" rows="3"/>
        </div>
        <Footer/>
      </div>
    )
  }

}
