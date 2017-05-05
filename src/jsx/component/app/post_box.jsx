import React from 'react'

import Post from 'jsx/component/app/post'

export default class PostBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    var posts = []
    if (this.props.state.boards.length > 0 && this.props.posts.length > 0) {
      posts = this.props.posts.map((post, index) => {
        return <Post key={index} post={post} />
      })
    }

    return (
      <div className="list" id="post-box">
        {posts}
      </div>
    )
  }

}
