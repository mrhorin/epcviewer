import React from 'react'

export default class Header extends React.Component {

  onChangeFuga(e){
    console.log(e.target.value)
  }

  render(){
    return(
      <header className="toolbar toolbar-header">
        <div className="flex-container">
          <div className="flex-header-btns">
            <div className="btn-group">
              <button className="btn btn-default btn-mini">
                <span className="icon icon-arrows-ccw"></span>
              </button>
              <button className="btn btn-default btn-mini">
                <span className="icon icon-window"></span>
              </button>
              <button className="btn btn-default btn-mini">
                <span className="icon icon-menu"></span>
              </button>
            </div>
          </div>
          <div className="flex-header-url">
            <input type="text"/>
          </div>
        </div>
      </header>
    )
  }

}
