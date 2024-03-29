import { systemPreferences, app, BrowserWindow, ipcMain, shell } from 'electron'
import Encoding from 'encoding-japanese'
import emojiRegex from 'emoji-regex/text.js'
import { Board, Thread, UrlParser } from '2ch-parser'
import request from 'superagent'

import MenuManager from 'main_process/menu_manager'
import JimakuServer from 'main_process/jimaku_server'
import Say from 'main_process/say'

import Store from 'js/store'

const store = new Store()
const jimaku = new JimakuServer()
const say = new Say()

let menu = new MenuManager()
let window = { app: null, preferences: null }
let isSay = store.appState.isSay // 読み上げ設定ON/OFF状態

systemPreferences.setAppLevelAppearance(store.preferences.theme, "light")

// アプリの多重起動を禁止
const gotTheLock = app.requestSingleInstanceLock()

/*-----------------------------------------
  アプリケーション起動準備完了時
-----------------------------------------*/
app.on('ready', () => {
  if (!gotTheLock) {
    console.log('This instance will quit because the first instance exists already.')
    app.quit()
  } else {
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
    const appBounds = store.appBounds
    let baseColor = store.preferences.theme == 'dark' ? '#444444' : '#f5f4f5'
    window.app = new BrowserWindow({
      width: appBounds.width,
      height: appBounds.height,
      backgroundColor: baseColor,
      x: appBounds.x,
      y: appBounds.y,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      }
    })
    window.app.loadURL(`file://${__dirname}/../html/app.html`)

    // 閉じた時
    window.app.on('close', ()=>{
      store.setAppBounds(window.app.getBounds())
    })
  }
})

/*-----------------------------------------
  アプリ起動済みの場合は新しい板として登録する
-----------------------------------------*/
app.on('second-instance', (event, commandLine) => {
  console.log('The second instance was build but exited.')
  const urlIndex = findUrlIndex(commandLine)
  let url = commandLine[urlIndex]
  if (store.preferences.isDisableHttps) {
    url = url.replace(/^https?:\/\//i, 'http://')
  }
  var board = new Board(UrlParser.getBoardUrl(url))
  board.fetchThreads(() => {
    window.app.focus()
    // 板名がない時はURLを板名に
    board['title'] = commandLine[urlIndex + 1] ? commandLine[urlIndex + 1] : url.replace(/^https?:\/\//i, '')
    window.app.webContents.send('add-board-reply', board)
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
  if (store.preferences.isDisableHttps) {
    url = url.replace(/^https?:\/\//i, 'http://')
  }
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
    var url = global.process.argv[urlIndex]
    if (store.preferences.isDisableHttps) {
      url = url.replace(/^https?:\/\//i, 'http://')
    }
    var board = new Board(UrlParser.getBoardUrl(url))
    board.fetchThreads((res, err) => {
      // 板名
      board['title'] = global.process.argv[urlIndex + 1] ? global.process.argv[urlIndex + 1] : url.replace(/^https?:\/\//i, '')
      event.sender.send('add-board-reply', board, err)
    })
  } else {
    event.sender.send('add-board-reply', undefined, undefined)
  }
})

// ------- URLのThreadを返す -------
ipcMain.on('add-thread', (event, threadUrl) => {
  if (store.preferences.isDisableHttps) {
    threadUrl = threadUrl.replace(/^https?:\/\//i, 'http://')
  }
  var thread = new Thread(threadUrl)
  thread.fetchAllPosts((res, err) => {
    event.sender.send('add-thread-reply', thread, err)
  })
})

// ------- thread更新して返す -------
ipcMain.on('update-thread', (event, thread) => {
  var newThread = new Thread(thread.url)
  newThread.title = thread.title
  newThread.posts = thread.posts
  newThread.headers = thread.headers
  // Last-Modified ヘッダで差分取得
  if (newThread.headers.lastModified) {
    newThread.newPostsPromise.then((res) => {
      // 新着レスがあるか
      if (res.statusCode != 304 && res.body.length > 0) {
        newThread.headers.lastModified = res.res.headers['date']
        newThread.headers.contentLength = Number(res.res.headers['content-length'])
        // 新着レスの差分だけを取得
        if (!UrlParser.isShitaraba(newThread.url)) res.body = getPostsDiff(thread.posts, res.body)
        // 字幕サーバに追加
        if (jimaku.isListening) jimaku.emitPosts(res.body)
        // 読み上げ
        if (isSay) {
          say.addPosts(res.body.map((post) => {
            return {
              no: post.no,
              name: post.name,
              mail: post.mail,
              date: post.date,
              body: post.body,
              id: post.id,
              title: post.title
            }
          }))
          say.play()
        }
      }
      newThread.posts = res.body
      event.sender.send('update-thread-reply', newThread)
    }).catch((err) => {
      console.log(err)
      newThread.posts = []
      event.sender.send('update-thread-reply', newThread)
    })
  } else {
    newThread.fetchAllPosts((res, err) => {
      if (err) {
        console.log(err)
        newThread.posts = []
      } else {
        newThread.posts = getPostsDiff(thread.posts, res.body)
        // 新着レスがある時は字幕サーバに追加
        if (jimaku.isListening && newThread.posts.length > 0) jimaku.emitPosts(newThread.posts)
        // 読み上げ
        if (isSay && newThread.posts.length > 0) {
          say.addPosts(newThread.posts.map((post) => {
            return {
              no: post.no,
              name: post.name,
              mail: post.mail,
              date: post.date,
              body: post.body,
              id: post.id,
              title: post.title
            }
          }))
          say.play()
        }
      }
      event.sender.send('update-thread-reply', newThread)
    })
  }
})

// ------- board更新して返す -------
ipcMain.on('update-board', (event, board) => {
  var newBoard = new Board(board.url)
  newBoard.fetchThreads((res, err) => {
    event.sender.send('update-board-reply', newBoard, err)
  })
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
    postMessage({ postURL: writeUrl, refererURL: threadUrl, body: body, callback: (err, res) => {
      if (err) console.log(err)
      event.sender.send('post-write-reply', extractHeadersForPostWriteReply(err, res))
    }})
  } else {
    // 一般的な2ch互換掲示板の時
    const threadUrl = thread.url+"/"
    const uri = threadUrl.split('/')
    let writeUrl = `${uri[0]}//${uri[2]}/test/bbs.cgi`
    let body = escape2ch({
      bbs: uri[5],
      key: uri[6],
      time: Number(Date.now()-100).toString(),
      FROM: '',
      mail: 'sage',
      submit: '書き込む',
      MESSAGE: message
    })
    postMessage({ postURL: writeUrl, refererURL: threadUrl, body: body, callback: (err, res) => {
      if (err) console.log(err)
      event.sender.send('post-write-reply', extractHeadersForPostWriteReply(err, res))
    }})
  }
})

// --- 読み上げのON/OFF切り替え ---
ipcMain.on('switch-say', (event, nextIsSay) => {
  isSay = nextIsSay
})

// --- 字幕サーバーの起動状態のON/OFF切り替え ---
ipcMain.on('switch-jimaku-server', (event, isJimakuServer) => {
  isJimakuServer ? jimaku.listen(store.preferences.jimakuPort) : jimaku.close()
})

ipcMain.on('open-preferences-window', (event) => {
  openPreferencesWindow()
})

// ------- 環境設定ウィンドウを閉じる -------
ipcMain.on('close-preferences-window', (event, preferences) => {
  if (Object.keys(preferences).length > 0) {
    jimaku.emitUpdatePreferences(preferences)
    window.app.webContents.send('update-preferences', preferences)
    systemPreferences.setAppLevelAppearance(preferences.theme)
  }
  window.preferences.close()
  window.preferences = null
  window.app.setIgnoreMouseEvents(false)
})

/*-----------------------------------------
  functions
-----------------------------------------*/
function openPreferencesWindow() {
  let bounds = getChildBoundsFromApp(370, 370)
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
      enableRemoteModule: true,
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
  return array.findIndex((element) => {
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
    if (emoji.match(/\d{1,1}/)) {
      // emojiRegexで半角数値もマッチしてしまう対策
      return emoji
    } else {
      return `&#${emoji.codePointAt()};`
    }
  })
  const eucjp = Encoding.convert(text, 'SJIS')
  return Encoding.urlEncode(eucjp).replace(/%8F(%A1%C1)/gi, (match, $1) => {
    // macOS環境「〜」入力対策
    return $1
  })
}

function extractValueFromHTML(html, tagName, attr, attrValue, targetAttr) {
  let reg = new RegExp(`<${tagName}.*${attr}="${attrValue}".*>`)
  let tag = html.match(reg)
  reg = new RegExp(`${targetAttr}="(.*)"`)
  let value = tag ? tag[0].match(reg)[1] : ""
  return value
}

function postMessage({ postURL, refererURL, body, cookie, callback }) {
  let date = new Date()
  date.setDate(date.getDate() + 30)
  request
    .post(postURL)
    .type('form')
    .send(body)
    .set('Referer', refererURL)
    .set('User-Agent', 'Mozilla/5.0')
    .set('Accept-Language', 'ja')
    .set('Cookie', `NAME=""; MAIL="sage"; expires=${date.toUTCString()}; path=/`)
    .end((err, res) => {
      callback(err, res)
    })
}

function extractHeadersForPostWriteReply(err, res) {
  let header
  if (err) {
    if (err.response) {
      header = {
        statusCode: err.response.statusCode,
        headers: err.response.headers
      }
    } else {
      header = {
        statusCode: 'etc',
        headers: { 'content-length': 0 }
      }
    }
  } else {
    header = {
      statusCode: res.statusCode,
      headers: res.headers
    }
  }
  return header
}
