import ReactDOM from "react-dom";
import React, { Component } from "react";
import MoveableText from "./MoveableText";
import getTexts from "./textSupplier";
import "./index.css";
import SelectionSettings from "./SelectionSettings";
import CocottePreview from "./CocottePreview";

class CocotteDrawer extends Component {
  constructor(props) {
    super(props);
    this.onTextSelected = this.onTextSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onRemoveText = this.onRemoveText.bind(this);
    let currentId = 0;
    this.state = {
      texts: getTexts().map(text => {
        text.id = ++currentId;
        text.style.zIndex = text.id;
        text.textRef = React.createRef();
        text.rotateRefs = {
          buttonsRef: React.createRef()
        };
        return text;
      })
    };
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick);
  }

  handleClick(e) {
    if (this.isTextRotating) {
      return;
    }
    let isTextClicked = false;
    for (let i = 0; i < this.state.texts.length; i++) {
      const text = this.state.texts[i];
      const textRef = text.textRef.current;
      const rotateRef = text.rotateRefs.buttonsRef.current;
      if (
        (textRef && textRef.contains(e.target)) ||
        (rotateRef && rotateRef.contains(e.target) && text.isSelected)
      ) {
        isTextClicked = true;
        break;
      }
    }
    if (!isTextClicked) {
      this.onTextSelected(null, true);
    }
  }

  onRemoveText(textId) {
    const newTexts = Object.assign(this.state.texts, {});
    let hasRemoved = false;
    for (let i = 0; i < newTexts.length; i++) {
      if (newTexts[i].id === textId) {
        newTexts.splice(i, 1);
        hasRemoved = true;
        break;
      }
    }
    if (hasRemoved) {
      this.setState({ texts: newTexts });
    }
  }

  onTextSelected(textId, unselectAll = false) {
    const newTexts = Object.assign(this.state.texts, {});
    newTexts.forEach(text => {
      if (unselectAll) {
        text.isSelected = false;
      } else {
        text.isSelected = text.id === textId;
      }
    });
    this.setState({
      texts: newTexts
    });
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClick);
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    const tileWidth = canvas.width / 4;
    ctx.strokeStyle = "black";
    ctx.setLineDash([3, 12]);
    ctx.lineWidth = 0.5;

    // first floor
    CocotteDrawer.drawSquare(ctx, 0, 0, tileWidth);
    CocotteDrawer.drawSquare(
      ctx,
      canvas.width - tileWidth,
      1,
      tileWidth,
      tileWidth
    );
    CocotteDrawer.drawLeftTriangle(ctx, tileWidth, 0, tileWidth);
    CocotteDrawer.drawRightTriangle(ctx, 3 * tileWidth, 0, tileWidth);

    CocotteDrawer.drawLeftTriangle(ctx, 0, tileWidth, tileWidth);
    CocotteDrawer.drawRightTriangle(ctx, canvas.width, tileWidth, tileWidth);
    CocotteDrawer.drawDiamond(ctx, canvas.width / 2, 0, tileWidth);

    // second floor
    CocotteDrawer.drawDiamond(ctx, tileWidth, tileWidth, tileWidth);
    CocotteDrawer.drawDiamond(
      ctx,
      canvas.width - tileWidth,
      tileWidth,
      tileWidth
    );

    CocotteDrawer.drawLeftTriangle(ctx, 0, canvas.height / 2, tileWidth, true);
    CocotteDrawer.drawRightTriangle(
      ctx,
      canvas.width,
      canvas.width / 2,
      tileWidth,
      true
    );

    // last floor
    CocotteDrawer.drawSquare(ctx, 0, canvas.height - tileWidth, tileWidth);
    CocotteDrawer.drawLeftTriangle(
      ctx,
      tileWidth,
      canvas.height - tileWidth,
      tileWidth,
      true
    );
    CocotteDrawer.drawDiamond(
      ctx,
      canvas.width / 2,
      canvas.height / 2,
      tileWidth
    );
    CocotteDrawer.drawRightTriangle(
      ctx,
      canvas.width - tileWidth,
      canvas.height - tileWidth,
      tileWidth,
      true
    );
    CocotteDrawer.drawSquare(
      ctx,
      canvas.width - tileWidth,
      canvas.height - tileWidth,
      tileWidth
    );
  }

  // x, y is the coordinates of the top summit
  static drawDiamond(ctx, x, y, dimension) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dimension, y + dimension);
    ctx.lineTo(x, y + 2 * dimension);
    ctx.lineTo(x - dimension, y + dimension);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
  }

  static drawSquare(ctx, x, y, dimension) {
    ctx.rect(x, y, dimension, dimension);
    ctx.stroke();
  }

  static drawLeftTriangle(ctx, x, y, dimension, isReversed = false) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (!isReversed) {
      ctx.lineTo(x + dimension, y);
      ctx.lineTo(x, y + dimension);
    } else {
      ctx.lineTo(x + dimension, y + dimension);
      ctx.lineTo(x, y + dimension);
    }
    ctx.closePath();
    ctx.stroke();
  }

  static drawRightTriangle(ctx, x, y, dimension, isReversed = false) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (!isReversed) {
      ctx.lineTo(x - dimension, y);
      ctx.lineTo(x, y + dimension);
    } else {
      ctx.lineTo(x - dimension, y + dimension);
      ctx.lineTo(x, y + dimension);
    }
    ctx.closePath();
    ctx.stroke();
  }

  render() {
    const textsMarkup = this.state.texts.map(text => (
      <MoveableText
        key={text.id}
        id={text.id}
        text={text}
        defaultPosition={text.position}
        isSelected={text.isSelected}
        className="overlay"
        onSelect={this.onTextSelected}
        onRemove={this.onRemoveText}
        ref={{ textRef: text.textRef, rotateRefs: text.rotateRefs }}
      />
    ));
    return (
      <div className="main-container">
        <div className="canvas-container">
          {textsMarkup}
          <canvas
            ref="canvas"
            width={1000}
            height={1000}
            style={{
              backgroundImage: "url(./kraft.jpg)",
              backgroundSize: "cover"
            }}
          />
        </div>
        <div className="preview-container">
          <CocottePreview />
        </div>
        {/*<SelectionSettings />*/}
      </div>
    );
  }
}

ReactDOM.render(<CocotteDrawer />, document.getElementById("root"));
