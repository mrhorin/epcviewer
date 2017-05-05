import { List, Map } from 'immutable'

// stateの初期値
var initialState = new Map({
  boards: List([]),
  currentBoard: 0,
  currentThread: 0,
  listMode: "THREADS"
})

export default function reducer(state = initialState, action) {

  switch (action.type) {
    case 'ADD_BOARD': {
      return state.set('boards', state.get('boards').push(action.url))
    }
    case 'SET_LIST_MODE': {
      return state.set('listMode', action.mode)
    }
    default:
      return state
  }

}
