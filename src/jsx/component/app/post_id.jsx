import React from 'react'

import Post from 'jsx/component/app/post'
import PostTooltip from 'jsx/component/app/post_tooltip'

export default class PostId extends React.Component {

  constructor(props) {
    super(props)
    this.state = { showTooltip: false, tooltipComponent: "" }
  }

  get id() {
    return this.props.id.replace(/^ID:/, "")
  }

  get count() {
    return Number(this.props.idCounter.indexOf(this.props.no)) + 1
  }

  get total() {
    return this.props.idCounter.length
  }

  showTooltip = () => {
    if (!this.state.showTooltip) {
      let posts = this.props.idCounter.map((no, index) => {
        let post = this.props.getPost(no)
        return (
          <Post key={index} no={no} post={post} getPost={this.props.getPost} idCounter={this.props.idCounter} />
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
    let extractClass = (this.total<5) ? 'post-id-extract' : 'post-id-extract post-id-extract-hisshi'
    let tooltip = ""
    if (this.state.showTooltip) {
      tooltip = <PostTooltip component={this.state.tooltipComponent} hideTooltip={this.hideTooltip} />
    }
    return (
      <div className="post-id">
        <div className={extractClass} onMouseOver={this.showTooltip}>
          {tooltip}
        </div>
        <div className="post-id-uid">{this.id}</div>
        <div className="post-id-counter">
          <div className="post-id-counter-count">{this.count}</div>
          <div className="post-id-counter-total">{this.total}</div>
        </div>
      </div>
    )
  }

}