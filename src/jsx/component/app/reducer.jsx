// stateの初期値
const initialState = {
  fuga: 10
}

export default function reducer(state = initialState, action) {

  switch(action.type) {
    case 'INCREMENT': {
      return { fuga: Number(state.fuga) + 1 }
    }
    case 'DECREMENT': {
      return { fuga: Number(state.fuga) - 1 }
    }
    case 'CHANGE': {
      return { fuga: action.value }
    }
    default:
      return state
  }

}
