/**
 *  Copyright (C) 2018 Basalt
    This file is part of Knapsack.
    Knapsack is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 2 of the License, or (at your option)
    any later version.

    Knapsack is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along
    with Knapsack; if not, see <https://www.gnu.org/licenses>.
 */

export const addGlobalTypography = theme => `
      html {
        font-size: calc(${theme.globals.fontSize} * 0.77);
        @media screen and (min-width: ${theme.globals.breakpoints.small}) {
            font-size: calc(${theme.globals.fontSize} * 0.88);
        }
        @media screen and (min-width: ${theme.globals.breakpoints.xlarge}) {
            font-size: ${theme.globals.fontSize};
        }
      }
      h1, .h1 {
        color: ${theme.headings.h1.color};
        font-size: ${theme.headings.h1.fontSize};
        font-family: ${theme.headings.h1.fontFamily};
        margin: ${theme.headings.h1.margin};
        line-height: ${theme.headings.h1.lineHeight};
      }
      h1:first-child, .h1:first-child {
        margin-top: 0;
      }
      h1:last-child, .h1:last-child {
        margin-bottom: 0;
      }
      h2, .h2 {
        color: ${theme.headings.h2.color};
        font-size: ${theme.headings.h2.fontSize};
        font-family: ${theme.headings.h2.fontFamily};
        margin: ${theme.headings.h2.margin};
        line-height: ${theme.headings.h2.lineHeight};
      }
      h2:first-child, .h2:first-child {
        margin-top: 0;
      }
      h2:last-child, .h2:last-child {
        margin-bottom: 0;
      }
      h3, .h3 {
       color: ${theme.headings.h3.color};
        font-size: ${theme.headings.h3.fontSize};
        font-family: ${theme.headings.h3.fontFamily};
        margin: ${theme.headings.h3.margin};
        line-height: ${theme.headings.h3.lineHeight};
      }
      h3:first-child, .h3:first-child {
        margin-top: 0;
      }
      h3:last-child, .h3:last-child {
        margin-bottom: 0;
      }
      h4, .h4 {
       color: ${theme.headings.h4.color};
        font-size: ${theme.headings.h4.fontSize};
        font-family: ${theme.headings.h4.fontFamily};
        margin: ${theme.headings.h4.margin};
        line-height: ${theme.headings.h4.lineHeight};
      }
      h4:first-child, .h4:first-child {
        margin-top: 0;
      }
      h4:last-child, .h4:last-child {
        margin-bottom: 0;
      }
      h5, .h5 {
       color: ${theme.headings.h5.color};
        font-size: ${theme.headings.h5.fontSize};
        font-family: ${theme.headings.h5.fontFamily};
        margin: ${theme.headings.h5.margin};
        line-height: ${theme.headings.h5.lineHeight};
      }
      h5:first-child, .h5:first-child {
        margin-top: 0;
      }
      h5:last-child, .h5:last-child {
        margin-bottom: 0;
      }
      h6, .h6 {
        color: ${theme.headings.h6.color};
        font-size: ${theme.headings.h6.fontSize};
        font-family: ${theme.headings.h6.fontFamily};
        margin: ${theme.headings.h6.margin};
        line-height: ${theme.headings.h6.lineHeight};
      }
      h6:first-child, .h6:first-child {
        margin-top: 0;
      }
      h6:last-child, .h6:last-child {
        margin-bottom: 0;
      }
      p {
        color: ${theme.paragraphs.color};
        font-family: ${theme.paragraphs.fontFamily};
        font-size: ${theme.paragraphs.fontSize};
        line-height: ${theme.paragraphs.lineHeight};
        margin: ${theme.paragraphs.margin};
      }
      p:last-child {
        margin-bottom: 0;
      }
      ul,
      ol {
        margin: ${theme.lists.margin};
      }
      li {
        margin: ${theme.lists.margin};
      }
      a, a:link {
        color: ${theme.links.color};
        text-decoration: ${theme.links.textDecoration};
        transition: color 0.3s linear;
      }
      a:visited {
        color: ${theme.links.visited.color};
        text-decoration: ${theme.links.visited.textDecoration};
      }
      a:hover, a:focus, a:active {
        color: ${theme.links.hover.color};
        text-decoration: ${theme.links.hover.textDecoration};
      }
      blockquote {
        font-style: italic;
        border-left: ${theme.blockquotes.borderLeft};
        margin:${theme.blockquotes.margin};
        padding: ${theme.blockquotes.padding};
      }
  `;
