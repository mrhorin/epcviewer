import React from 'react'

import Post from 'jsx/component/app/post'

export default class PostAnchor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      tooltipStyle: {
        visibility: "hidden"
      }
    }
  }

  showAnchoredPost = () => {
    this.setState({tooltipStyle: { visibility: "visible" }})
  }

  hideAnchoredPost = () => {
    this.setState({ tooltipStyle: { visibility: "hidden" } })
  }

  render() {
    let anchoredPostComponent = (this.props.anchoredPost) ? (
      <Post no={this.props.anchoredPost.no} post={this.props.anchoredPost}
      getPost={this.props.getPost} getIdCounter={this.props.getIdCounter} />
    ) : ("")
    return (
      <div className="post-body-anchor" onMouseOver={this.showAnchoredPost} onMouseOut={this.hideAnchoredPost}>
        <div className="post-body-anchor-tooltip tooltip" style={this.state.tooltipStyle}>
          {anchoredPostComponent}
        </div>
        <div className="post-body-anchor-no">
          {">>"+this.props.no}
        </div>        
      </div>      
    )
  }
}