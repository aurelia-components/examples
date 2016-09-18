/**
 * Created by moshensky on 5/25/15.
 */
export class BaseModel {
  constructor() {
    this.isInEditMode = false;
    this.validation = undefined;
    this.bindingEngine = undefined;
    this._previousValues = {};
    this._subscriptions = [];
  }

  isNew() {
    return this.id === undefined;
  }

  setEditMode(edit) {
    this.isInEditMode = edit;

    if (edit) {
      this._previousValues = this.getOwnProperties();
    } else {
      this._previousValues = {};
    }
  }

  revertChanges() {
    if (this.isInEditMode) {
      Object.assign(this, this._previousValues);
      this.setEditMode(false);
    }
  }

  getOwnProperties() {
    let result = {};
    for (let prop in this) {
      if (this.hasOwnProperty(prop)) {
        result[prop] = this[prop];
      }
    }

    delete result.isInEditMode;
    delete result.validation;
    delete result._previousValues;
    delete result._subscriptions;

    return result;
  }

  subscribe(context, propertyName, callback) {
    let subscription = this.bindingEngine.propertyObserver(context, propertyName)
      .subscribe(callback.bind(this));
    this._subscriptions.push(subscription);
  }

  unsubscribe() {
    this._subscriptions.forEach(subscription => subscription.dispose());
  }
}

