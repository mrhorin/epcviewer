import React from 'react'
import _ from 'lodash'

import Tab from 'jsx/component/common/tab'
import Post from 'jsx/component/app/post'

/* スレッド一覧 */
export default class ThreadBox extends React.Component {

  constructor(props) {
    super(props)
  }

  getPost = (no) => {
    const index = _.findIndex(this.props.posts, { no: no })
    return this.props.posts[index]
  }

  // 書き込み一覧の一番下までスクロール  
  scrollBottom = () => {
    this.postBox.scrollIntoView(false)
  }

  _removeThread = (threadUrl) => {
    this.props.removeThread(threadUrl)
  }

  _selectThread = (index) => {
    this.props.selectThread(index)
  }

  componentDidMount() {
    this.postBox = window.document.getElementById("post-box-end")
    this.scrollBottom()
  }

  componentDidUpdate() {
    // オートスクロール
    if(this.props.autoScroll) this.scrollBottom()
  }

  render() {
    let posts = []
    if (this.props.boards.length > 0 && this.props.posts.length > 0) {
      posts = this.props.posts.map((post, index) => {
        return <Post key={index} no={index + 2} post={post} getPost={this.getPost}/>
      })
    }
    let tabs = []
    if (this.props.threads.length > 0) {
      tabs = this.props.threads.map((thread, index) => {
        const active = this.props.currentThreadIndex==index
        return (
          <Tab key={index} index={index} name={thread.title} url={thread.url} active={active}
            removeTab={this._removeThread} selectTab={this._selectThread} />
        )
      })
    }

    return (
      <div id="thread-box">
        {/*スレッドタブ*/}
        <div id="thread-tab-box">
          <div className="tab-group">
            {tabs}
          </div>
        </div>
        {/*書き込み一覧*/}
        <div id="post-box">
          {posts}
          <div id="post-box-end"/>
        </div>
      </div>
    )
  }

}