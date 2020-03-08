import { Component, OnInit } from '@angular/core';
import { GameService } from '../gameService.service';

interface Level {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})



export class BoardComponent implements OnInit {


  levels: Level[] = [
    { value: '1', viewValue: 'Level 1' },
    { value: '2', viewValue: 'Level 2' },
    { value: '3', viewValue: 'Level 3' },
    { value: '4', viewValue: 'Level 4' }
  ];
  currentLevel = 1;

  constructor(private gameService: GameService) {

  }

  ngOnInit() {

  }



  getTileX(currentIndex: number): number {
    return currentIndex % this.gameService.getMapHeight();
  }

  getTileY(currentIndex: number): number {
    return Math.floor(currentIndex / this.gameService.getMapHeight());
  }

  openTile(element: number) {
    console.log(`Clicked on X: ${this.getTileX(element)} Y: ${this.getTileY(element)}`)
    this.gameService.openTile(this.getTileX(element), this.getTileY(element));
  }

  flagMine(event) {
    event.target.classList.toggle('redBackground')
    this.gameService.getMap();
    return false;
  }

  trackFn(index,item){
    console.log(item)
  }

}
