import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spacesize'
})
export class SpacesizePipe implements PipeTransform {

  transform(value: number): string {
    if(value >999){
      return (value/1000).toFixed(2) + ' TB'
    }
    else{
      return value + ' GB';
    }
  }

}
