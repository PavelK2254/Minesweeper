import { Injectable } from '@angular/core';
import { API } from './API';
import { WebsocketService } from './websocket.service';
import { Observable, Observer } from 'rxjs';
import { environment } from '../environments/environment';




@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameStatusTitle = "Game In Progress";
  autoSolveStatus: string = "Auto Solve";
  requestedLevel = 0;
  testMode = false;
  passwords = []
  tiles = [];
  busy = false;
  plainText: string;
  flaggedTileIndexes = new Array<number>();
  mineMarker = '#';
  isLost = false;
  isWon = false;
  autoSolveWorking = false;
  public rowsArray = new Array<string>();
  mapListener: Observable<string>;
  mapNotifier: any;
  okListener: Observable<string>;
  okNotifier: any;
  loseListener: Observable<string>;
  loseNotifier: any;
  public sendHelp(): void {
    this.wsService.sendMessage('help');
  }
  activeInterval: any;


  public updateLevel(level: number): void {
    this.requestedLevel = level;
    this.rowsArray.length = 0;
    this.flaggedTileIndexes.length = 0;
    this.plainText = "";
    this.wsService.sendMessage(`${API.API_NEW_LEVEL_KEYWORD} ${level}`)
    this.gameStatusTitle = "Game In Progress";
    this.isLost = false;
    this.isWon = false;
    this.getMap();
  }

  public getPlainText(): string {
    if (this.plainText) {
      this.plainText = this.plainText.replace('map:\n', '');
      if (this.flaggedTileIndexes.length > 0) {
        var plainTextArr = this.plainText.split('');
        plainTextArr.forEach((item, index, arr) => {
          if (this.flaggedTileIndexes[index]) {
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

  constructor(private wsService: WebsocketService) {
    this.wsService.initSocket(this);
    this.mapListener = new Observable(subscriber => this.mapNotifier = subscriber);
    this.okListener = new Observable(oKsubscriber => this.okNotifier = oKsubscriber);
    this.loseListener = new Observable(loseSubscriber => this.loseNotifier = loseSubscriber);
  }

  public getMapHeight(): number {
    if (this.rowsArray[0]) {
      return this.rowsArray[0].length
    } else if (this.plainText) {
      return this.getPlainText().indexOf("\n", 1);
    } else {
      return 0
    }
  }

  public getTilesArray(): Array<String> {
    if (this.getPlainText()) {
      var plainTextInfiltered = this.getPlainText();
      while (plainTextInfiltered.indexOf("\n") >= 0) {
        plainTextInfiltered = plainTextInfiltered.replace("\n", "");
      }
      return plainTextInfiltered.split('');
    } else {
      return new Array<string>(0);
    }
  }

  public openTile(tileX: number, tileY: number): void {
    if (tileX < 0) tileX = 0;
    if (tileY < 0) tileY = 0
    if (!environment.production) console.log(`open ${tileX} ${tileY}`)
    if (Number.isNaN(tileX) || Number.isNaN(tileY)) return;
    this.wsService.sendMessage(`${API.API_OPEN_COMMAND} ${tileX} ${tileY}`);
  }

  public resetGame(won: boolean): void {
    this.requestedLevel = 0;
    if (won) {
      this.gameStatusTitle = "You have Won!!!";
      this.isWon = true;
      this.autoSolveWorking = false;
      alert("Finally won!")
    } else {
      this.isLost = true;
      this.gameStatusTitle = "You lost";
      if (this.loseNotifier) this.loseNotifier.next('lost');
    }
  }

  public parseMessage(message: string): void {
    if (message.indexOf(API.API_NEW_LEVEL_KEYWORD) >= 0) {
      if (!environment.production) console.log(message)
    } else if (message.indexOf("□") >= 0) {
      this.plainText = message.trim()
      if (this.mapNotifier != undefined) {
        this.mapNotifier.next(message.trim())
      }
    } else if (message.indexOf(API.API_OPEN_COMMAND) >= 0) {
      if (this.okNotifier)
        this.okNotifier.next('ok');
      if (message.indexOf(API.API_LOST_MESSAGE) >= 0) {
        if (!environment.production) console.log(message)
        this.resetGame(false);
      } else if (message.indexOf(API.API_WON_MESSAGE) >= 0) {
        if (environment.production) console.log(message)
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

  public flagMine(index: number, compensateEmptyTiles): void {
    if (!compensateEmptyTiles) {
      if (this.requestedLevel <= 2) {
        document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.add("redBackground");
        this.flaggedTileIndexes.push(index);
      } else {
        this.flaggedTileIndexes.push(index);
      }
    } else {
      this.flaggedTileIndexes.push(index);
    }
  }

  public isTileFlagged(index: number): boolean {
    if (this.requestedLevel <= 2) {
      return document.getElementsByTagName("app-tile")[index].querySelector("mat-card").classList.contains("redBackground");
    } else {
      return this.flaggedTileIndexes.indexOf(index) >= 0;
    }

  }

  computeAutoSolve(level: number) {
    if (this.isWon) return
    if (this.isLost) {
      return
    }
    var mainProcess: any;
    var triesCounter = 0;
    if (typeof Worker !== 'undefined') {
      let gameWorker = new Worker('./game-solver.worker', { type: 'module' });
      if (triesCounter > 3) console.error('triesCounter above 3')
      this.loseListener.subscribe(lose => {
        console.log('Lost')
        this.busy = false;
        clearTimeout(mainProcess)
        if (gameWorker) {
          gameWorker.terminate();
          gameWorker = undefined
        }
        this.updateLevel(level);
        setTimeout(() => {
          this.computeAutoSolve(level)
        }, 4000);
      });
      gameWorker.onmessage = ({ data }) => {
        if (this.isWon) {
          this.autoSolveWorking = false;
          return
        }
        if (data.cmd == 'flag') {
          data.payload.forEach(element => {
            this.flagMine(element, true)
          });
        } else if (data.cmd == 'open') {
          triesCounter = 0
          if (this.isLost || this.isWon) {
            this.autoSolveWorking = false;
            return
          }
          var payload = data.payload;
          this.openTile(payload.x, payload.y)
          this.getMap();

        } else if (data.cmd == 'done') {
          var payload = data.payload;
          this.okListener.subscribe(ok => {
            if (payload.length > 0) {
              var element = payload.shift()
              this.openTile(element.x, element.y)
            } else {
              this.getMap()
            }
          })
          if (payload.length > 0) {
            var element = payload.shift()
            triesCounter = 0;
            this.openTile(element.x, element.y)
          } else {
            if (triesCounter >= 3) {
              gameWorker.postMessage([this.plainText, this.flaggedTileIndexes, true]);
              triesCounter = 0
            } else {
              triesCounter++;
              this.getMap()
            }
          }
        }
      };
      this.busy = true;
      gameWorker.postMessage([this.plainText, this.flaggedTileIndexes, false]);
      this.mapListener.subscribe(map => {
        this.plainText = map.trim();
        mainProcess = setTimeout(() => {
          if (this.autoSolveWorking && gameWorker != undefined)
            gameWorker.postMessage([this.plainText, this.flaggedTileIndexes, false]);
        }, 1000);
      })
    } else {
      alert("Error: auto solver is not avaiable");
    }
  }

  stopSolving() {
    this.autoSolveWorking = false;
    this.busy = false;
  }

}
