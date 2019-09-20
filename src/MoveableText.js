import { PropTypes } from "prop-types";
import React, { Component } from "react";
import Draggable from "react-draggable";
import RotationButtons from "./RotationButtons";

class MoveableText extends Component {
  constructor(props) {
    super(props);
    this.onDrag = this.onDrag.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onEditValidate = this.onEditValidate.bind(this);
    this.onEditChange = this.onEditChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onEditOpen = this.onEditOpen.bind(this);
    this.isMoving = false;
    this.isShiftPressed = false;
    this.state = {
      type: this.props.text.content ? "text" : "image",
      text: this.props.text.content || "",
      isTextInput: false,
      isSelected: this.props.isSelected || false,
      rotationBtnWidth: 0,
      rotationBtnHeight: 0,
      position: this.props.defaultPosition || {
        x: 0,
        y: 0,
        rotation: 0
      }
    };
  }

  onSelect() {
    if (!this.isMoving) {
      this.props.onSelect(this.props.id);
      this.setState(
        {
          isSelected: !this.props.isSelected
        },
        () => {
          if (this.props.isSelected) {
            if (this.props.textRef.current) {
              let textHeight = this.props.textRef.current.offsetHeight;
              let linesCount = (this.state.text.match(/\r?\n/g) || []).length;
              if (linesCount >= 1) {
                textHeight /= ++linesCount;
              }
              this.setState({
                rotationBtnWidth: this.props.textRef.current.offsetWidth,
                rotationBtnHeight: textHeight
              });
            }
          }
        }
      );
    }
    this.isMoving = false;
  }

  onEditOpen() {
    if (this.state.type === "text") {
      this.setState({
        isTextInput: true
      });
    }
  }

  onKeyDown(e) {
    if (e.keyCode === 16) {
      this.isShiftPressed = true;
    }
    if (e.keyCode === 13 && !this.isShiftPressed) {
      this.onEditValidate();
    }
    if (e.keyCode !== 16) {
      this.isShiftPressed = false;
    }
  }

  onEditChange(e) {
    this.setState({
      text: e.target.value,
      isTextInput: true
    });
  }

  onEditValidate() {
    if (!this.state.text || this.state.text.length === 0) {
      this.props.onRemove(this.props.id);
    } else {
      this.setState({
        isTextInput: false
      });
    }
  }

  onDrag(e, data) {
    this.isMoving = true;
    const { x, y } = data;
    console.log("pos=", x, y);
    this.setState({
      position: { x, y, rotation: this.state.position.rotation }
    });
  }

  render() {
    let textStyles = this.props.isSelected
      ? {
          margin: "5px",
          color: "white",
          cursor: "pointer"
        }
      : {
          margin: "6px",
          cursor: "move"
        };
    if (this.props.isSelected && this.state.type === "image") {
      textStyles.filter = "invert(1)";
    }
    if (this.props.text.style) {
      textStyles = Object.assign(textStyles, this.props.text.style);
    }
    let markup = (
      <React.Fragment>
        {this.props.isSelected && (
          <RotationButtons
            ref={this.props.rotateRefs.buttonsRef}
            angleValue={this.state.position.rotation}
            style={{
              position: "absolute",
              left: `${this.state.position.x + this.state.rotationBtnWidth}px`,
              top: `${this.state.position.y -
                this.state.rotationBtnHeight / 2}px`
            }}
            onRotate={rotation => {
              this.setState({
                position: { ...this.state.position, ...{ rotation } }
              });
            }}
            onRemove={() => this.props.onRemove(this.props.id)}
          />
        )}
        <Draggable
          axis="both"
          defaultPosition={{
            x: this.state.position.x || this.props.defaultPosition.x,
            y: this.state.position.y || this.props.defaultPosition.y
          }}
          onDrag={this.onDrag}
          onStop={this.onStop}
        >
          <div
            className={this.props.className}
            onClickCapture={this.onSelect}
            onDoubleClick={this.onEditOpen}
            ref={this.props.textRef}
            style={textStyles}
          >
            <span
              style={{
                display: "inline-block",
                transform: `rotate(${this.state.position.rotation}deg)`
              }}
            >
              {this.state.type === "text" && this.state.text}
              {this.state.type === "image" && (
                <img
                  draggable={false}
                  src={this.props.text.src}
                  alt=""
                  style={this.props.text.style}
                />
              )}
            </span>
          </div>
        </Draggable>
      </React.Fragment>
    );
    if (this.state.isTextInput) {
      markup = (
        <div
          className="input-container"
          style={{
            position: "absolute",
            top: `${
              this.state.position.y >= 0
                ? this.state.position.y - 15
                : this.state.position.y - 15
            }px`,
            left: `${
              this.state.position.x >= 0
                ? this.state.position.x
                : this.state.position.x
            }px`
          }}
        >
          <textarea
            autoFocus
            style={{
              position: "relative",
              top: "20px",
              fontSize: this.props.text.style.fontSize || "16px"
            }}
            className={this.props.className}
            name="value"
            cols="15"
            rows={`${(this.state.text.match(/\r?\n/g) || []).length + 1 || 2}`}
            value={this.state.text}
            onChange={this.onEditChange}
            onKeyDown={this.onKeyDown}
            onBlur={this.onEditValidate}
          />
        </div>
      );
    }
    return <React.Fragment>{markup}</React.Fragment>;
  }
}

export default React.forwardRef((props, ref) => {
  const { textRef, rotateRefs } = ref;
  return <MoveableText textRef={textRef} rotateRefs={rotateRefs} {...props} />;
});

MoveableText.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  src: PropTypes.string,
  defaultPosition: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  ref: PropTypes.shape({
    textRef: PropTypes.instanceOf(Element).isRequired,
    rotateRefs: PropTypes.shape({
      buttonsRef: PropTypes.instanceOf(Element).isRequired
    })
  })
};

MoveableText.defaultProps = {
  isSelected: false,
  defaultPosition: { x: 0, y: 0 }
};
