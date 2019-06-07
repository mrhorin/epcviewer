import React from 'react'

export default class PostTooltip extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      style: {
        visibility: 'hidden',
        bottom: '-20px',
        left: '0px'
      }
    }
  }

  get windowSize() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    w = w.innerWidth || e.clientWidth || g.clientWidth,
    h = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return { width: w, height: h }
  }

  componentDidMount() {
    // tooltipの位置を調整
    let style = { visibility: 'visible', bottom: '-20px', left: '0px' }
    let rect = this.refs.tooltip.getBoundingClientRect()
    let windowSize = this.windowSize
    // 右がはみ出ているか
    if ((rect.x + rect.width) > windowSize.width) {
      // tooltipのサイズがwindowサイズより小さいか
      if (rect.width < windowSize.width) {
        // 右詰めで表示
        style['left'] = `-${Math.round(rect.width - (windowSize.width - rect.x))}px`
      } else {
        // 左詰めで表示
        style['left'] = `-${Math.round(rect.x)}px`
      }
    }
    this.setState({ style: style })
  }

  render() {
    return (
      <div ref="tooltip" className="post-tooltip" style={this.state.style} onMouseLeave={this.props.hideTooltip}>
          {this.props.component}
      </div>
    )
  }

}