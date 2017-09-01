import * as ng from 'angular';

export default class TreeSelectorController {
  public display = false;
  public node;
  public data = require('../data/tree.json');

  /*@ngInject*/
  constructor(private $timeout : ng.ITimeoutService) {}

  public toggleTree() {
    this.display = !this.display;
  };

  public nodeSelect(node) {
    this.node = node;
    this.display = false;
  }

  public lazyLoad(node) {
    let data = require('../data/lazyTree.json');
    // Wait to simulate HTTP delay
    return new Promise(resolve => this.$timeout(() => resolve(data), 1500));
  }
}
