import React from 'react'

export default class Footer extends React.Component {

  onChangeFuga(e){
    console.log(e.target.value)
  }

  render(){
    return(
      <footer className="toolbar toolbar-footer">
        <div className="flex-container">
          <div className="flex-item last-update">
            17:50
          </div>
          <div className="flex-item thread-title">
            中山プログラミング配信★120中山プログラミング配信★120中山プログラミング配信★120中山プログラミング配信★120
          </div>
        </div>
      </footer>
    )
  }

}
