module.exports = {

  increment: () => {
    return { type: 'INCREMENT' }
  },
  decrement: ()=>{
    return { type: 'DECREMENT' }
  },
  change: (value)=>{
    return { type: 'CHANGE', value: value }
  }

}
