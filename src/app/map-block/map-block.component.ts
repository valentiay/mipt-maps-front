import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {ElemsService} from '../elems.service';
import {Elem} from '../objects/Elem';
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
  elems: Elem[];

  isDragged: Boolean = false;

  constructor(private elemsService: ElemsService) { }

  private render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.elems.forEach((elem) =>
      elem.shapes.forEach((shape) => {
        const head = shape.points[0];
        const tail = shape.points.slice(1);
        ctx.beginPath();
        ctx.moveTo(head.x + this.originX, head.y + this.originY);
        tail.forEach((point) => ctx.lineTo(point.x + this.originX, point.y + this.originY));
        ctx.lineTo(head.x + this.originX, head.y + this.originY);
        ctx.fillStyle = shape.color;
        ctx.fill();
      })
    );
  }

  startDragging(event) {
    console.log('started dragging');
    this.isDragged = true;
  }

  continueDragging(event) {
    console.log('continued dragging');
    this.originX += event.movementX;
    this.originY += event.movementY;
    console.log(this.originX);
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.render(ctx);
  }

  stopDragging(event) {
    this.isDragged = false;
    console.log('stopped dragging');
  }

  resizeCanvas() {
    console.log('resizing');
    this.canvasRef.nativeElement.width  = this.canvasRef.nativeElement.parentElement.offsetWidth;
    this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.parentElement.offsetHeight;
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.render(ctx);
  }

  ngOnInit() {
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');
    this.elemsService.getElems().subscribe((elems) => {
      this.elems = elems;
      this.resizeCanvas();
      console.log(elems);
      this.render(ctx);
    });
  }
}
