import { Injectable } from '@angular/core';
import { GameService } from './gameService.service';
import { CellConfigModule } from './cell-data/cell-data.module';

@Injectable({
  providedIn: 'root'
})


export class GamesolverService {

  heightFactor: number;
  currentIndex: number;
  getColumnsCount = (): number => { return this.heightFactor };
  getCurrentIndex = (): number => { return this.currentIndex };
  stop = false


  constructor(private gameService: GameService) { }

  autoSolve(currentIndex: number,openNextAvaiable:boolean,level:number) {
    this.gameService.isLost;
    this.stop = !this.gameService.autoSolveWorking;
    if(this.stop){
      this.gameService.busy = false;
      return;
    }else if(this.gameService.isLost){
      this.gameService.busy = false;
      this.requestRestart(level);
      return;
    }else if(this.gameService.isWon){
      this.gameService.busy = false;
      return;
    }
    var tilesOpened = false;

    this.gameService.busy = true;
    this.currentIndex = currentIndex;
    var currentCell = new CellConfigModule(this.getCurrentIndex(),this.getColumnsCount(), this.gameService);


    this.heightFactor = this.gameService.getMapHeight();

    if (currentCell.SELF > 0 && currentCell.SELF - currentCell.getFlaggedTiles().length == 0) {
      currentCell.getUnopenedTiles().forEach((item, index, arr) => {
        if (currentCell.getFlaggedTiles().indexOf(item) < 0 && Number.isNaN(this.gameService.getTileValue(item))) {
          //  console.log(`Opening X: ${this.gameService.getTileX(item)}\n Y: ${this.gameService.getTileY(item)}`)
          this.gameService.openTile(this.gameService.getTileX(item), this.gameService.getTileY(item));
          if (index === arr.length - 1) {
          tilesOpened = true;
        }
        }
      })
    } else if (currentCell.hasMinesAround()) {
      currentCell.getUnopenedTiles().forEach((item) => {
        if (!this.gameService.isTileFlagged(item)){
          this.gameService.flagMine(item);
          tilesOpened = true;
        }
      })
    } else if (openNextAvaiable){
      if(Number.isNaN(currentCell.SELF) && currentCell.getFlaggedTiles().indexOf(currentIndex) < 0){
        this.gameService.openTile(this.gameService.getTileX(currentIndex), this.gameService.getTileY(currentIndex));
        tilesOpened = true;
      }
    }

  if(this.gameService.testMode)  console.log(`Auto Solving - tile opened: ${tilesOpened}`)
    if(tilesOpened){
      setTimeout(() => {
        this.autoSolve(0,false,level);
      }, 4);
    }else if(openNextAvaiable){
      setTimeout(() => {
        this.autoSolve(currentIndex + 1,true,level)
      }, 4);
    }else{
      if (currentIndex >= this.gameService.getTilesArray().length) {
       this.autoSolve(0,true,level);
    //  this.gameService.busy = false;
      return
    }else{
      setTimeout(() => {
        this.autoSolve(currentIndex + 1,false,level)
      }, 4);
    }
    }
  }

  requestRestart(level:number){
    this.gameService.getNewLevel(level);
    setTimeout(() => {
      this.autoSolve(0,false,level)
    },1000)
  }

  stopSolving(){
    this.stop = true;
  }
}
