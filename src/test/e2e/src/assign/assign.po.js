import { PageObjectSkeleton } from '../skeleton.po.js';
import { Constants } from '../constants.js';

export class PageObjectAssign extends PageObjectSkeleton {
  constructor(){
    super();
    this.routePrefix='#/test-assign';
  }

  clickRow(rowIndex){
    this.getClickables('rowClicked($item)').get(rowIndex).click();
  }

  clickMoveAllRight(){
    this.click('moveAllRight()');
  }

  clickMoveAllLeft(){
    this.click('moveAllLeft()');
  }

  clickMoveLeft(){
    this.click('moveLeft()');
  }

  clickMoveRight(){
    this.click('moveRight()');
  }
  getLeftItems(){
    return this.getElementsCount('tr', this.getBoundElements('data', 'leftItems'));
  }

  getRightItems(){
    return this.getElementsCoubt('tr', this.getBoundElements('data', 'rightItems'));
  }

}
 
