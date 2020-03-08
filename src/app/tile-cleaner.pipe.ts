import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tileCleaner'
})
export class TileCleanerPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value.replace('□', '');
  }

}
