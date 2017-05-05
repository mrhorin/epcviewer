module.exports = {

  addBoard: (url)=>{
    return { type: 'ADD_BOARD', url: url }
  },
  setListMode: (mode)=>{
    return { type: 'SET_LIST_MODE', mode: mode }
  }

}
