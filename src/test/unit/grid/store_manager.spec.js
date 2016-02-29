import { Container } from 'aurelia-framework';
import { initialize } from 'aurelia-pal-browser';
import { StoreManager } from "../../../src/features/elements/grid/store/store-manager";
import { LocalStore } from "../../../src/features/elements/grid/store/local-store";
import { RemoteStore } from "../../../src/features/elements/grid/store/remote-store";
import { Grid } from "../mocks/fake-dependencies";
import { DataFeeder } from "../mocks/data-feeder";

initialize();

describe('testing store manager:', () => {
  let container, grid, feeder, storeManager;

  beforeEach(() => {
    container = new Container(),
      feeder = container.get(DataFeeder),
      grid = container.get(Grid);
  });

  it('should get local storage instance with defined data subscriptions', done => {
      grid.data = [];

      let manager = new StoreManager(grid);

      expect(manager.getDataStore() instanceof LocalStore)
        .toBeTruthy();
      expect(manager.dataPropertySubscription)
        .toBeDefined();
      expect(manager.dataCollectionSubscription)
        .toBeDefined();
      done();
    });

  it('should get remote storage instance with undefined data subscriptions', done => {

      grid.read = function(query) {};

      let manager = new StoreManager(grid);

      expect(manager.getDataStore() instanceof RemoteStore)
        .toBeTruthy();
      expect(manager.dataPropertySubscription)
        .toBeUndefined();
      expect(manager.dataCollectionSubscription)
        .toBeUndefined();

      done();
    });
});
