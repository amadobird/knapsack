import React from 'react';
import { TOKEN_CATS } from '../constants';
import { demoPropTypes } from './utils';

export const AnimationDemo = ({ tokens }) => {
  if (!tokens) return null;
  return tokens.map(token => (
    <div key={token.name}>
      <h4>
        {token.name}
        <code>: {token.value}</code>
      </h4>
      {token.comment && <small>{token.comment}</small>}
      <div
        style={
          {
            // borderColor: token.value,
          }
        }
      />
    </div>
  ));
};

AnimationDemo.tokenCategory = TOKEN_CATS.ANIMATION;

AnimationDemo.propTypes = demoPropTypes;
