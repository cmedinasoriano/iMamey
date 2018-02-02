/**
 * polarToCartesian - Convert polar coordinates to cartesian
 *
 * @param {number} centerX        Description
 * @param {number} centerY        Description
 * @param {number} radius         Description
 * @param {number} angleInDegrees Description
 * @param {boolean} clockwise Description
 *
 * @return {any} Returns X and Y cartesian calculated positions
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees, clockwise=false) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)) * ( clockwise ? -1 : 1 ),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

/**
 * describeSVGArc - Generate a string to be used by SVG component to construct path circle/arc
 *
 * @param {number}   x             
 * @param {number}   y             
 * @param {number}   radius        
 * @param {number}   startAngle    
 * @param {number}   endAngle      
 * @param {number}   [strokeWidth=1] 
 * @param {boolean}  [clockwise=false]      
 *
 * @return {string} Svg path string
 */
function describeSVGArc(x, y, radius, startAngle, endAngle, strokeWidth=1, clockwise=false) {
  const start = polarToCartesian(x, y, radius, startAngle, clockwise);
  const end = polarToCartesian(x, y, radius, endAngle, clockwise);
  const largeArcFlag = (endAngle - startAngle > 180) ? 1 : 0;
  const w2 = strokeWidth * 2;

  return `M${start.x + w2 - .01} ${start.y + w2} A${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x + w2} ${end.y + w2}`;
}

/**
 * lerp - Description
 *
 * @param {number} a
 * @param {number} b
 * @param {number} n Interpolation alpha
 *
 * @return {number} Interpolated result
 */
function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

export {
  polarToCartesian,
  describeSVGArc,
  lerp,
};
