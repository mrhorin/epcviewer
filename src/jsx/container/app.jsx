import React from 'react'
import { connect } from 'react-redux'

import App from 'jsx/component/app/app'
import { increment, decrement, change } from 'jsx/action/app'

function mapStateToProps(state){
  return state
}

function mapDispatchToProps(dispatch){
  return {
    clickIncrement: () =>{ dispatch(increment()) },
    clickDecrement: () =>{ dispatch(decrement()) },
    onChangeFuga: (value)=>{ dispatch(change(value)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
