import {Elem} from './Elem';
import {Point} from './Point';

export class PointInfo {
  readonly elem: Elem;
  readonly highlightPoints: Point[];

  constructor(elem: Elem, highlightPoints: Point[]) {
    this.elem = elem;
    this.highlightPoints = highlightPoints;
  }
}
