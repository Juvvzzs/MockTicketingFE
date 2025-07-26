import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 50): string {
    if (!value) return '';
    
    // Check if the length of the string exceeds the maxLength
    if (value.length > maxLength) {
      // Truncate the string and add an ellipsis (...) at the end
      return value.substring(0, maxLength) + '...';
    } else {
      return value;
    }
  }
}