import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Model1Component } from './components/model1/model1.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'modelo1',
    component: Model1Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
