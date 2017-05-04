import {List, Map} from 'immutable'

// stateの初期値
var initialState = new Map({
  boards: List([])
})

export default function reducer(state = initialState, action) {

  switch(action.type) {
    case 'ADD_BOARD': {
      return state.set('boards', state.get('boards').push(action.url))
    }
    default:
      return state
  }

}
