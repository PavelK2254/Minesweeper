import { Injectable } from '@angular/core';
import { API } from './API';
import { WebsocketService } from './websocket.service';







@Injectable({
  providedIn: 'root'
})
export class GameService {


  gameStatusTitle = "Game In Progress";
  requestedLevel = 0;
  testMode = false;
  passwords = []
  tiles = [];
  busy = false;
  private plainText: string;
  flaggedTileIndexes = new Array<number>();
  mineMarker = '#';
  isLost = false;
  isWon = false;
  autoSolveWorking = false;
  public rowsArray = new Array<string>();
  public sendHelp(): void {
    this.wsService.sendMessage('help');
  }

  public getNewLevel(level: number): void {
    this.requestedLevel = level;
    this.rowsArray.length = 0;
    this.flaggedTileIndexes.length = 0;
    this.plainText = undefined;
    this.wsService.sendMessage(`${API.API_NEW_LEVEL_KEYWORD} ${level}`)
    this.gameStatusTitle = "Game In Progress";
    this.isLost = false;
    this.isWon = false;
    this.getMap();
  }

  public getPlainText(): string {
    if (this.plainText){
      this.plainText = this.plainText.replace('map:\n', '');
      if(this.flaggedTileIndexes.length > 0){
        var plainTextArr = this.plainText.split('');
        plainTextArr.forEach((item,index,arr) => {
          if(this.flaggedTileIndexes[index]){
            plainTextArr[this.flaggedTileIndexes[index]] = this.mineMarker;
            this.plainText = plainTextArr.join('');
          }
        })
      }
    }

    return this.plainText;
  }

  public getMap(): void {
    this.wsService.sendMessage(API.API_MAP_REQUEST)
  }

  parseMapData(mapData: string) {
    //  this.busy = true;
    this.rowsArray = mapData.split("\n");
    this.rowsArray.shift()
    this.rowsArray.pop()


  }

  constructor(private wsService: WebsocketService) {
    this.wsService.initSocket(this);
  }

  public getMapHeight(): number {
    if (this.rowsArray[0]) {
      return this.rowsArray[0].length
    } else if (this.plainText) {
      return this.getPlainText().indexOf("\n", 1)+1;
    } else {
      return 0
    }

  }



  public getTilesArray(): Array<String> {
    if(this.requestedLevel <=2){
    var tilesArr = this.rowsArray.join('');
    this.tiles = tilesArr.split('')
    if (this.testMode) console.log(`Tiles: ${this.tiles.length}`)
    return this.tiles;
  }else{
    return this.getPlainText().split('');
  }
  }

  public openTile(tileX: number, tileY: number): void {
    if (tileX < 0) tileX = 0;
    if (tileY < 0) tileY = 0
    if(this.testMode)console.log(`open ${tileX} ${tileY}`)
    if(Number.isNaN(tileX) || Number.isNaN(tileY))return;
    this.wsService.sendMessage(`${API.API_OPEN_COMMAND} ${tileX} ${tileY}`);
  }

  public resetGame(won: boolean): void {
    this.requestedLevel = 0;
    if (won) {
      this.gameStatusTitle = "You have Won!!!";
      this.isWon = true;
    } else {
      this.isLost = true;
      this.gameStatusTitle = "You lost";
    }
    this.getMap();
  }

  public parseMessage(message: string): void {
    if (message.indexOf(API.API_NEW_LEVEL_KEYWORD) >= 0) {
    if(this.testMode)  console.log(message)
    } else if (message.indexOf("□") >= 0) {
      if (this.requestedLevel <= 2) {
        this.parseMapData(message);
      } else {
        this.plainText = message.trim();
      }
    } else if (message.indexOf(API.API_OPEN_COMMAND) >= 0) {
        this.getMap()
      if (message.indexOf(API.API_LOST_MESSAGE) >= 0) {
        if(this.testMode)console.log(message)
        this.resetGame(false);
      } else if (message.indexOf(API.API_WON_MESSAGE) >= 0) {
        if(this.testMode)console.log(message)
        var password = message.split(":")[2];
        this.passwords.push(password);
        this.resetGame(true);
      }
    }
  }

  public getTileX(currentIndex: number): number {
    return currentIndex % this.getMapHeight();
  }

  public getTileY(currentIndex: number): number {
    return Math.floor(currentIndex / this.getMapHeight());
  }

  public getTileValue(index:number): number {
    if(this.requestedLevel <= 2){
      if (document.getElementsByTagName("app-tile")[index] == undefined) {
        return -1;
      } else if(document.getElementsByTagName("app-tile")[index].querySelector("p").innerText == '') {
        return Number.NaN;
      }else{
        return +document.getElementsByTagName("app-tile")[index].querySelector("p").innerText;
      }
    }else{
      if(document.getElementsByClassName("plainTextHolder")[0].innerHTML.charAt(index+1) == '' || document.getElementsByClassName("plainTextHolder")[0].innerHTML.charAt(index+1) == ' ' ||
      document.getElementsByClassName("plainTextHolder")[0].innerHTML.charAt(index+1) == '\n'){
        return -1;
      }else if (document.getElementsByClassName("plainTextHolder")[0].innerHTML.charAt(index+1) == '□'){
        return Number.NaN;
      }else{
        return +document.getElementsByClassName("plainTextHolder")[0].innerHTML.charAt(index+1)
      }

    }

  }

  public flagMine(index:number):void{
    if(this.requestedLevel <= 2){
    document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.add("redBackground");
    this.flaggedTileIndexes.push(index);
  }else{
    this.flaggedTileIndexes.push(index);
  }

  }

  public isTileFlagged(index:number):boolean {
    if(this.requestedLevel <= 2){
      return document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.contains("redBackground");
    }else{
      return this.flaggedTileIndexes.indexOf(index) >= 0;
    }

  }

  computeAutoSolve() {
    console.log("auto solve")
    if (typeof Worker !== 'undefined') {
      // Create a news
      const worker = new Worker('./game-service.worker', { type: 'module' });
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage([this.plainText,this.flaggedTileIndexes]);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

}
