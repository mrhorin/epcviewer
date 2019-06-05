import React from 'react'

import Post from 'jsx/component/app/post'

export default class PostId extends React.Component {

  constructor(props) {
    super(props)
  }

  get counter() {
    return this.props.getIdCounter(this.props.no)
  }

  render() {
    let counter = this.counter
    return (
      <div className="post-id">
        <div className="post-id-extract">ID</div>
        <div className="post-id-uid">{this.props.id}</div>
        <div className="post-id-counter">
          <div className="post-id-counter-count">{counter.count}</div>
          <div className="post-id-counter-total">{counter.total}</div>
        </div>
      </div>
    )
  }
}