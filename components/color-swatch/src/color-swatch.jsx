import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { convertColor, hasOpacity, parseColor } from '@knapsack/utils';
import { Select, Button } from '@knapsack/atoms';
import CopyToClipboard from '@knapsack/copy-to-clipboard';
import './color-swatch.scss';

/**
 * Creates Sketch Palette file format from tokens
 * Requires Sketch Palettes plugin
 * @link https://github.com/andrewfiorillo/sketch-palettes
 * @param {KnapsackDesignToken[]} tokens
 * @return {string}
 */
function tokensToSketchPalettes(tokens) {
  return JSON.stringify({
    compatibleVersion: '2.0',
    pluginVersion: '2.14',
    // {
    //   red: 0.035,
    //   green: 0.11800000000000001,
    //   blue: 0.259,
    //   alpha: 0.019999999552965164,
    // },
    colors: tokens.map(({ value }) => {
      const color = convertColor(value, 'rgb');
      const { r, g, b, alpha = 1 } = parseColor(color);
      return {
        red: r / 255,
        green: g / 255,
        blue: b / 255,
        alpha,
      };
    }),
  });
}

const ColorSwatch = ({ color, format }) => {
  const colorValue = convertColor(color.value, format);
  return (
    <div className="color-swatch">
      <div className="color-swatch__swatch-info">
        <h5>{color.name}</h5>
        {color.code && (
          <h6>
            Code: <CopyToClipboard snippet={color.code} />
            <br />
            Value: <CopyToClipboard snippet={colorValue} />
          </h6>
        )}
        {color.comment && (
          <p>
            <small>{color.comment}</small>
          </p>
        )}
      </div>
      <div className="color-swatch__swatch-color-gradient-background">
        <div
          style={{
            backgroundColor: color.value ? color.value : 'auto',
            margin: hasOpacity(color.value) ? '20px' : '0',
            height: `calc(100% - ${hasOpacity(color.value) ? '40px' : '0px'})`,
          }}
        />
      </div>
    </div>
  );
};

ColorSwatch.propTypes = {
  format: PropTypes.string.isRequired,
  color: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    comment: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
};

class ColorSwatches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      format: 'rgb',
    };
  }

  render() {
    const blob = new window.Blob([tokensToSketchPalettes(this.props.colors)], {
      type: 'application/json',
    });
    const blobURL = window.URL.createObjectURL(blob);

    const colorSwatches = this.props.colors.map(color => (
      <ColorSwatch key={color.name} color={color} format={this.state.format} />
    ));
    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div>
        <div className="color-swatch__right-label">
          Color Format:
          <Select
            value={this.state.format}
            items={['rgb', 'hex', 'hsl'].map(option => ({
              value: option,
              key: option,
              name: option,
            }))}
            handleChange={value => {
              this.setState({ format: value });
            }}
          />
          <div style={{ marginLeft: 'auto' }}>
            <span>
              <a
                href="https://github.com/andrewfiorillo/sketch-palettes"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sketch Palette plugin
              </a>{' '}
              format:{' '}
            </span>
            <a href={blobURL} download="my-sketch.sketchpalette">
              <Button>Download Sketch Palette</Button>
            </a>
          </div>
        </div>
        <div className="color-swatch__swatches-wrapper">{colorSwatches}</div>
      </div>
    );
  }
}

ColorSwatches.propTypes = {
  colors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      comment: PropTypes.string,
      code: PropTypes.string,
    }),
  ).isRequired,
};

export default ColorSwatches;
