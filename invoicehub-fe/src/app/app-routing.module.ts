import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { ErrorComponent } from './components/error/error.component';
import { SearchComponent } from './components/search/search.component';

//all routing rules
const routes: Routes = [
  { path: '', component: InvoiceFormComponent, runGuardsAndResolvers: 'always'},
  { path: 'invoice/id/:id', component: InvoiceFormComponent },
  { path: 'invoice/search', component: SearchComponent },
  { path: 'error', component: ErrorComponent },
  {path: '**', redirectTo: '/error'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
