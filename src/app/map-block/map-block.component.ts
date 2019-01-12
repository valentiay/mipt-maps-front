import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {ElemsService} from '../elems.service';
import {Elem} from '../objects/Elem';

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
  elems: Elem[];

  isDragged: Boolean = false;

  constructor(private elemsService: ElemsService) { }

  ngOnInit() {
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.elemsService.getElems().subscribe((elems) => {
      this.elems = elems;
      this.resizeCanvas();
      this.render(ctx);
    });
  }

  private absoluteToCanvas(x: number, y: number): [number, number] {
    return [(x + this.originX) * this.scale, (y + this.originY) * this.scale];
  }

  private canvasToAbsolute(x: number, y: number): [number, number] {
    return [x / this.scale - this.originX, y / this.scale - this.originY];
  }

  private render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.elems.forEach((elem) =>
      elem.shapes.forEach((shape) => {
        const head = shape.points[0];
        const tail = shape.points.slice(1);
        ctx.beginPath();
        let [x, y] = this.absoluteToCanvas(head.x, head.y);
        ctx.moveTo(x, y);
        tail.forEach((point) => {
          [x, y] = this.absoluteToCanvas(point.x, point.y);
          ctx.lineTo(x, y);
        });
        [x, y] = this.absoluteToCanvas(head.x, head.y);
        ctx.lineTo(x, y);
        ctx.fillStyle = shape.color;
        ctx.fill();
      })
    );
  }

  resizeCanvas() {
    this.canvasRef.nativeElement.width  = this.canvasRef.nativeElement.parentElement.offsetWidth;
    this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.parentElement.offsetHeight;
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.render(ctx);
  }


  startDragging(event) {
    this.isDragged = true;
  }

  continueDragging(event) {
    this.originX += event.movementX / this.scale;
    this.originY += event.movementY / this.scale;
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.render(ctx);
  }

  stopDragging(event) {
    this.isDragged = false;
  }


  changeScale(event) {
    const oldScale = this.scale;
    this.scale *= (window.innerHeight + event.wheelDeltaY) / window.innerHeight;
    const scaleDiff = 1 / oldScale - 1 / this.scale;
    // Maybe not event.clientX
    this.originX = this.originX - event.clientX * scaleDiff;
    this.originY = this.originY - event.clientY * scaleDiff;
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.render(ctx);
  }
}
