import { systemPreferences, app, BrowserWindow, ipcMain, shell } from 'electron'
import { Board, Thread, UrlParser } from '2ch-parser'
import Store from 'electron-store'
import request from 'superagent'
import Encoding from 'encoding-japanese'
import emojiRegex from 'emoji-regex/text.js'

import MenuManager from 'main_process/menu_manager'
import JimakuServer from 'main_process/jimaku_server'

let store = new Store()
let menu = new MenuManager()
let window = { app: null, preferences: null }

const jimaku = new JimakuServer()
systemPreferences.setAppLevelAppearance(store.get('theme', "light"))

/*-----------------------------------------
  アプリの多重起動を禁止
  アプリ起動済みの場合は新しい板として登録する
-----------------------------------------*/
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('The instance will quit because the first instance exists already.')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    console.log('The second instance was build but exited.')
    const urlIndex = findUrlIndex(commandLine)
    const url = commandLine[urlIndex]
    var board = new Board(UrlParser.getBoardUrl(url))
    board.fetchThreads((res) => {
      window.app.focus()
      // 板名がない時はURLを板名に
      board['title'] = commandLine[urlIndex + 1] ? commandLine[urlIndex + 1] : url.replace(/^https?:\/\//i, '')
      window.app.webContents.send('add-board-reply', board)
    })
  })
}

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
        }
      ]
    },
    {
      label: '表示',
      submenu: [
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
        },
        { type: 'separator' },
        {
          label: '書き込み欄',
          accelerator: 'CmdOrCtrl+Shift+w',
          click: () => {
            window.app.webContents.send('shortcut-switch-write-form')
          }
        },
      ]
    },
    {
      label: '掲示板',
      submenu: [
        { label: '一覧の更新', accelerator: 'CmdOrCtrl+r', click: () => { window.app.webContents.send('shortcut-update-current-list') } },
        { type: 'separator' },
        { label: '投稿', accelerator: 'Shift+Enter',click: ()=>{ window.app.webContents.send('shortcut-post-write-form') } }
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

  // 設定を読み込む
  var bounds = store.get('appBounds', { width: 320, height: 640, x: 0, y: 0 })
  window.app = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 100,
    minHeight: 151,
    webPreferences: {
      nodeIntegration: true,
    }
  })
  window.app.loadURL(`file://${__dirname}/../html/app.html`)

  // 閉じた時
  window.app.on('close', ()=>{
    store.set('appBounds', window.app.getBounds())
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
  board.fetchThreads((res, err) => {
    if (err) {
      event.sender.send('outputlog', `取得失敗(${err})`)
    } else{
      if (!(board['title']))  board['title'] = board['url'].replace(/^https?:\/\//, '')
      event.sender.send('add-board-reply', {
        title: board.title,
        url: board.url,
        threads: res.body
      }) 
    }
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
      board['title'] = global.process.argv[urlIndex+1] ? global.process.argv[urlIndex+1] : url.replace(/^https?:\/\//i, '')
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
  newThread.title = thread.title
  newThread.posts = thread.posts
  newThread.headers = thread.headers
  // ペカステBBS対策（Last-Modified ヘッダの存在確認）
  if (newThread.headers.lastModified) {
    newThread.newPostsPromise.then((res) => {
      // 新着レスがあるか
      if (res.statusCode != 304 && res.body.length > 0) {
        newThread.headers.lastModified = res.res.headers['date']
        newThread.headers.contentLength = Number(res.res.headers['content-length'])
        // 新着レスの差分だけを取得
        if (!UrlParser.isShitaraba(newThread.url)) res.body = getPostsDiff(thread.posts, res.body)
        // 字幕サーバに追加
        jimaku.pushPosts(res.body)
      }
      newThread.posts = res.body
      event.sender.send('update-thread-reply', newThread)
    }).catch((err) => {
      console.log(err)
      newThread.posts = []
      event.sender.send('update-thread-reply', newThread)
    })    
  } else {
    console.warn('WARNING: Last-Modifiedヘッダがみつかりません。更新時に毎回レスを全件取得します。')
    newThread.fetchAllPosts((res, err) => {
      if (err) {
        console.log(err)
        newThread.posts = []
      } else {
        newThread.posts = getPostsDiff(thread.posts, res.body)
        // 新着レスがある時は字幕サーバに追加
        if(newThread.posts.length > 0) jimaku.pushPosts(newThread.posts)        
      }
      event.sender.send('update-thread-reply', newThread)      
    })
  }
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
        event.sender.send('post-write-reply', res, err)
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
  let bounds = getChildBoundsFromApp(350, 340)
  window.preferences = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
    }
  })
  window.preferences.loadURL(`file://${__dirname}/../html/preferences.html`)
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
  let theme = store.get('theme', "light")
  systemPreferences.setAppLevelAppearance(theme)
  window.app.setIgnoreMouseEvents(false)
  window.app.webContents.send('close-preferences-window-reply', theme)
}

// Mac環境か
function isDarwin() {
  return global.process.platform == 'darwin'
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

// 更新前のpostsと更新後のpostsの差分を返す
function getPostsDiff(postsBefore, postsAfter) {
  return postsAfter.slice(postsBefore.length)
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
