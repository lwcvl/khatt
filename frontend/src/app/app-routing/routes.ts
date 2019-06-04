import { Routes } from "@angular/router";
import { BookComponent } from '../book/book.component';
import { BooksComponent } from '../books/books.component';
import { UploadComponent } from '../upload/upload.component';
import { ManuscriptsComponent } from '../manuscripts/manuscripts.component';
import { MarkManuscriptComponent } from '../mark-manuscript/mark-manuscript.component';

const routes: Routes = [
  {
    path: 'upload',
    component: UploadComponent
  },
  {
    path: 'book',
    component: BookComponent,
  },
  {
    path: 'books',
    component: BooksComponent,
  },
  {
    path: 'manuscripts',
    component: ManuscriptsComponent
  },
  {
    path: 'mark-manuscript',
    component: MarkManuscriptComponent
  },
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  }
];

export { routes }
