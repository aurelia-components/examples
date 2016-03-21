import { Container, BindingEngine, TemplatingEngine } from 'aurelia-framework';
import { initialize } from 'aurelia-pal-browser';
import { Grid } from "../mocks/fake-dependencies";
import { DataFeeder } from "../mocks/data-feeder";
import { Assign } from "../../../src/features/elements/assign/assign";

initialize();

describe('testing assign: ', () => {
  let container, feeder, templatingEngine, elem, assign;
  beforeEach(() => {
    container = new Container(),
      templatingEngine = container.get(TemplatingEngine),
      elem = container.registerInstance(Element, document.createElement('div')),
      assign = templatingEngine.createViewModelForUnitTest(Assign),
    feeder = container.get(DataFeeder);
    assign.leftItems = ['sample1', 'sample2', 'sample3'];
    assign.rightItems = ['sample4', 'sample5', 'sample6'];

  });
  it('should check left/right buttons avaiability when selected item changes', done => {
      assign.select(assign.leftItems[2]);
      assign.recalculateMoveLeftRightDisabled();
      expect(assign.moveRightDisabled)
        .toBeFalsy();
      expect(assign.moveLeftDisabled)
        .toBeTruthy();
      assign.select(assign.rightItems[2]);
      assign.recalculateMoveLeftRightDisabled();
      expect(assign.moveRightDisabled)
        .toBeTruthy();
      expect(assign.moveLeftDisabled)
        .toBeFalsy();

      done();
    });
  it('should move left items to the right side and vice versa', done => {
    let switchedItem = assign.leftItems[2];
    assign.select(switchedItem);
    assign.moveRight();
    expect(assign.leftItems).not.toContain(switchedItem);
    expect(assign.rightItems).toContain(switchedItem);
    switchedItem = assign.rightItems[1];
    assign.select(switchedItem);
    assign.moveLeft();
    expect(assign.leftItems).toContain(switchedItem);
    expect(assign.rightItems).not.toContain(switchedItem);

    done();
  });

  it('should move left items to the right side and vice versa', done => {
    assign.moveAllRight();
    expect(assign.leftItems.length).toBe(0);
    expect(assign.rightItems.length).toBe(6);
    assign.moveAllLeft();
    expect(assign.leftItems.length).toBe(6);
    expect(assign.rightItems.length).toBe(0);

    done();
  });
});
