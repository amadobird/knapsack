import React from 'react';
import { KnapsackDesignToken } from '@knapsack/core';
import './font-size.scss';

type Props = {
  tokens: KnapsackDesignToken[];
};

export const FontSizeDemo: React.FC<Props> = ({ tokens }: Props) => {
  if (!tokens) return null;
  const demos = tokens.map((token, index) => (
    <div
      className={`dtd-font-size
        ${tokens.length !== index + 1 ? 'dtd-font-size--listed' : ''}`}
      key={token.name}
      style={{
        fontSize: token.value,
      }}
    >
      <code>{token.name}</code>: {token.value} <br />
      <blockquote contentEditable suppressContentEditableWarning>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </blockquote>
    </div>
  ));

  return <div>{demos}</div>;
};