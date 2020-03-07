import { Injectable } from '@angular/core';
import {webSocket, WebSocketSubject,WebSocketSubjectConfig} from 'rxjs/webSocket';
import {API} from './API';
import {environment} from '../environments/environment';
import {GameService} from './gameService.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  WEBSOCKET_CONFIG: WebSocketSubjectConfig<any> = {
  url: environment.API_BASE_URL,
  deserializer: (e: MessageEvent) => e.data,
  serializer: (value: any) => value,
};
myWebSocket: WebSocketSubject<string> = webSocket(this.WEBSOCKET_CONFIG);
gameService:GameService;

  public initSocket(gameService:GameService):void{
    this.gameService = gameService;
    this.myWebSocket.asObservable().subscribe(
       msg => this.parseMessage(msg),
       // Called whenever there is a message from the server
       err => console.log(JSON.stringify(err)),
       // Called if WebSocket API signals some kind of error
       () => console.log('complete')
       // Called when connection is closed (for whatever reason)
    );
    this.sendMessage(API.API_TEST_MESSAGE);
  }

  public sendMessage(message:string):void{
    this.myWebSocket.next(message);
  }

  private parseMessage(message:string):void{
    if(message.indexOf("new") >= 0){

    }else if(message.indexOf("□") >= 0){
      this.gameService.parseMapData(message);
    }
  }
}
