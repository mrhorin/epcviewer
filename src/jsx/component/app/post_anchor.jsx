import React from 'react'
import { emojify } from 'react-emojione'
import _ from 'lodash'

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
    this.setState({tooltipStyle: { visibility: "hidden" }})
  }

  render() {
    return (
      <div className="post-body-anchor" onMouseOver={this.showAnchoredPost} onMouseOut={this.hideAnchoredPost}>
        <div className="post-body-anchor-tooltip" style={this.state.tooltipStyle}>
          <Post no={this.props.anchored_post.no} post={this.props.anchored_post} getPost={this.props.getPost}/>
        </div>
        <div className="post-body-anchor-no">
          {">>"+this.props.anchored_post.no}
        </div>        
      </div>      
    )
  }
}