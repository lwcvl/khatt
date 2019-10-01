import { Routes } from '@angular/router';

import { AnnotateComponent } from '../annotate/annotate.component';
import { AnnotateGroupedComponent } from '../annotate-grouped/annotate-grouped.component';
import { BookComponent } from '../book/book.component';
import { BooksComponent } from '../books/books.component';
import { EditManuscriptComponent } from '../edit-manuscript/edit-manuscript.component';
import { ManuscriptsComponent } from '../manuscripts/manuscripts.component';
import { MapChaptersComponent } from '../map-chapters/map-chapters.component';
import { MapBookChaptersComponent } from '../map-book-chapters/map-book-chapters.component';
import { MarkManuscriptComponent } from '../mark-manuscript/mark-manuscript.component';
import { UploadComponent } from '../upload/upload.component';

const routes: Routes = [
    {
        path: 'annotate',
        component: AnnotateComponent,
    },
    {
        path: 'annotate/grouped',
        component: AnnotateGroupedComponent,
    },
    {
        path: 'books',
        component: BooksComponent,
    },
    {
        path: 'books/edit',
        component: BookComponent,
    },
    {
        path: 'manuscripts',
        component: ManuscriptsComponent
    },
    {
        path: 'manuscripts/edit',
        component: EditManuscriptComponent
    },
    {
        path: 'map',
        component: MapChaptersComponent
    },
    {
        path: 'map/book',
        component: MapBookChaptersComponent
    },
    {
        path: 'mark-manuscript',
        component: MarkManuscriptComponent
    },
    {
        path: 'upload',
        component: UploadComponent
    },
    {
        path: '',
        redirectTo: '/books',
        pathMatch: 'full'
    }
];

export { routes };
