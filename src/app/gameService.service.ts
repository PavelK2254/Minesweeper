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
  busy = false;

  public rowsArray = new Array<string>();
  public sendHelp(): void {
    this.wsService.sendMessage('help');
  }

  public getNewLevel(level: number): void {
    this.requestedLevel = level;
    this.wsService.sendMessage(`${API.API_NEW_LEVEL_KEYWORD} ${level}`)
    this.gameStatusTitle = "Game In Progress";
    this.getMap();
  }

  public getMap() {
    this.wsService.sendMessage(API.API_MAP_REQUEST)
  }

  parseMapData(mapData: string) {
  //  this.busy = true;
    this.rowsArray = new Array<string>();
    this.rowsArray = mapData.split("\n");
    this.rowsArray.shift()
    this.rowsArray.pop()
    if(this.testMode)console.log(`Columns: ${this.rowsArray.length}`);

  }

  constructor(private wsService: WebsocketService) {
    this.wsService.initSocket(this);
  }

public getMapHeight():number{
  if(this.rowsArray[0]){
  return this.rowsArray[0].length
}else{
  return 0
}

}

public getTilesArray():Array<String>{
  var tilesArr = this.rowsArray.join('');
  var tiles = tilesArr.split('')
  if(this.testMode)console.log(`Tiles: ${tiles.length}`)
  return tiles;
}

public openTile(tileX:number,tileY:number):void{
  this.wsService.sendMessage(`open ${tileX} ${tileY}`);
}

public resetGame():void{
  this.requestedLevel = 0;
  this.gameStatusTitle = "You lost";
}

public parseMessage(message:string):void{
  console.log(message)
  if(message.indexOf("new") >= 0){

  }else if(message.indexOf("□") >= 0){
    this.parseMapData(message);
  }else if(message.indexOf("open") >= 0){
    this.wsService.sendMessage('map');
    if(message.indexOf("lose") >= 0){
      this.resetGame();
    }else if(message.indexOf("You win") >= 0){

    }
  }
}

}
