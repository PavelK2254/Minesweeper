import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';





@Injectable({
  providedIn: 'root'
})
export class GameService {

  requestedLevel = 1;

  public sendHelp():void{
    this.wsService.sendMessage('help');
  }

  public getNewLevel(level:number):void{
    this.requestedLevel = level;
    this.wsService.sendMessage(`new ${level}`)
  }

  public getMap(){
    this.wsService.sendMessage(`map`)
  }

  constructor(private wsService:WebsocketService) {
    this.wsService.initSocket();
  }






}
