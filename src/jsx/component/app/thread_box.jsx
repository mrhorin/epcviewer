import React from 'react'

import Post from 'jsx/component/app/post'

/* スレッド一覧 */
export default class ThreadBox extends React.Component {

  constructor(props) {
    super(props)
    this.scrollBottom = this.scrollBottom.bind(this)
  }

  // 書き込み一覧の一番下までスクロール  
  scrollBottom() {
    this.postBox.scrollIntoView(false)
  }

  componentDidMount() {
    this.postBox = window.document.getElementById("post-box")
    this.scrollBottom()
  }

  componentDidUpdate() {
    this.scrollBottom()
  }

  render() {
    var posts = []
    if (this.props.state.boards.length > 0 && this.props.posts.length > 0) {
      posts = this.props.posts.map((post, index) => {
        return <Post key={index} post={post} />
      })
    }

    return (
      <div id="thread-box">
        {/*スレッドタブ*/}
        <div id="thread-tab-box">
        </div>
        {/*書き込み一覧*/}
        <div id="post-box">
          {posts}
        </div>
      </div>      
    )
  }

}