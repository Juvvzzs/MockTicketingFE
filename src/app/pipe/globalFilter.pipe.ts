import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class GlobalFilterPipe implements PipeTransform {
  transform(items: any[], property: string, searchText: string): any[] {
    if (!items || !searchText || !property) {
      return items;
    }

    return items.filter(item =>
      item[property]?.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}
