import React from 'react'

export default class PostBox extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    var posts = []
    if (this.props.state.boards.size > 0) {
      posts = this.props.state.boards.get(this.props.state.currentBoard).threads[this.props.state.currentThread].posts.map((post, index) => {
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
