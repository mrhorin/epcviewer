import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { Board, Thread, UrlParser } from '2ch-parser'
import request from 'superagent'
import Encoding from 'encoding-japanese'
import emojiRegex from 'emoji-regex/text.js'

import MenuManager from 'main_process/menu_manager'

import Storage from 'js/storage'

let menu = new MenuManager()
let window = { app: null, preferences: null }

/*-----------------------------------------
  アプリの多重起動を禁止
  アプリ起動済みの場合は新しい板として登録する
-----------------------------------------*/
var shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
  // 多重起動時の引数URL
  const urlIndex = findUrlIndex(argv)
  if (window.app && (urlIndex >= 0)) {
    const url = argv[urlIndex]
    var board = new Board(UrlParser.getBoardUrl(url))
    board.fetchThreads((res) => {
      window.app.focus()
      // 板名
      board['name'] = argv[urlIndex+1] ? argv[urlIndex+1] : url
      window.app.webContents.send('add-board-reply', board)
    })
  }
})
if(shouldQuit) app.exit()

/*-----------------------------------------
  アプリケーション起動準備完了時
-----------------------------------------*/
app.on('ready', () => {

  menu.setContextMenu([
    {
      label: '編集',
      submenu: [
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'カット',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'ペースト',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '全選択',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
        { type: 'separator' },
        {
          label: '戻る',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '進む',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
      ]
    },
    {
      label: '移動',
      submenu: [
        {
          label: 'タブ左移動',
          accelerator: 'CmdOrCtrl+Alt+Left',
          click: () => {
            window.app.webContents.send('shortcut-tab-left')
          }
        },
        {
          label: 'タブ右移動',
          accelerator: 'CmdOrCtrl+Alt+Right',
          click: () => {
            window.app.webContents.send('shortcut-tab-right')
          }
        },
        { type: 'separator' },
        {
          label: 'タブを閉じる',
          accelerator: 'CmdOrCtrl+w',
          click: () => {
            window.app.webContents.send('shortcut-tab-close')
          }
        },
        { type: 'separator' },
        {
          label: '板一覧',
          accelerator: 'CmdOrCtrl+b',
          click: () => {
            window.app.webContents.send('shortcut-show-boards')
          }
        },
        {
          label: 'スレッド一覧',
          accelerator: 'CmdOrCtrl+t',
          click: () => {
            window.app.webContents.send('shortcut-show-threads')
          }
        }
      ]
    },
    {
      label: '設定',
      submenu: [
        { label: '環境設定', accelerator: 'CmdOrCtrl+,', click: () => { openPreferencesWindow() } },
        { type: 'separator' },
        { label: '設定を初期化', click: ()=>{ window.app.webContents.send('shortcut-clear-storage') } }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        { label: 'epcviewerについて', click: ()=>{ shell.openExternal("https://github.com/mrhorin/epcviewer") } },
        { label: "問題を報告する", click: ()=>{ shell.openExternal("https://github.com/mrhorin/epcviewer/issues") } }
      ]
    }
  ])
  menu.setMacContextMenu({
      label: app.getName(),
      submenu: [
        { label: 'epcviewerについて', click: ()=>{ shell.openExternal("https://github.com/mrhorin/epcviewer") } },
        { type: 'separator' },
        { label: '環境設定', accelerator: 'CmdOrCtrl+,', click: () => { openPreferencesWindow() } },
        { type: 'separator' },
        { label: '終了', accelerator: 'CmdOrCtrl+Q', click: ()=>{ app.quit() } }
      ]
  })
  menu.show()

  if(isDarwin()){
    const TouchBarManager = require('main_process/touch_bar_manager')
    let touchBar = new TouchBarManager()
    touchBar.addItem({
      icon: `${__dirname}/../src/img/darwin/touchbar/arrow.png`,
      click: () => {
        window.app.webContents.send('shortcut-update-current-list')
      }
    })
    touchBar.addSpacer('large')
    touchBar.addItem({
      icon: `${__dirname}/../src/img/darwin/touchbar/menu.png`,
      click: () => {
        window.app.webContents.send('shortcut-show-boards')
      }
    })
    touchBar.addItem({
      icon: `${__dirname}/../src/img/darwin/touchbar/window.png`,
      click: () => {
        window.app.webContents.send('shortcut-show-threads')
      }
    })
    touchBar.addSpacer('large')
    touchBar.addItem({
      icon: `${__dirname}/../src/img/darwin/touchbar/clock.png`,
      click: () => {
        window.app.webContents.send('shortcut-switch-auto-update')
      }
    })
    touchBar.addItem({
      icon: `${__dirname}/../src/img/darwin/touchbar/down.png`,
      click: () => {
        window.app.webContents.send('shortcut-switch-auto-scroll')
      }
    })
  }

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
    if(isDarwin) window.app.setTouchBar(touchBar.touchBar)
    // 閉じた時
    window.app.on('close', () => {
      Storage.setConfig(window.app.getBounds(), () => {
        window.app = null
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
  var board = new Board(UrlParser.getBoardUrl(url))
  board.fetchThreads((res)=>{
    event.sender.send('add-board-reply', {
      url: board.url,
      threads: res.body
    })
  })
})

// ------- 引数URLのBoardを返す -------
ipcMain.on('add-arg-board', (event) => {
  let urlIndex = findUrlIndex(global.process.argv)
  if (urlIndex >= 0) {
    const url = global.process.argv[urlIndex]
    var board = new Board(UrlParser.getBoardUrl(url))
    board.fetchThreads((res) => {
      // 板名
      board['name'] = global.process.argv[urlIndex+1] ? global.process.argv[urlIndex+1] : url
      event.sender.send('add-arg-board-reply', board)
    })
  } else {
    event.sender.send('add-arg-board-reply', "")
  }
})

// ------- URLのThreadを返す -------
ipcMain.on('add-thread', (event, threadUrl) => {
  var thread = new Thread(threadUrl)
  thread.fetchAllPosts((res) => {
    event.sender.send('add-thread-reply', thread)
  })
})

// ------- thread更新して返す -------
ipcMain.on('update-thread', (event, thread) => {
  var newThread = new Thread(thread.url)
  newThread.headers = thread.headers
  newThread.title = thread.title
  newThread.posts = thread.posts
  newThread.newPostsPromise.then((res) => {
    newThread.posts = res.body
    event.sender.send('update-thread-reply', newThread)
  }).catch((res) => {
    event.sender.send('update-thread-reply', thread)
  })
})

// ------- board更新して返す -------
ipcMain.on('update-board', (event, board) => {
  var newBoard = new Board(board.url)
  newBoard.threadsPromise.then((res) => [
    event.sender.send('update-board-reply', newBoard)
  ])
})

// ------- threadにmessageをPOSTする -------
ipcMain.on('post-write', (event, thread, message) => {
  if (UrlParser.isShitaraba(thread.url)) {
    // したらばの時
    const threadUrl = thread.url+"/"
    const writeUrl = threadUrl.replace(/read\.cgi/, 'write.cgi')
    const uri = threadUrl.split('/')
    const body = escapeShitaraba({
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
        event.sender.send('post-write-reply', res, err)
      })
  } else {
    const threadUrl = thread.url+"/"
    const uri = threadUrl.split('/')
    const writeUrl = `${uri[0]}//${uri[2]}/test/bbs.cgi`
    const body = escape2ch({
      bbs: uri[5],
      key: uri[6],
      time: Number(Date.now()-100).toString(),
      FROM: '',
      mail: 'sage',
      submit: '書き込む',
      MESSAGE: message
    })
    request
      .post(writeUrl)
      .type('form')
      .send(body)
      .set('Referer', threadUrl)
      .set('User-Agent', 'Monazilla/5.0')
      .end((err, res) => {
        if (err) console.log(err)
        event.sender.send('post-write-reply', res)
      })
  }
})

// ------- URLのThreadを表示する -------
ipcMain.on('show-thread', (event, threadUrl) => {
  event.sender.send('show-thread-reply', threadUrl)
})

// ------- 環境設定ウィンドウを閉じる -------
ipcMain.on('close-preferences-window', (event) => {
  closePreferencesWindow()
})

/*-----------------------------------------
  functions
-----------------------------------------*/
function openPreferencesWindow() {
  let bounds = getChildBoundsFromApp(320, 240)
  window.preferences = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    alwaysOnTop: true,
    resizable: false,
    center: true
  })
  window.preferences.loadURL(`file://${__dirname}/html/preferences.html`)
  window.app.setIgnoreMouseEvents(true)
  // 閉じた時
  window.preferences.on('close', () => {
    window.preferences = null
    window.app.setIgnoreMouseEvents(false)
  })
}

function closePreferencesWindow() {
  window.preferences.close()
  window.preferences = null
  window.app.setIgnoreMouseEvents(false)
}

// Mac環境か
function isDarwin() {
  return process.platform == 'darwin'
}

// window.appの中心の相対座標を取得
function getChildBoundsFromApp(childWidth, childHeight) {
  let parrent = window.app.getBounds()
  let x = Math.round(
    parrent.x + (parrent.width/2) - (childWidth/2)
  )
  let y = Math.round(
    parrent.y + (parrent.height/2) - (childHeight/2)
  )
  return { x: x, y: y, width: childWidth, height: childHeight }
}

// arrayから最初に出現するURLのindexを取得する
function findUrlIndex(array) {
  return array.findIndex((element, index) => {
    return element.match(/https?:\/\/[-_\.!~*'()a-zA-Z0-9;\/?:@&=+$,%#¥]+/i) ? true : false
  })
}

function escapeShitaraba(hash) {
  return Object.keys(hash).map((key) => {
    return key + '=' + encodeShitaraba(hash[key])
  }).join('&')
}

function encodeShitaraba(text) {
  // 絵文字を数値参照に置換
  text = text.replace(emojiRegex(), (emoji) => {
    return `&#${emoji.codePointAt()};`
  })
  const eucjp = Encoding.convert(text, 'EUCJP')
  return Encoding.urlEncode(eucjp).replace(/%8F(%A1%C1)/gi, (match, $1) => {
    // macOS環境「〜」入力対策
    return $1
  })
}

function escape2ch(hash) {
  return Object.keys(hash).map((key) => {
    if (key == 'bbs' || key == 'key' || key == 'time') {
      return key + '=' + hash[key]
    } else {
      return key + '=' + encode2ch(hash[key])
    }
  }).join('&')
}

function encode2ch(text) {
  // 絵文字を数値参照に置換
  text = text.replace(emojiRegex(), (emoji) => {
    return `&#${emoji.codePointAt()};`
  })
  const eucjp = Encoding.convert(text, 'SJIS')
  return Encoding.urlEncode(eucjp).replace(/%8F(%A1%C1)/gi, (match, $1) => {
    // macOS環境「〜」入力対策
    return $1
  })
}
