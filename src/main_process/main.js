import {app, BrowserWindow, ipcMain} from 'electron'
import { Board, Thread, UrlParser } from '2ch-parser'
import request from 'superagent'
import Encoding from 'encoding-japanese'

import Storage from 'js/storage'

var window = { app: null }

// 引数で最初に出現するURL

const argUrl = global.process.argv.find((arg) => {
  return arg.match(/h?ttps?:\/\/[-_\.!~*'()a-zA-Z0-9;\/?:@&=+$,%#¥]+/i) ? true : false
})

/*-----------------------------------------
  アプリケーション起動準備完了時
-----------------------------------------*/
app.on('ready', ()=>{

  // 設定を読み込む  
  Storage.configPromise.then((config) => {
    window.app = new BrowserWindow({
      width: config.width,
      height: config.height,
      x: config.x,
      y: config.y,
      minHeight: 151
    })
    window.app.loadURL(`file://${__dirname}/html/app.html`)

    // 閉じた時
    window.app.on('close', () => {
      Storage.setConfig(window.app.getBounds(), () => {
        window.main = null      
      })
    })
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
// ------- URLのBoardを返す -------
ipcMain.on('add-board', (event, url) => {
  var board = new Board(url)
  board.fetchThreads((res)=>{
    event.sender.send('add-board-reply', {
      url: board.url,
      threads: res.body
    })
  })
})

// ------- 引数URLのBoardを返す -------
ipcMain.on('add-arg-board', (event) => {
  if (argUrl) {
    var board = new Board(UrlParser.getBoardUrl(argUrl))
    board.fetchThreads((res)=>{
      event.sender.send('add-board-reply', board)
    }) 
  }
})

// ------- URLのThreadを返す -------
ipcMain.on('add-thread', (event, threadUrl) => {
  var thread = new Thread(threadUrl)
  thread.fetchAllPosts((res) => {
    event.sender.send('add-thread-reply', thread)
  })
})

// ------- URLのThreadを表示する -------
ipcMain.on('show-thread', (event, threadUrl) => {
  event.sender.send('show-thread-reply', threadUrl)
})

// ------- thread更新して返す -------
ipcMain.on('update-thread', (event, thread) => {
  var newThread = new Thread(thread.url)
  newThread.headers = thread.headers
  newThread.posts = thread.posts
  newThread.title = thread.title
  newThread.fetchNewPosts((res) => {
    event.sender.send('update-thread-reply', newThread)
  })
})

// ------- board更新して返す -------
ipcMain.on('update-board', (event, board) => {
  var newBoard = new Board(board.url)
  newBoard.fetchThreads((res) => {
    event.sender.send('update-board-reply', newBoard)
  })
})

// ------- threadにmessageをPOSTする -------
ipcMain.on('post-write', (event, thread, message) => {
  if (UrlParser.isShitaraba(thread.url)) {
    // したらばの時
    const threadUrl = thread.url+"/"
    const writeUrl = threadUrl.replace(/read\.cgi/, 'write.cgi')
    const uri = threadUrl.split('/')
    const body = escape({
      DIR: uri[5],
      BBS: uri[6],
      KEY: uri[7],
      NAME: '',
      MAIL: 'sage',
      MESSAGE: message,
    })
    request
      .post(writeUrl)
      .type('form')
      .send(body)
      .set('Referer', threadUrl)
      .end((err, res) => {
        if (err) console.log(err)
        event.sender.send('post-write-reply', res)
      })
  }
})

const escape = (hash) => {
  return Object.keys(hash).map((key) => {
    return key + '=' + encode(hash[key])
  }).join('&')
}

const encode = (text) => {
  const eucjp = Encoding.convert(text, 'eucjp')
  return Encoding.urlEncode(eucjp)
}
