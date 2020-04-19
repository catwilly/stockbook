import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../model/utils';

@Pipe({name: 'money2d'})
export class Momey2dPipe implements PipeTransform {
  transform(value: number): string {
    
    let str = Utils.toMoneyNumber(value, 2);
    
    return str;
  }
}

@Pipe({name: 'money3d'})
export class Momey3dPipe implements PipeTransform {
  transform(value: number): string {
    
    let str = Utils.toMoneyNumber(value, 2);
    
    return str;
  }
}
