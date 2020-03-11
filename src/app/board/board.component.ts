import { Component, OnInit } from '@angular/core';
import { GameService } from '../gameService.service';
import { GamesolverService } from '../gamesolver.service';

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


  currentLevel: number = 1;
  autoSolveStatus:string = "autoSolve";


  constructor(private gameService: GameService, private gamesolver: GamesolverService) {

  }

  ngOnInit() {

  }





  openTile(element: any) {
    if (typeof element == "number") {
      console.log(`Clicked on X: ${this.gameService.getTileX(element)} Y: ${this.gameService.getTileY(element)}`)
      this.gameService.openTile(this.gameService.getTileX(element), this.gameService.getTileY(element));
    } else {
      console.log(`Index: ${this.getSelectionPosition()} X: ${this.gameService.getTileX(this.getSelectionPosition())} Y: ${this.gameService.getTileY(this.getSelectionPosition())}`);
      element = this.getSelectionPosition();
      var x: number;
      if (this.gameService.getTileY(element) > 0) {
        x = this.gameService.getTileX(element) - (this.gameService.getTileY(element))
      } else {
        x = this.gameService.getTileX(element)
      }
      this.gameService.openTile(x, this.gameService.getTileY(element));
    }
  }



  flagMine(event) {
    event.target.classList.toggle('redBackground')
  //  this.gameService.getMap();
    return false;
  }

  trackFn(index: number, item: string) {

  }

  getSelectionPosition(): number {
    var selection = window.getSelection();
    return selection.focusOffset - 1;
  }

  autoSolve() {
    /*if(this.gameService.getPlainText()){
    this.gamesolver.autoSolve(this.gameService.getPlainText().length / 2);
    }else{
      this.gamesolver.autoSolve(this.gameService.getTilesArray().length / 2);
    }
  }*/

    this.gamesolver.autoSolve(0);


  }
}
