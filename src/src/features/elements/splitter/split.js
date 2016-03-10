import {Split} from 'nathancahill/Split.js';
import {customElementHelper} from 'utils';

export function split(childs, direction, sizes, minSizes) {
  if (direction === 'horizontal') {
    direction = 'vertical';
  } else if (direction === 'vertical') {
    direction = 'horizontal';
  } else {
    throw new Error('Propertiy "direction" has to be initialized.');
  }

  if (sizes.length === 0) {
    throw new Error('Propertiy "sizes" must contain elements.');
  }

  let items = [];
  for (let i = 0; i < childs.length; i++) {
    let item = childs[i];
    // todo: refactor out jQuery
    $(item).addClass('split split-' + direction);
    items.push(item);
  }

  Split(items, {
    direction: direction,
    minSize: minSizes,
    sizes: sizes,
    onDragEnd: () => customElementHelper.dispatchEvent(window, 'resize')
  });
}
