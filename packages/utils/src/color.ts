/** @module utils */
import Color from 'color';

/**
 * Color Contrast
 * @param {string} hex - Color in hex format
 * @returns {string} - A hex of either white or black that will be readable on top of `hex` bg
 * @link https://codepen.io/davidhalford/pen/ywEva
 */
export function colorContrast(hex) {
  /*
  From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast

  Color brightness is determined by the following formula:
  ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000

  I know this could be more compact, but I think this is easier to read/explain.

  */

  const threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

  function cutHex(hVal) {
    return hVal.charAt(0) === '#' ? hVal.substring(1, 7) : hVal;
  }
  function hexToR(hVal) {
    return parseInt(cutHex(hVal).substring(0, 2), 16);
  }
  function hexToG(hVal) {
    return parseInt(cutHex(hVal).substring(2, 4), 16);
  }
  function hexToB(hVal) {
    return parseInt(cutHex(hVal).substring(4, 6), 16);
  }

  const hRed = hexToR(hex);
  const hGreen = hexToG(hex);
  const hBlue = hexToB(hex);

  const cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
  if (cBrightness > threshold) {
    return '#000000';
  }
  return '#ffffff';
}

/**
 * Convert Color
 * Convert color formats
 * @param {string} initialColor - The color to convert from
 * @param {string} format - The format to convert to. One of 'hsl', 'rgb', 'hex'
 * @returns {string} - The converted color
 */
export function convertColor(initialColor, format) {
  const theColor = Color(initialColor);
  switch (format) {
    case 'hsl':
      return theColor.hsl().string();
    case 'rgb':
      return theColor.rgb().string();
    case 'hex':
      return theColor.hex();
    default:
      return initialColor;
  }
}

/**
 * @param {string} color
 * @return {object}
 */
export function parseColor(color) {
  return Color(color).object();
}

/**
 * Has Opacity
 * Returns true if a color has opacity
 * @param {string} color - Css color string in any format
 * @return {boolean} - Returns true if the color has opacity, false if it is solid
 */
export function hasOpacity(color) {
  const theColor = Color(color);
  return !!(theColor.rgb().array().length === 4);
}
