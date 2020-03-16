import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../gameService.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CellConfigModule {
  UL: number; U: number; UR: number;
  L: number; SELF: number; R: number;
  DL: number; D: number; DR: number;
  shouldSkip: boolean;
  gameService: GameService;

  X: number;
  Y: number;
  currentIndex: number;
  columnCount: number;

  constructor(currentIndex: number,columnCount:number, gameService: GameService) {
    this.gameService = gameService;
    this.currentIndex = currentIndex;
    this.columnCount = columnCount;
    this.UL = this.checkUL(currentIndex, columnCount);
    //this.UL = ((currentIndex - columnCount) -1);
    this.U = this.checkU(currentIndex, columnCount);
    //this.U = (currentIndex - columnCount)
    this.UR = this.checkUR(currentIndex, columnCount);
    //this.UR = ((currentIndex - columnCount)+1)

    this.L = this.checkL(currentIndex);
    //  this.L = currentIndex - 1;
    this.SELF = gameService.getTileValue(this.currentIndex)
    this.R = this.checkR(currentIndex, columnCount);
    //this.R = currentIndex + 1;

    this.DL = this.checkDL(currentIndex, columnCount);
    //  this.DL = ((currentIndex + columnCount)-1);
    this.D = this.checkD(currentIndex, columnCount);
    //this.D = currentIndex + columnCount;
    this.DR = this.checkDR(currentIndex, columnCount);


    this.shouldSkip = Number.isNaN(this.SELF);

    this.X = gameService.getTileX(currentIndex)
    this.Y = gameService.getTileY(currentIndex)

  if(this.gameService.testMode)  console.log(`X: ${this.X} Y: ${this.Y}
      \n UL: ${this.UL} U: ${this.U} UR: ${this.UR}\n
    L: ${this.L} Self: ${this.SELF} R: ${this.R}\n
    DL: ${this.DL} D: ${this.D} DR: ${this.DR}`)
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
    return (this.sumOfUnopened() == this.SELF && this.SELF > 0);
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
