import React from 'react'

export default class Tab extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="tab-item">
        {this.props.name}
      </div>
    )
  }

}