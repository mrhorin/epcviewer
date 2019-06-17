import storage from 'electron-json-storage'

export default class Storage {

  // appウィンドウの初期値（mainプロセス）
  static get defaultAppBounds() {
    return { width: 450, height: 700, x: 0, y: 0 }
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
      isShowWriteForm: true,
      theme: "light"
    }
  }

  // 環境設定の初期値  
  static get defaultPreferences() {
    return {
      currentTabIndex: 0,
      isReturnBoards: false,
      isReturnThreads: false,
      jimakuFontSize: 16,
      jimakuFontOutlineSize: 2,
      jimakuFontColor: "#ffffff",
      jimakuFontOutlineColor: "#0000ff",
      jimakuPort: 3000,
      theme: "light"
    }
  }

  // appBoundsの値を取得
  static get appBoundsPromise() {
    return new Promise((resolve, reject) => {
      storage.get('appBounds', (error, appBounds) => {
        if (error) {
          reject(error)
        } else {
          if (Object.keys(appBounds).length == 0) {
            appBounds = this.defaultAppBounds
          }
          resolve(appBounds)
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

  // 環境設定を取得
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

  // appBoundsの値を保存  
  static setAppBounds(appBounds, callback = ()=>{}) {
    storage.set('appBounds', appBounds, (error) => {
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

  // 環境設定の保存
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