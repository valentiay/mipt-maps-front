import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {ElemsService} from '../elems.service';
import {Elem} from '../objects/Elem';
import {PointInfo} from '../objects/PointInfo';
import {Point} from '../objects/Point';

@Component({
  selector: 'app-map-block',
  templateUrl: './map-block.component.html',
  styleUrls: ['./map-block.component.css']
})
export class MapBlockComponent implements OnInit {
  @ViewChild('canvas') canvasRef: ElementRef;

  scale = 1;

  originX = 0;
  originY = 0;

  pointerX: number;
  pointerY: number;
  pointInfo: PointInfo;

  elems: Elem[];

  isMouseDown: Boolean = false;
  isDragged: Boolean = false;

  constructor(private elemsService: ElemsService) { }

  ngOnInit() {
    this.elemsService.getElems().subscribe((elems) => {
      this.elems = elems;
      this.resizeCanvas();
      this.render();
    });
  }

  private absoluteToCanvas(x: number, y: number): [number, number] {
    return [(x + this.originX) * this.scale, (y + this.originY) * this.scale];
  }

  private canvasToAbsolute(x: number, y: number): [number, number] {
    return [x / this.scale - this.originX, y / this.scale - this.originY];
  }

  private renderPoints(ctx, points: Point[], color: string, alpha: number = 1) {
    const head = points[0];
    const tail = points.slice(1);
    ctx.beginPath();
    let [x, y] = this.absoluteToCanvas(head.x, head.y);
    ctx.moveTo(x, y);
    tail.forEach((point) => {
      [x, y] = this.absoluteToCanvas(point.x, point.y);
      ctx.lineTo(x, y);
    });
    [x, y] = this.absoluteToCanvas(head.x, head.y);
    ctx.lineTo(x, y);
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = oldAlpha;
  }

  private render() {
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.elems.forEach((elem) =>
      elem.shapes.forEach((shape) => {
        this.renderPoints(ctx, shape.points, shape.color);
      })
    );
    if (this.pointInfo != null) {
      this.renderPoints(ctx, this.pointInfo.highlightPoints, '#A00', 0.5);
    }
  }


  resizeCanvas() {
    this.canvasRef.nativeElement.width  = this.canvasRef.nativeElement.parentElement.offsetWidth;
    this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.parentElement.offsetHeight;
    this.render();
  }


  setPointer(event) {
    if (!this.isDragged) {
      const [absX, absY] = this.canvasToAbsolute(event.clientX, event.clientY);
      this.elemsService.getPointInfo(absX, absY).subscribe((pointInfo: PointInfo) => {
        if (pointInfo != null) {
          this.pointInfo = pointInfo;
          [this.pointerX, this.pointerY] = this.absoluteToCanvas(absX, absY);
        }
      });
    }
    this.isDragged = false;
    this.render();
  }


  startDragging(event) {
    this.isMouseDown = true;
  }

  continueDragging(event) {
    this.isDragged = true;
    this.originX += event.movementX / this.scale;
    this.originY += event.movementY / this.scale;
    this.pointerX += event.movementX;
    this.pointerY += event.movementY;
    this.render();
  }

  stopDragging(event) {
    this.isMouseDown = false;
  }


  changeScale(event) {
    const oldScale = this.scale;
    const [oldPointerX, oldPointerY] = this.canvasToAbsolute(this.pointerX, this.pointerY);
    this.scale *= (window.innerHeight + event.wheelDeltaY) / window.innerHeight;
    const scaleDiff = 1 / oldScale - 1 / this.scale;
    // Maybe not event.clientX
    this.originX = this.originX - event.clientX * scaleDiff;
    this.originY = this.originY - event.clientY * scaleDiff;
    [this.pointerX, this.pointerY] = this.absoluteToCanvas(oldPointerX, oldPointerY);
    this.render();
  }
}
