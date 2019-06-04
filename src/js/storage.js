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
      log: "",
      isAutoUpdate: true,
      isAutoScroll: true,
      isShowWriteForm: true
    }
  }

  // 環境設定の初期値  
  static get defaultPreferences() {
    return {
      isReturnBoards: false,
      isReturnThreads: false
    }
  }

  // mainプロセスの設定を取得  
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

  static get preferencesPromise() {
    return new Promise((resolve, reject) => {
      storage.get('preferences', (error, preferences) => {
        if (error) {
          reject(error)
        } else {
          if (Object.keys(preferences).length == 0) {
            preferences = this.defaultPreferences
          }
          resolve(preferences)
        }
      })
    })
  }

  // mainプロセス設定を保存  
  static setConfig(bounds, callback = ()=>{}) {
    storage.set('config', bounds, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

  // Appのstateを保存  
  static setState(state, callback = () => { }) {
    state.updateStatus = 'WAIT'
    state.log = ''
    storage.set('state', state, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

  static setPreferences(preferences, callback = () => { }) {
    storage.set('preferences', preferences, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

  static clearState(callback = () => { }) {
    storage.remove('state', (error) => {
      callback(error)
    })
  }

  static clearStorage(callback = () => { }) {
    storage.clear((error) => {
      if (error) throw error
      callback()
    })
  }

}