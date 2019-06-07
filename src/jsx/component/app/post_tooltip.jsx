import React from 'react'

export default class PostTooltip extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="post-tooltip" onMouseLeave={this.props.hideTooltip}>
          {this.props.component}
      </div>
    )
  }

}