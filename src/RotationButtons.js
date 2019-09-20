import React, { Component } from "react";
import PropTypes from "prop-types";

class RotationButtons extends Component {
  constructor(props) {
    super(props);
    this.onStartRotateClick = this.onStartRotateClick.bind(this);
    this.onStopRotateClick = this.onStopRotateClick.bind(this);
    this.continuousTime = 450;
    this.timerId = null;
    this.state = {
      angleValue: props.angleValue || 0
    };
  }

  onStartRotateClick(e, direction = 1) {
    clearTimeout(this.timerId);

    const angleValue = (this.state.angleValue + parseInt(direction, 10)) % 360;
    this.setState({ angleValue }, () =>
      this.props.onRotate(this.state.angleValue)
    );

    this.timerId = setTimeout(
      () => this.onStartRotateClick(e, direction),
      this.continuousTime
    );
    if (this.continuousTime > 15) {
      this.continuousTime /= 1.25;
    }
  }

  onStopRotateClick() {
    clearTimeout(this.timerId);
    this.continuousTime = 450;
  }

  render() {
    return (
      <React.Fragment>
        <div
          className={this.props.className}
          ref={this.props.innerRef}
          style={{
            ...this.props.style,
            ...{
              zIndex: 9999,
              display: "flex",
              justifyContent: "center"
            }
          }}
        >
          <img
            className="rotate-icon-left"
            src="rotate-icon.png"
            alt="Rotate left"
            onMouseDown={e => this.onStartRotateClick(e, -1)}
            onMouseUp={this.onStopRotateClick}
          />
          &nbsp;
          <span style={{ color: "#FFF", fontWeight: "bold", size: "15px" }}>
            {this.state.angleValue}°
          </span>
          &nbsp;
          <img
            className="rotate-icon-right"
            src="rotate-icon-reversed.png"
            alt="Rotate right"
            onMouseDown={this.onStartRotateClick}
            onMouseUp={this.onStopRotateClick}
          />
          &nbsp;
          <img
            src="icon-trash.png"
            className="trash-icon"
            alt="Remove text"
            onClick={this.props.onRemove}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <RotationButtons innerRef={ref} {...props} />
));

RotationButtons.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  angleValue: PropTypes.number,
  onRotate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};

RotationButtons.defaultProps = {
  style: {},
  angleValue: 0,
  className: null
};
