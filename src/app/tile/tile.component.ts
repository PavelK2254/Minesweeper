import { Component, OnInit, Input } from '@angular/core';



@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {

  @Input() tileLabel: string;
  @Input('coordinate-x') x: number;
  @Input('coordinate-y') y: number;
  @Input('index') index: number;

  constructor() {

  }

  ngOnInit() {

  }



}
