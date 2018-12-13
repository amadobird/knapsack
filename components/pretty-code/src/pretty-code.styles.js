import styled from 'styled-components';

export const PreStyles = styled.pre`
  border-radius: 3px;
  position: relative;
  margin: 0 0 0.75rem;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  tab-size: 4;
  hyphens: none;
  border: 0.3em solid hsl(0, 0%, 33%); /* #282A2B */
  text-shadow: 0 -0.1em 0.2em black;
  box-shadow: 1px 1px 0.5em black inset;
  color: white;
  background-color: hsl(0, 0%, 8%); /* #141414 */

  &::-moz-selection,
  &::selection,
  & ::-moz-selection,
  & ::selection {
    text-shadow: none;
    background: hsla(0, 0%, 93%, 0.15); /* #EDEDED */
  }

  div > &:only-child {
    margin: 0;
  }
`;

export const CodeStyles = styled.code`
  &::-moz-selection,
  &::selection,
  & ::-moz-selection,
  & ::selection {
    text-shadow: none;
    background: hsla(0, 0%, 93%, 0.15); /* #EDEDED */
  }

  padding: 1em;
  border-radius: 4px;
  width: 100%;
  display: block;
  white-space: pre-wrap;
  word-spacing: normal;
  word-break: normal;
  word-wrap: break-word;

  color: white;
  background-color: hsl(0, 0%, 8%); /* #141414 */
  text-shadow: 0 -0.1em 0.2em black;
`;

export const PrismTokenStyles = styled.div`
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: hsl(0, 0%, 47%); /* #777777 */
  }

  .token.punctuation {
    opacity: 0.7;
  }

  .namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.boolean,
  .token.number,
  .token.deleted {
    color: hsl(14, 58%, 55%); /* #CF6A4C */
  }

  .token.keyword,
  .token.property,
  .token.selector,
  .token.constant,
  .token.symbol,
  .token.builtin {
    color: hsl(53, 89%, 79%); /* #F9EE98 */
  }

  .token.attr-name,
  .token.attr-value,
  .token.string,
  .token.char,
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable,
  .token.inserted {
    color: hsl(76, 21%, 52%); /* #8F9D6A */
  }

  .token.atrule {
    color: hsl(218, 22%, 55%); /* #7587A6 */
  }

  .token.regex,
  .token.important {
    color: hsl(42, 75%, 65%); /* #E9C062 */
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  /* Markup */
  .language-markup .token.tag,
  .language-markup .token.attr-name,
  .language-markup .token.punctuation {
    color: hsl(33, 33%, 52%); /* #AC885B */
  }

  /* Make the tokens sit above the line highlight so the colours don't look faded. */
  .token {
    position: relative;
    z-index: 1;
  }

  .line-highlight {
    background: hsla(0, 0%, 33%, 0.25); /* #545454 */
    background: linear-gradient(
      to right,
      hsla(0, 0%, 33%, 0.1) 70%,
      hsla(0, 0%, 33%, 0)
    ); /* #545454 */
    border-bottom: 1px dashed hsl(0, 0%, 33%); /* #545454 */
    border-top: 1px dashed hsl(0, 0%, 33%); /* #545454 */
    left: 0;
    line-height: inherit;
    margin-top: 0.75em; /* Same as .prism’s padding-top */
    padding: inherit 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    white-space: pre;
    z-index: 0;
  }

  .line-highlight:before,
  .line-highlight[data-end]:after {
    background-color: hsl(215, 15%, 59%); /* #8794A6 */
    border-radius: 999px;
    box-shadow: 0 1px white;
    color: hsl(24, 20%, 95%); /* #F5F2F0 */
    content: attr(data-start);
    font: bold 65%/1.5 sans-serif;
    left: 0.6em;
    min-width: 1em;
    padding: 0 0.5em;
    position: absolute;
    text-align: center;
    text-shadow: none;
    top: 0.4em;
    vertical-align: 0.3em;
  }

  .line-highlight[data-end]:after {
    bottom: 0.4em;
    content: attr(data-end);
    top: auto;
  }
`;
