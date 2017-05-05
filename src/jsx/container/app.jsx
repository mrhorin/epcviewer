import React from 'react'
import { connect } from 'react-redux'

import App from 'jsx/component/app/app'
import { addBoard, setListMode } from 'jsx/action/app'

function mapStateToProps(state) {
  return {
    boards: state.get('boards'),
    currentBoard: state.get('currentBoard'),
    currentThread: state.get('currentThread'),
    listMode: state.get('listMode')
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addBoard: (url) => { dispatch(addBoard(url)) },
    setListMode: (type) => { dispatch(setListMode(type)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
