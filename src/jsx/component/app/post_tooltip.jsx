import React from 'react'

export default class PostTooltip extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillUnmount = () => {
    console.log('did mount post_tooltip')
  }

  render() {
    return (
      <div className="post-tooltip" onMouseLeave={this.props.hideTooltip}>
          {this.props.component}
      </div>
    )
  }

}