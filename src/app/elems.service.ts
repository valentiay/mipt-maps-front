import {Injectable} from '@angular/core';
import {Observable, of, EMPTY} from 'rxjs';
import {Elem} from './objects/Elem';
import {Shape} from './objects/Shape';
import {Point} from './objects/Point';
import {PointInfo} from './objects/PointInfo';

@Injectable({
  providedIn: 'root'
})
export class ElemsService {
  private elems: Map<string, Elem> = new Map();

  private static getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  constructor() {
    const numElements = 100;
    const maxNumPoints = 5;
    const scatter = 200;

    const elems: Elem[] = [];
    for (let i = 0; i < numElements; i++) {
      const numPoints = Math.random() * maxNumPoints;
      const points: Point[] = [];
      const baseX = Math.random() * window.innerWidth;
      const baseY = Math.random() * window.innerHeight;
      for (let k = 0; k < numPoints; k++) {
        points.push(new Point(baseX + Math.random() * scatter - scatter / 2, baseY + Math.random() * scatter - scatter / 2));
      }
      elems.push(new Elem(i.toString(), [new Shape(points, ElemsService.getRandomColor())]));
    }
    elems.forEach((elem) => this.elems.set(elem.id, elem));
  }

  addElems(objects: Object[]): Observable<never> {
    this.elems.forEach((elem: Elem) => objects[elem.id] = elem);
    return EMPTY;
  }

  getElems(): Observable<Elem[]> {
    return of(Array.from(this.elems.values()));
  }

  getPointInfo(x: number, y: number): Observable<PointInfo> {
    let nearestElem;
    let shortestDistance = Number.POSITIVE_INFINITY;
    this.elems.forEach((elem: Elem) => {
      elem.shapes.forEach((shape: Shape) => {
        shape.points.forEach((point: Point) => {
          if (Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2) < shortestDistance) {
            shortestDistance = Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2);
            nearestElem = elem;
          }
        });
      });
    });
    return of(new PointInfo(nearestElem, nearestElem.shapes[0].points));
  }
}
