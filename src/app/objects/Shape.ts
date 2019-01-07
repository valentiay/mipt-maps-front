import {Point} from './Point';

export class Shape {
  readonly points: Point[];
  readonly color: string;

  constructor(points: Point[], color: string) {
    this.points = points;
    this.color = color;
  }
}
