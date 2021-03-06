import React from 'react'

import Post from 'jsx/component/app/post'
import PostTooltip from 'jsx/component/app/post_tooltip'

import Immutable from 'immutable'

export default class PostId extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      idCounter: this.props.idCounter,
      showTooltip: false,
      tooltipComponent: null
    }
  }

  get id() {
    return this.props.id.replace(/^ID:/, "")
  }

  get count() {
    return Number(this.state.idCounter.get(this.props.id).indexOf(this.props.no)) + 1
  }

  get total() {
    return this.state.idCounter.get(this.props.id).size
  }

  showTooltip = () => {
    if (!this.state.showTooltip) {
      let posts = this.state.idCounter.get(this.props.id).map((no, index) => {
        let post = this.props.getPost(no)
        return (
          <Post key={index} no={no} post={post} getPost={this.props.getPost} idCounter={this.state.idCounter} />
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
      this.setState({ showTooltip: false, tooltipComponent: null })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let showTooltipDiff = this.state.showTooltip !== nextState.showTooltip
    let idCounterDiff = !(Immutable.is(this.state.idCounter.get(this.props.id), nextProps.idCounter.get(nextProps.id)))
    return showTooltipDiff || idCounterDiff
  }

  componentDidUpdate() {
    if (!(Immutable.is(this.state.idCounter.get(this.props.id), this.props.idCounter.get(this.props.id)))) {
      this.setState({ idCounter: this.props.idCounter })
    }
  }

  render() {
    let extractClass = (this.total < 5) ? 'post-id-extract' : 'post-id-extract post-id-extract-hisshi'
    let tooltip = ""
    if (this.state.showTooltip) {
      tooltip = <PostTooltip component={this.state.tooltipComponent} hideTooltip={this.hideTooltip} />
    }
    return (
      <div className="post-id">
        <div className={extractClass} onMouseOver={this.showTooltip} onMouseLeave={this.hideTooltip}>
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