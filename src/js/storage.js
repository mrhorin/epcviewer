import storage from 'electron-json-storage'

export default class Storage {

  // 設定初期値  
  static get defaultConfig() {
    return { width: 320, height: 133 }
  }

  // Appコンポーネントのstate初期値
  static get defaultState() {
    return {
      boards: [],
      threads: [],
      currentBoardIndex: 0,
      currentThreadIndex: 0,
      currentUrl: "",
      listMode: "BOARDS",
      updateStatus: "WAIT",
      autoUpdate: true,
      autoScroll: true
    }
  }

  // 設定を取得  
  static get configPromise() {
    return new Promise((resolve, reject) => {
      storage.get('config', (error, config) => {
        if (error) {
          reject(error)
        } else {
          if (Object.keys(config).length == 0) {
            config = this.defaultConfig
          }
          resolve(config)
        }
      })      
    })
  }

  // stateを取得  
  static get statePromise() {
    return new Promise((resolve, reject) => {
      storage.get('state', (error, state) => {
        if (error) {
          reject(error)
        } else {
          if (Object.keys(state).length == 0) {
            state = this.defaultState
          }
          resolve(state)
        }
      })
    })
  }
  
  // 設定を保存  
  static setConfig(bounds, callback = ()=>{}) {
    storage.set('config', bounds, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

  // stateを保存  
  static setState(state, callback = () => { }) {
    console.log(state)
    state.updateStatus = 'WAIT'
    storage.set('state', state, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

}