import request from 'superagent'

class Jimaku{
  
  constructor(port = 3000) {
    this.port = port
    this.posts = []
    this.initializeJimakuServerPromise.finally(() => {
      this.showJimakuTimerID
      this.pullPostsTimerID
    })
  }

  startShowJimaku = (interval = 500) => {
    this.showJimakuTimerID = setTimeout(() => {
      this.showJimaku()
      this.startShowJimaku()
    }, interval)
  }

  startPullPosts = (interval = 3000) => {
    this.pullPostsTimerID = setTimeout(() => {
      this.pullPostsPromise.finally(() => {
        this.startPullPosts()
      })
    }, interval)
  }

  showJimaku = () => {
    if (this.posts.length > 0) {
      console.log(this.posts[0])
      this.posts.shift()
    }
  }

  get initializeJimakuServerPromise() {
    return new Promise((resolve, reject) => {
      request
        .get(`http://localhost:${this.port}/initialize_posts`)
        .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  get pullPostsPromise() {
    return new Promise((resolve, reject) => {
      request
        .get(`http://localhost:${this.port}/posts.json`)
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            this.posts = this.posts.concat(res.body)
            resolve(res)        
          }
        })
    })
  }

}

let jimaku = new Jimaku()
jimaku.startPullPosts()
jimaku.startShowJimaku()