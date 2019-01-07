import {Shape} from './Shape';

export class Elem {
  readonly id: string;
  readonly shapes: Shape[];

  constructor(id: string, shapes: Shape[]) {
    this.id = id;
    this.shapes = shapes;
  }

}
