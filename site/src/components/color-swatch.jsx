import React from 'react';
import PropTypes from 'prop-types';

const ColorSwatch = ({ color }) => (
  <div
    key={color.name}
    style={{
      width: '49%',
      marginBottom: '10px',
      padding: '5px',
      border: 'solid 1px grey',
    }}
  >
    Color: <code>{color.name}</code>
    <br />
    Value: <code>{color.value}</code>
    <div
      style={{
        height: '50px',
        backgroundColor: color.value,
        border: 'dashed 1px grey',
      }}
    />
  </div>
);

/* eslint-disable no-useless-constructor, react/prefer-stateless-function */
export default class ColorSwatches extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const colorSwatches = this.props.colors.items.map(color => (
      <ColorSwatch color={color} />
    ));

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        {colorSwatches}
      </div>
    );
  }
}
/* eslint-enable no-useless-constructor react/prefer-stateless-function */

ColorSwatch.propTypes = {
  color: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
  }).isRequired,
};

ColorSwatches.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
};