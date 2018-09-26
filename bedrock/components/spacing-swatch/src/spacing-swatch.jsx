import React from 'react';
import PropTypes from 'prop-types';
import { SpacingOuter, SpacingWrapper } from './spacing-swatch.styles';
import {connectToContext } from '@basalt/bedrock-core';

const SpacingSwatch = ({ space, color }) => (
  <SpacingWrapper>
    <SpacingOuter space={space.value} color={color}>
    </SpacingOuter>
    <div>
      <h5>Name: <code>{space.name}</code></h5>
      <h5>Value: <code>{space.value}</code></h5>
    </div>
  </SpacingWrapper>
);

/* eslint-disable no-useless-constructor, react/prefer-stateless-function */
class SpacingSwatches extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { accentColor } = this.props.context.theme.colors;
    const spaceSwatches = this.props.spaces.map(space => (
      <SpacingSwatch key={space.name} space={space} color={accentColor} />
    ));

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '600px',
        }}
      >
        {spaceSwatches}
      </div>
    );
  }
}
/* eslint-enable no-useless-constructor react/prefer-stateless-function */

SpacingSwatch.propTypes = {
  space: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
  }).isRequired,
};

SpacingSwatches.propTypes = {
  spaces: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default connectToContext(SpacingSwatches);
