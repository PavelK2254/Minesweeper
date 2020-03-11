import { Injectable } from '@angular/core';
import { GameService } from './gameService.service';


class CellData {


  UL: number; U: number; UR: number;
  L: number; SELF: number; R: number;
  DL: number; D: number; DR: number;
  shouldSkip: boolean;
  gameService: GameService;
  gamesolver: GamesolverService;
  X: number;
  Y: number;
  currentIndex: number;
  columnCount: number;

  constructor(gamesolver: GamesolverService, gameService: GameService) {
    this.gameService = gameService;
    this.gamesolver = gamesolver;
    this.currentIndex = gamesolver.getCurrentIndex();
    this.columnCount = gamesolver.getColumnsCount();
    this.UL = this.checkUL(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //this.UL = ((currentIndex - columnCount) -1);
    this.U = this.checkU(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //this.U = (currentIndex - columnCount)
    this.UR = this.checkUR(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //this.UR = ((currentIndex - columnCount)+1)

    this.L = this.checkL(gamesolver.getCurrentIndex());
    //  this.L = currentIndex - 1;
    this.SELF = gameService.getTileValue(this.currentIndex)
    this.R = this.checkR(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //this.R = currentIndex + 1;

    this.DL = this.checkDL(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //  this.DL = ((currentIndex + columnCount)-1);
    this.D = this.checkD(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());
    //this.D = currentIndex + columnCount;
    this.DR = this.checkDR(gamesolver.getCurrentIndex(), gamesolver.getColumnsCount());


    this.shouldSkip = Number.isNaN(this.SELF);

    this.X = gameService.getTileX(gamesolver.getCurrentIndex())
    this.Y = gameService.getTileY(gamesolver.getCurrentIndex())

    /*console.log(`X: ${this.X} Y: ${this.Y}
      \n UL: ${this.UL} U: ${this.U} UR: ${this.UR}\n
    L: ${this.L} Self: ${this.SELF} R: ${this.R}\n
    DL: ${this.DL} D: ${this.D} DR: ${this.DR}`)*/
  }

  checkR(currentIndex: number, heightFactor: number): number {
    if (this.gameService.getTileX(currentIndex) >= (heightFactor - 1)) {
      return -1;
    }
    return (this.gameService.getTileValue(currentIndex + 1));
  }

  checkU(currentIndex: number, heightFactor: number): number {
    return (this.gameService.getTileValue(currentIndex - heightFactor));
  }

  checkD(currentIndex: number, heightFactor: number): number {
    return (this.gameService.getTileValue(currentIndex + heightFactor));
  }

  checkL(currentIndex: number): number {
    if (this.gameService.getTileX(currentIndex) == 0) {
      return -1
    }
    return (this.gameService.getTileValue(currentIndex - 1));
  }

  checkUR(currentIndex: number, heightFactor: number): number {
    if (this.gameService.getTileX(currentIndex) >= (heightFactor - 1)) {
      return -1
    }
    return (this.gameService.getTileValue((currentIndex - heightFactor) + 1));
  }

  checkUL(currentIndex: number, heightFactor: number): number {
    if (this.gameService.getTileX(currentIndex) == 0) {
      return -1
    }
    return (this.gameService.getTileValue((currentIndex - heightFactor) - 1));
  }

  checkDL(currentIndex: number, heightFactor: number): number {
    if (this.gameService.getTileX(currentIndex) == 0) {
      return -1;
    }
    return (this.gameService.getTileValue((currentIndex + heightFactor) - 1));
  }

  checkDR(currentIndex: number, heightFactor: number): number {
    if (this.gameService.getTileX(currentIndex) >= (heightFactor - 1)) {
      return -1
    }
    return (this.gameService.getTileValue((currentIndex + heightFactor) + 1));
  }

  /*  sumOfNeighbours = ():number => {
      var result =+


      return result;
    }*/

  sumOfUnopened = (): number => {
    var result: number = 0;
    result += Number.isNaN(this.UL) ? 1 : 0;
    result += Number.isNaN(this.U) ? 1 : 0;
    result += Number.isNaN(this.UR) ? 1 : 0;

    result += Number.isNaN(this.L) ? 1 : 0;
    result += Number.isNaN(this.R) ? 1 : 0;

    result += Number.isNaN(this.DL) ? 1 : 0;
    result += Number.isNaN(this.D) ? 1 : 0;
    result += Number.isNaN(this.DR) ? 1 : 0;

    //  console.log(`Sum of Unopened ${result}`)
    return result;
  }

  hasMinesAround = (): boolean => {
    return this.sumOfUnopened() == this.SELF;
  }

  getUnopenedTiles(): Array<number> {
    var minesTiles = new Array<number>();
    if (Number.isNaN(this.UL)) minesTiles.push((this.currentIndex - this.columnCount) - 1);
    if (Number.isNaN(this.U)) minesTiles.push(this.currentIndex - this.columnCount);
    if (Number.isNaN(this.UR) && this.gameService.getTileX(this.currentIndex) < (this.columnCount - 1)) minesTiles.push((this.currentIndex - this.columnCount) + 1);

    if (Number.isNaN(this.L) && this.gameService.getTileX(this.currentIndex) != 0) minesTiles.push(this.currentIndex - 1);
    if (Number.isNaN(this.R) && this.gameService.getTileX(this.currentIndex) < (this.columnCount - 1)) minesTiles.push(this.currentIndex + 1);

    if (Number.isNaN(this.DL) && this.gameService.getTileX(this.currentIndex) != 0) minesTiles.push((this.currentIndex + this.columnCount) - 1);
    if (Number.isNaN(this.D)) minesTiles.push(this.currentIndex + this.columnCount);
    if (Number.isNaN(this.DR) && this.gameService.getTileX(this.currentIndex) < (this.columnCount - 1)) minesTiles.push((this.currentIndex + this.columnCount) + 1);

    return minesTiles;
  }

  getFlaggedTiles(): Array<number> {
    var flaggedTiles = new Array<number>();
    this.getUnopenedTiles().forEach(item => {
      if (this.gameService.isTileFlagged(item)) {
        //console.log(`Flagged: X: ${this.gameService.getTileX(item)} Y: ${this.gameService.getTileY(item)}`)
        flaggedTiles.push(item)
      }
    });
    return flaggedTiles;
  }



}

@Injectable({
  providedIn: 'root'
})



export class GamesolverService {

  heightFactor: number;
  currentIndex: number;
  getColumnsCount = (): number => { return this.heightFactor };
  getCurrentIndex = (): number => { return this.currentIndex };


  constructor(private gameService: GameService) { }

  autoSolve(currentIndex: number) {

    console.log("Auto Solving")
    this.gameService.busy = true;
    this.currentIndex = currentIndex;
    var lost = this.gameService.requestedLevel === 0
    if (lost || currentIndex >= this.gameService.tiles.length) {
      this.gameService.busy = false;
      return
    }
    this.heightFactor = this.gameService.getMapHeight();
    var currentCell = new CellData(this, this.gameService);
    if (currentCell.SELF > 0 && currentCell.SELF - currentCell.getFlaggedTiles().length == 0) {
      currentCell.getUnopenedTiles().forEach((item, index, arr) => {
        if (currentCell.getFlaggedTiles().indexOf(item) < 0 && Number.isNaN(this.gameService.getTileValue(item))) {
          //  console.log(`Opening X: ${this.gameService.getTileX(item)}\n Y: ${this.gameService.getTileY(item)}`)
          this.gameService.openTile(this.gameService.getTileX(item), this.gameService.getTileY(item));
          if (index === arr.length - 1) {
            this.autoSolve(0);
          }
        }
      })

    } else if (currentCell.hasMinesAround()) {
      currentCell.getUnopenedTiles().forEach((item) => {
        if (!this.gameService.isTileFlagged(item)) this.gameService.flagMine(item);
      })
    }

    setTimeout(() => {
      this.autoSolve(currentIndex + 1)
    }, 10);




  }





}
