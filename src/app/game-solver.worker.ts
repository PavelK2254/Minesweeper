/// <reference lib="webworker" />

var numOfColumns: number;
var numOfItems: number;
let flaggedTileIndexes = new Array<number>();
const emptyCell = '□';
const mine = '#'

function getTileX(currentIndex: number): number {
  return currentIndex % numOfColumns;
}

function getTileY(currentIndex: number): number {
  return Math.floor(currentIndex / numOfColumns);
}

var leastMineProbability = {
  index: 0,
  openedCount: 0
}


var cell = {
  init: function(mapArray: Array<string>, index: number) {
    this.currentIndex = index;
    this.X = getTileX(this.currentIndex);
    this.Y = getTileY(this.currentIndex);

    this.UL = getTileX(this.currentIndex) == 0 || getTileY(this.currentIndex) == 0 ? -1 : mapArray[(this.currentIndex - numOfColumns) - 1];
    this.U = getTileY(this.currentIndex) == 0 ? -1 : mapArray[this.currentIndex - numOfColumns];
    this.UR = getTileX(this.currentIndex) >= (numOfColumns - 1) || getTileY(this.currentIndex) == 0 ? -1 : mapArray[(this.currentIndex - numOfColumns) + 1];

    this.L = getTileX(this.currentIndex) == 0 ? -1 : mapArray[this.currentIndex - 1];
    this.SELF = mapArray[this.currentIndex]
    this.R = getTileX(this.currentIndex) >= numOfColumns - 1 ? -1 : mapArray[this.currentIndex + 1];

    this.DL = getTileX(this.currentIndex) == 0 || mapArray[this.currentIndex + numOfColumns] == undefined ? -1 : mapArray[(this.currentIndex + numOfColumns) - 1];
    this.D = mapArray[this.currentIndex + numOfColumns] == undefined ? -1 : mapArray[this.currentIndex + numOfColumns];
    this.DR = getTileX(this.currentIndex) >= (numOfColumns - 1) || mapArray[this.currentIndex + numOfColumns] == undefined ? -1 : mapArray[(this.currentIndex + numOfColumns) + 1];

  },
  isUpLegit: function() {
    return getTileY(this.currentIndex) != 0;
  },
  isLeftLegit: function() {
    return getTileX(this.currentIndex) != 0;
  },
  isRightLegit: function() {
    return this.currentIndex < numOfColumns;
  },
  info: function() {
    console.log(`X: ${this.X} Y: ${this.Y}\n
                 top: UL-${this.UL} U-${this.U} UR-${this.UR} \n
                 mid: L-${this.L} SELF-${this.SELF} R-${this.R} \n
                 bot: DL-${this.DL} D-${this.D} DR-${this.DR}`)
  },

  getSELF: function(): string {
    return this.SELF;
  },

  getX: function(): number {
    return this.X
  },

  getY: function(): number {
    return this.Y;
  },

  sumOfUnopened: function() {
    var result: number = 0;
    result += this.UL == emptyCell || this.UL == mine ? 1 : 0;
    result += this.U == emptyCell || this.U == mine ? 1 : 0;
    result += this.UR == emptyCell || this.UR == mine ? 1 : 0;

    result += this.L == emptyCell || this.L == mine ? 1 : 0;
    result += this.R == emptyCell || this.R == mine ? 1 : 0;

    result += this.DL == emptyCell || this.DL == mine ? 1 : 0;
    result += this.D == emptyCell || this.D == mine ? 1 : 0;
    result += this.DR == emptyCell || this.DR == mine ? 1 : 0;

    return result;
  },

  hasMinesAround: function() {
    return (this.sumOfUnopened() == this.SELF && this.SELF > 0);
  },

  getUnopenedTilesIndex: function() {
    var minesTiles = new Array<number>();
    if (this.UL == emptyCell || this.UL == mine) minesTiles.push((this.currentIndex - numOfColumns) - 1);
    if (this.U == emptyCell || this.U == mine) minesTiles.push(this.currentIndex - numOfColumns);
    if (this.UR == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1) || this.UR == mine) minesTiles.push((this.currentIndex - numOfColumns) + 1);

    if (this.L == emptyCell && getTileX(this.currentIndex) != 0 || this.L == mine) minesTiles.push(this.currentIndex - 1);
    if (this.R == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1) || this.R == mine) minesTiles.push(this.currentIndex + 1);

    if (this.DL == emptyCell && getTileX(this.currentIndex) != 0 || this.DL == mine) minesTiles.push((this.currentIndex + numOfColumns) - 1);
    if (this.D == emptyCell || this.D == mine) minesTiles.push(this.currentIndex + numOfColumns);
    if (this.DR == emptyCell && getTileX(this.currentIndex) < (numOfColumns - 1) || this.DR == mine) minesTiles.push((this.currentIndex + numOfColumns) + 1);

    return minesTiles;
  },
  getFlaggedTiles: function() {
    var flaggedTiles = new Array<number>();
    this.getUnopenedTilesIndex().forEach(item => {
      if (flaggedTileIndexes.indexOf(item + getTileY(item)) >= 0) {
        flaggedTiles.push(item)
      }
    });
    return flaggedTiles;
  }
}

function hasNumber(myString) {
  return /\d/.test(myString);
}

addEventListener('message', ({ data }) => {
  var map: string = data[0];
  flaggedTileIndexes = data[1];
  var startGuessting = data[2];
  if (map != undefined) {
    numOfColumns = map.indexOf("\n", 2)
    numOfItems = map.lastIndexOf(emptyCell);
    while (map.indexOf("\n") >= 0) {
      map = map.replace("\n", "");
    }
    var mapArray = map.split("");
    leastMineProbability.index = 0
    leastMineProbability.openedCount = 0
    if (startGuessting) {
      if (hasNumber(mapArray)) {
        predict(mapArray)
      } else {
        openRandom(mapArray)
      }
    } else {
      solve(mapArray);
    }
  } else {
    postMessage({ 'cmd': 'done', 'payload': new Array() })
  }
});

function solve(mapArray: Array<string>) {
  var tilesToOpen = new Array<object>();
  mapArray.forEach((element, index, arr) => {
    cell.init(mapArray, index);
    var isSafeToOpenAround = cell.getSELF() != '0' && +cell.getSELF() - cell.getFlaggedTiles().length == 0;
    if (isSafeToOpenAround) {
      cell.getUnopenedTilesIndex().forEach((item, index, arr) => {
        if (cell.getFlaggedTiles().indexOf(item) < 0) {
          var tile = {
            x: getTileX(item),
            y: getTileY(item)
          }
          tilesToOpen.push(tile);
        }
      });
    } else if (cell.hasMinesAround()) {
      var flagTiles = new Array<number>();
      cell.getUnopenedTilesIndex().forEach(tile => {
        if (cell.getFlaggedTiles().indexOf(tile) < 0) {
          flagTiles.push(tile + getTileY(tile))
        }
      });
      postMessage({ 'cmd': 'flag', 'payload': flagTiles })
    } else if (index == arr.length - 1) {
      postMessage({ 'cmd': 'done', 'payload': tilesToOpen })
      tilesToOpen.length = 0
    }
  });
}

function predict(mapArray: Array<string>) {
  mapArray.forEach((element, index, arr) => {
    cell.init(mapArray, index);
    if (+cell.getSELF() > 0 && (cell.getUnopenedTilesIndex().length - cell.getFlaggedTiles().length) > +cell.getSELF()) {
      leastMineProbability.index = index
      leastMineProbability.openedCount = cell.getUnopenedTilesIndex().length - cell.getFlaggedTiles().length - parseInt(cell.getSELF());
    }
  });
  cell.init(mapArray, leastMineProbability.index)
  var possibleTiles = new Array<number>();
  cell.getUnopenedTilesIndex().forEach(element => {
    if (cell.getFlaggedTiles().indexOf(element)) {
      possibleTiles.push(element);
    }
  });
  var winningIndex = possibleTiles[Math.floor(Math.random() * possibleTiles.length)]
  var tile = {
    x: getTileX(winningIndex),
    y: getTileY(winningIndex)
  }
  postMessage({ 'cmd': 'open', 'payload': tile })
}

function openRandom(mapArray: Array<string>) {
  var randomIndex = Math.floor(Math.random() * mapArray.length - 1)
  var tile = {
    x: getTileX(randomIndex),
    y: getTileY(randomIndex)
  }
  postMessage({ 'cmd': 'open', 'payload': tile })
}
