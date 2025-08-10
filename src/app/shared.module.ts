import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FirstLetterUppercasePipe } from './pipe/first-letter-uppercase.pipe';
import { GlobalFilterPipe } from './pipe/globalFilter.pipe';
import { TruncatePipe } from 'src/app/pipe/truncate.pipe';

@NgModule({
  
  imports: [  
    FirstLetterUppercasePipe,
    TruncatePipe,
    GlobalFilterPipe,
  ],
  exports: [
    FirstLetterUppercasePipe,
    TruncatePipe,
    GlobalFilterPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class SharedModule { }
