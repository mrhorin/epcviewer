import React from 'react'

import Post from 'jsx/component/app/post'
import PostTooltip from 'jsx/component/app/post_tooltip'

export default class PostId extends React.Component {

  constructor(props) {
    super(props)
    this.state = { showTooltip: false, tooltipComponent: "" }
  }

  get idCounter() {
    let counter = this.props.getIdCounter(this.props.no)
    let count = counter.findIndex((value, index) => {
      return value == this.props.no
    })
    return { count: Number(count) + 1, total: counter.length }
  }

  showTooltip = () => {
    if (!this.state.showTooltip) {
      let posts = this.props.getIdCounter(this.props.no).map((no, index) => {
        let post = this.props.getPost(no)
        return (
          <Post key={index} no={no} post={post} getPost={this.props.getPost} getIdCounter={this.props.getIdCounter} />          
        )
      })
      this.setState({
        showTooltip: true,
        tooltipComponent: posts
      })      
    }
  }

  hideTooltip = () => {
    if (this.state.showTooltip) {
      this.setState({ showTooltip: false, tooltipComponent: '' })      
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.showTooltip !== nextState.showTooltip
  }

  render() {
    let idCounter = this.idCounter
    let extractClass = (idCounter.total<5) ? 'post-id-extract' : 'post-id-extract post-id-extract-hisshi'
    let tooltip = ""
    if (this.state.showTooltip) {
      tooltip = <PostTooltip component={this.state.tooltipComponent} hideTooltip={this.hideTooltip} />
    }
    return (
      <div className="post-id">
        <div className={extractClass} onMouseOver={this.showTooltip}>
          {tooltip}
        </div>
        <div className="post-id-uid">{this.props.id}</div>
        <div className="post-id-counter">
          <div className="post-id-counter-count">{idCounter.count}</div>
          <div className="post-id-counter-total">{idCounter.total}</div>
        </div>
      </div>
    )
  }
}