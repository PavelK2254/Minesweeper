/// <reference lib="webworker" />

var numOfColumns: number;
var numOfItems: number;
let flaggedTileIndexes = new Array<number>();
const emptyCell = '□';

function getTileX(currentIndex: number): number {
  return currentIndex % numOfColumns;
}

function getTileY(currentIndex: number): number {
  return Math.floor(currentIndex / numOfColumns);
}


var cell = {
  init: function(mapArray:Array<string>, index:number) {
    this.currentIndex = index;
    this.X = getTileX(this.currentIndex);
    this.Y = getTileY(this.currentIndex);

    this.UL = getTileX(this.currentIndex) == 0 || getTileY(this.currentIndex) == 0? -1 : mapArray[(this.currentIndex - numOfColumns) - 1];
    this.U =  getTileY(this.currentIndex) == 0 ? -1 : mapArray[this.currentIndex - numOfColumns];
    this.UR = getTileX(this.currentIndex) >= (numOfColumns - 1) || getTileY(this.currentIndex) == 0 ? -1 : mapArray[(this.currentIndex - numOfColumns) + 1];

    this.L = getTileX(this.currentIndex) == 0 ? -1 : mapArray[this.currentIndex - 1];
    this.SELF = mapArray[this.currentIndex]
    this.R = getTileX(this.currentIndex) >= numOfColumns - 1? -1 :  mapArray[this.currentIndex + 1];

    this.DL = getTileX(this.currentIndex) == 0 || mapArray[this.currentIndex + numOfColumns] == undefined ? -1 : mapArray[(this.currentIndex + numOfColumns) - 1];
    this.D = mapArray[this.currentIndex + numOfColumns] == undefined? -1 :mapArray[this.currentIndex + numOfColumns];
    this.DR = getTileX(this.currentIndex) >= (numOfColumns - 1) || mapArray[this.currentIndex + numOfColumns] == undefined ? -1 : mapArray[(this.currentIndex + numOfColumns) + 1];

    this.info();
  },
  isUpLegit: function(){
    return getTileY(this.currentIndex) != 0;
  },
  isLeftLegit: function(){
    return getTileX(this.currentIndex) != 0;
  },
  isRightLegit: function(){
    return this.currentIndex < numOfColumns;
  },
  info: function(){
    console.log(`X: ${this.X} Y: ${this.Y}\n
                 top: UL-${this.UL} U-${this.U} UR-${this.UR} \n
                 mid: L-${this.L} SELF-${this.SELF} R-${this.R} \n
                 bot: DL-${this.DL} D-${this.D} DR-${this.DR}`)
  },

  getSELF: function():string{
    return this.SELF;
  },

  getX: function():number{
    return this.X
  },

  getY:function():number{
    return this.Y;
  },

  sumOfUnopened: function() {
    var result: number = 0;
    result += this.UL == emptyCell ? 1 : 0;
    result += this.U == emptyCell ? 1 : 0;
    result += this.UR == emptyCell ? 1 : 0;

    result += this.L == emptyCell ? 1 : 0;
    result += this.R == emptyCell ? 1 : 0;

    result += this.DL == emptyCell ? 1 : 0;
    result += this.D == emptyCell ? 1 : 0;
    result += this.DR == emptyCell ? 1 : 0;

    //  console.log(`Sum of Unopened ${result}`)
    return result;
  },

  hasMinesAround: function() {
    return (this.sumOfUnopened() == this.SELF && this.SELF > 0);
  },

  getUnopenedTilesIndex: function(){
    var minesTiles = new Array<number>();
    if (this.UL == emptyCell) minesTiles.push((this.currentIndex - numOfColumns) - 1);
    if (this.U == emptyCell) minesTiles.push(this.currentIndex - numOfColumns);
    if (this.UR == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1)) minesTiles.push((this.currentIndex - numOfColumns) + 1);

    if (this.L == emptyCell && getTileX(this.currentIndex) != 0) minesTiles.push(this.currentIndex - 1);
    if (this.R == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1)) minesTiles.push(this.currentIndex + 1);

    if (this.DL == emptyCell && getTileX(this.currentIndex) != 0) minesTiles.push((this.currentIndex + numOfColumns) - 1);
    if (this.D == emptyCell) minesTiles.push(this.currentIndex + numOfColumns);
    if (this.DR == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1)) minesTiles.push((this.currentIndex + numOfColumns) + 1);

    return minesTiles;
  },
  getFlaggedTiles: function(){
    var flaggedTiles = new Array<number>();
    this.getUnopenedTilesIndex().forEach(item => {
      if (flaggedTileIndexes.indexOf(item) >= 0) {
        //console.log(`Flagged: X: ${this.gameService.getTileX(item)} Y: ${this.gameService.getTileY(item)}`)
        flaggedTiles.push(item)
      }
    });
    return flaggedTiles;
  }
}

addEventListener('message', ({ data }) => {
  console.log(data)
  var map: string = data[0];
  flaggedTileIndexes = data[1];
  numOfColumns = map.indexOf("\n", 2)
  numOfItems = map.lastIndexOf(emptyCell);
  while(map.indexOf("\n") >= 0){
    map = map.replace("\n","");
  }
  var mapArray = map.split("");
  solve(mapArray);
});

function solve(mapArray: Array<string>) {
  mapArray.forEach((element, index) => {
    cell.init(mapArray, index);
    var isSafeToOpenAround = cell.getSELF() != '0' && +cell.getSELF() - cell.getFlaggedTiles().length == 0
    if (isSafeToOpenAround) {
        cell.getUnopenedTilesIndex().forEach((item, index, arr) => {
          if (cell.getFlaggedTiles().indexOf(item) < 0 && cell.getSELF() == emptyCell) {
              console.log(`Open: X ${cell.getX()} Y ${cell.getY()}`)
          }
        });
    } else if(cell.hasMinesAround()){
        cell.getUnopenedTilesIndex().forEach(tile => {
          if(cell.getFlaggedTiles().indexOf(tile) < 0){
            console.log(`Flag: X ${cell.getX()} Y ${cell.getY()}`)
          }
        });
    }
  });


}
