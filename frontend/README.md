# TO RUN
- Install [Node](https://nodejs.org/en/), [Yarn](https://classic.yarnpkg.com/en/docs/install), [PostgreSQL](https://www.postgresql.org/) and  [Python 3.6](https://www.python.org/downloads/) on your computer.
- Start PostgreSQL
- To keep your Python packages isolated, install [virtualenv] (https://virtualenv.pypa.io/en/stable/installation.html)
- Download this directory (using git clone or downloading a zip and extracting it)
- Navigate to `{name-of-topdirectory}/backend`
- Run `python bootstrap.py`
- Follow the instructions of the script: setting up a virtual environment, creating the database, creating a superuser
- Enable your virtual environment (in the typical case, by running `source activate .env`)
- Run `pip install -r requirements.txt`. This will take a while.
- Navigate to `{name-of-topdirectory}`
- Run `yarn install`. This will take a while.
- Run `yarn start`. This will start the server.
- Open your browser. At `localhost:8000`, you should be able to see the application.
- As there are no books in the database yet, create them. Navigate to `localhost:8000/api/books/` (NB: don't omit the last slash!)
- There is a form at the bottom of the page which allows you to define a book with title and author.
- Go to `localhost:8000/upload` to upload a manuscript page for the book (for now: .jpg, .png only).
- Start marking and annotating
- To download, go to `localhost:8000/download`. By clicking the download link, you will get *all* annotations in the database which have been marked as complete, with information about the associated book, manuscript and page.

# FOR DEVELOPERS

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. This will not start the backend, to developing with a functioning backend use `yarn start` from the project root instead. Navigate to `http://localhost:8000/`, which will forward to the frontend.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
