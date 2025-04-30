import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetterUppercase'
})
export class FirstLetterUppercasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}