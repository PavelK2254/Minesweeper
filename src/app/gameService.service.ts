import { Injectable } from '@angular/core';
import { API } from './API';
import { WebsocketService } from './websocket.service';






@Injectable({
  providedIn: 'root'
})
export class GameService {

  requestedLevel = 0;

  public rowsArray = new Array<string>();
  public sendHelp(): void {
    this.wsService.sendMessage('help');
  }

  public getNewLevel(level: number): void {
    this.requestedLevel = level;
    this.wsService.sendMessage(`${API.API_NEW_LEVEL_KEYWORD} ${level}`)
  }

  public getMap() {
    this.wsService.sendMessage(API.API_MAP_REQUEST)
  }

  parseMapData(mapData: string) {
    this.rowsArray = new Array<string>();
    this.rowsArray = mapData.split("\n");
    this.rowsArray.shift()
    this.rowsArray.pop()
    console.log(this.rowsArray.length)

  }

  constructor(private wsService: WebsocketService) {
    this.wsService.initSocket(this);
  }

public getMapHeight():number{
  return this.rowsArray.length
}

public getTilesArray():Array<String>{
  var tiles = this.rowsArray.join('');
  return tiles.split('');
}

}
