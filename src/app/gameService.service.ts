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

  public rowsArray = new Array<string>();
  public sendHelp(): void {
    this.wsService.sendMessage('help');
  }

  public getNewLevel(level: number): void {
    this.requestedLevel = level;
    this.rowsArray.length = 0;
    this.plainText = undefined;
    this.wsService.sendMessage(`${API.API_NEW_LEVEL_KEYWORD} ${level}`)
    this.gameStatusTitle = "Game In Progress";
    this.getMap();
  }

  public getPlainText(): string {
    if (this.plainText)
      this.plainText = this.plainText.replace('map:\n', '');
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
    if (this.testMode) console.log(`Columns: ${this.rowsArray.length}`);

  }

  constructor(private wsService: WebsocketService) {
    this.wsService.initSocket(this);
  }

  public getMapHeight(): number {
    if (this.rowsArray[0]) {
      return this.rowsArray[0].length
    } else if (this.plainText) {
      return this.plainText.indexOf("\n", 1);
    } else {
      return 0
    }

  }



  public getTilesArray(): Array<String> {
    var tilesArr = this.rowsArray.join('');
    this.tiles = tilesArr.split('')
    if (this.testMode) console.log(`Tiles: ${this.tiles.length}`)
    return this.tiles;
  }

  public openTile(tileX: number, tileY: number): void {
    if (tileX < 0) tileX = 0;
    if (tileY < 0) tileY = 0
    console.log(`open ${tileX} ${tileY}`)
    if(Number.isNaN(tileX) || Number.isNaN(tileY))return;
    this.wsService.sendMessage(`open ${tileX} ${tileY}`);
  }

  public resetGame(won: boolean): void {
    this.requestedLevel = 0;
    if (won) {
      this.gameStatusTitle = "You have Won!!!";
    } else {
      this.gameStatusTitle = "You lost";
    }

  }

  public parseMessage(message: string): void {
    if (message.indexOf("new") >= 0) {
      console.log(message)
    } else if (message.indexOf("□") >= 0) {
      if (this.requestedLevel <= 2) {
        this.parseMapData(message);
      } else {
        this.plainText = message.trim();
      }
    } else if (message.indexOf("open") >= 0) {
        this.getMap()
      if (message.indexOf("lose") >= 0) {
        console.log(message)
        this.resetGame(false);
      } else if (message.indexOf("You win") >= 0) {
        console.log(message)
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
    if (document.getElementsByTagName("app-tile")[index] == undefined) {
      return -1;
    } else if(document.getElementsByTagName("app-tile")[index].querySelector("p").innerText == '') {
      return Number.NaN;
    }else{
      return +document.getElementsByTagName("app-tile")[index].querySelector("p").innerText;
    }
  }

  public flagMine(index:number):void{
    document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.add("redBackground");
  }

  public isTileFlagged(index:number):boolean {
    return document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.contains("redBackground");
  }



}
