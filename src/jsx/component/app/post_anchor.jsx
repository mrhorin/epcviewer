import React from 'react'

import Post from 'jsx/component/app/post'
import PostTooltip from 'jsx/component/app/post_tooltip'

export default class PostAnchor extends React.Component {

  constructor(props) {
    super(props)
    this.state = { showTooltip: false, tooltipComponent: null }
  }

  showTooltip = () => {
    if (!this.state.showTooltip) {
      let post = this.props.getPost(this.props.no)
      // アンカー先が存在するレス番号か
      if (post) {
        this.setState({
          showTooltip: true,
          tooltipComponent: <Post no={this.props.no} post={post} getPost={this.props.getPost} idCounter={this.props.idCounter} />
        })
      } else {
        this.hideTooltip()
      }
    }
  }

  hideTooltip = () => {
    if (this.state.showTooltip) {
      this.setState({ showTooltip: false, tooltipComponent: null })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.showTooltip !== nextState.showTooltip
  }

  render() {
    let tooltip = ""
    if (this.state.showTooltip) {
      tooltip = <PostTooltip component={this.state.tooltipComponent} hideTooltip={this.hideTooltip} />
    }
    return (
      <div className="post-body-anchor" onMouseOver={this.showTooltip} onMouseLeave={this.hideTooltip}>
        {tooltip}
        <div className="post-body-anchor-no">
          {">>"+this.props.no}
        </div>
      </div>
    )
  }
}