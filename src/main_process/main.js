import {app, BrowserWindow, ipcMain} from 'electron'
import {Board, Thread} from '2ch-parser'

var window = { app: null }

// 掲示板URL
const argUrl = global.process.argv[2] ? global.process.argv[2] : ""

/*-----------------------------------------
  アプリケーション起動準備完了時
-----------------------------------------*/
app.on('ready', ()=>{

  window.app = new BrowserWindow({
    width: 320,
    height: 300,
  })
  window.app.loadURL(`file://${__dirname}/html/app.html`)

  // 閉じた時
  window.app.on('close', ()=>{
    window.main = null
  })

})

/*-----------------------------------------
  すべてのウィンドウが閉じられた時
-----------------------------------------*/
app.on('window-all-closed', ()=>{
  if(process.platform != 'darwin') app.quit()
})

/*-----------------------------------------
  イベントをバインド
-----------------------------------------*/
// ------- 引数URLを返す -------
ipcMain.on('arg-url', (event)=>{
  event.sender.send('arg-url-reply', argUrl)
})