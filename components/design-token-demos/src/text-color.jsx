import React from 'react';
import { demoPropTypes } from './utils';
import './text-color.scss';

export const TextColorDemo = ({ tokens }) => {
  if (!tokens) return null;
  return tokens.map(token => (
    <div
      className="dtd-text-color"
      key={token.name}
      style={{ color: token.value }}
    >
      <h1>{token.name} H1</h1>
      <h2>{token.name} H2</h2>
      <h3>{token.name} H3</h3>
      <h4>{token.name} H4</h4>
      <h5>{token.name} H5</h5>
      <p>Value: {token.value}</p>
      {token.comment && <p>{token.comment}</p>}
    </div>
  ));
};

TextColorDemo.propTypes = demoPropTypes;
