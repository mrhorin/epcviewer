import React from 'react'

export default class App extends React.Component {

  onChangeFuga(e){
    console.log(e.target.value)
  }

  render() {
    return(
      <div>
        <h1>{this.props.fuga}</h1>
        <input ref="changeFuga" type="number" value={this.props.fuga} onChange={(e)=> this.props.onChangeFuga(e.target.value)} required/>
        <div>
          <button onClick={ () => this.props.clickIncrement() }>増加</button>
          <button onClick={ () => this.props.clickDecrement() }>減算</button>
        </div>
      </div>
    )
  }

}
