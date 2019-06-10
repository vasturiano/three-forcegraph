import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import tinyColor from 'tinycolor2';

const colorStr2Hex = str => isNaN(str) ? parseInt(tinyColor(str).toHex(), 16) : str;
const colorAlpha = str => isNaN(str) ? tinyColor(str).getAlpha(): 1;

const autoColorScale = scaleOrdinal(schemePaired);

// Autoset attribute colorField by colorByAccessor property
// If an object has already a color, don't set it
// Objects can be nodes or links
function autoColorObjects(objects, colorByAccessor, colorField) {
  if (!colorByAccessor || typeof colorField !== 'string') return;

  objects.filter(obj => !obj[colorField]).forEach(obj => {
    obj[colorField] = autoColorScale(colorByAccessor(obj));
  });
}

export { autoColorObjects, colorStr2Hex, colorAlpha };
