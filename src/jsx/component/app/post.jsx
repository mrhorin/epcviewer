import React from 'react'

export default class Post extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="post">
        <div className="post-header">
          <span className="post-no">{this.props.post.no}</span>
          <span className="post-name">{this.props.post.name}</span>
          <span className="post-mail">[{this.props.post.mail}]</span>
          <span className="post-date">{this.props.post.date}</span>
          <span className="post-id">ID:{this.props.post.id}</span>
        </div>
        <div className="post-body">
          {this.props.post.body}
        </div>
      </div>
    )
  }

}
