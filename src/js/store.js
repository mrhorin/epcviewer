import electronStore from 'electron-store'

export default class Store{

  constructor() {
    this.store = new electronStore({
      defaults: {
        appBounds: this.defaultAppBounds,
        appState: this.defaultAppState,
        preferences: this.defaultPreferences
      }
    })
  }

  // appウィンドウの初期値（mainプロセス）
  get defaultAppBounds() {
    return { width: 450, height: 700, x: 0, y: 0 }
  }

  // Appコンポーネントのstate初期値
  get defaultAppState() {
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
      isJimakuServer: false,
      isShowWriteForm: true,
      theme: "light"
    }
  }

  // 環境設定の初期値
  get defaultPreferences() {
    return {
      currentTabIndex: 0,
      isReturnBoards: false,
      isReturnThreads: false,
      isDisableHttps: false,
      isJimakuSe: false,
      jimakuSeFilePath: "",
      jimakuSeVolume: 5,
      jimakuFontSize: 16,
      jimakuFontOutlineSize: 2,
      jimakuFontColor: "#0000ff",
      jimakuFontOutlineColor: "#ffffff",
      jimakuPort: 3000,
      theme: "light"
    }
  }

  get appBounds() {
    return this.store.get('appBounds')
  }

  get appState() {
    return this.store.get('appState')
  }

  get preferences() {
    return this.store.get('preferences')
  }

  setAppBounds = (bounds) => {
    this.store.set('appBounds', bounds)
  }

  setAppState = (state) => {
    let preferences = this.preferences
    if (!preferences.isReturnBoards) state.boards = this.defaultAppState.boards
    if (!preferences.isReturnThreads) state.threads = this.defaultAppState.threads
    state.currentBoardIndex = 0
    state.currentBoardIndex = 0
    state.updateStatus = 'WAIT'
    state.log = ''
    state.isJimakuServer = false
    this.store.set('appState', state)
  }

  setPreferences = (preferences) => {
    this.store.set('preferences', preferences)
  }

  clear = () => {
    this.store.clear()
  }

}