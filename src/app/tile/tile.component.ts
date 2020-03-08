import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../gameService.service';


@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {

  @Input() tileLabel: string;
  @Input('coordinate-x') x: number;
  @Input('coordinate-y') y: number;

  constructor(private gameService: GameService) {

  }

  ngOnInit() {
    console.log('init')
    this.tileLabel = this.tileLabel.replace('□', '');
    this.tileLabel = this.tileLabel.replace('M', '');

  }

  

}
