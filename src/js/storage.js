import storage from 'electron-json-storage'

export default class Storage {

  // 設定初期値  
  static get defaultsConfig() {
    return { width: 320, height: 133 }
  }

  static get configPromise() {
    return new Promise((resolve, reject) => {
      storage.get('config', (error, config) => {
        if (error) {
          reject(error)
        } else {
          if (Object.keys(config).length == 0) {
            config = this.defaultsConfig
          }
          resolve(config)
        }
      })      
    })
  }

  static setConfig(bounds, callback = ()=>{}) {
    storage.set('config', bounds, (error) => {
      if (error) throw `Error: ${error}`
      callback()
    })
  }

}