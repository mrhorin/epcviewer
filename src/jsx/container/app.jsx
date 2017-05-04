import React from 'react'
import { connect } from 'react-redux'

import App from 'jsx/component/app/app'
import { increment, decrement, change, addBoard } from 'jsx/action/app'

function mapStateToProps(state){
  return {
    boards: state.get('boards')
  }
}

function mapDispatchToProps(dispatch){
  return {
    addBoard: (url)=>{ dispatch(addBoard(url)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
