export class ListItem {
  constructor(item, opts) {
    this.item = item;
    this.text = item.text;
    this.view = item.view;
    this.viewModel = item.viewModel;

    this.icon = item.icon;
    this.expanded = item.expanded || false;
    this.selected = item.selected || false;
    this.hasChildren = Array.isArray(item.nodes) && item.nodes.length > 0;


    this.visible = true;
    this.nestedLevel = 0;

    Object.assign(this, opts);

    if (this.hasChildren) {
      this.children = item.nodes.map(itemData => new ListItem(itemData, {
        parent: this,
        visible: this.expanded,
        nestedLevel: this.nestedLevel + 1,
        filter: this.filter
      }));
    }

    if (this.expanded) {
      this.expand();
    }
  }

  setFilter(filter) {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filter) {
      this.filtered = !this.filter(this.item);
      
      if (this.filtered === true) {
        this.collapse();
      }
    }
  }

  clearFilter() {
    this.filtered = false;
  }

  getChildren() {
    return this.children || [];
  }

  toggleChildrenVisibility(ev) {
    ev.stopPropagation();
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  setVisibleStatus(visible) {
    if (visible === false) {
      this.getChildren().forEach(c => c.setVisibleStatus(false));
    } else if (this.expanded) {
      this.getChildren().forEach(c => c.setVisibleStatus(true));
    }

    this.visible = visible;
  }

  expand() {
    this.expanded = true;
    this.getChildren().forEach(c => c.setVisibleStatus(true));
    this.visible = true;
    if (this.parent) {
      this.parent.expand();
    }
  }

  collapse() {
    this.expanded = false;
    this.getChildren().forEach(c => c.setVisibleStatus(false));
  }

  setSelectedStatus(status) {
    this.selected = status;
    if (this.parent) {
      this.parent.expand();
    }
  }
}
