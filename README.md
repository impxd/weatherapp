# WeatherApp

## Production URL

http://weatherapp.iamm.mp/

## Repository

https://gitlab.com/impxd/weatherapp

## Main Technologies

- Angular v16 - Web development framework.
- TypeScript v5 - A strongly typed programming language that builds on JavaScript.
- RxJS - Reactive Extensions Library for JavaScript.
- Playwright - Reliable end-to-end testing for modern web apps.

## Development enviroment

- Node.js (tested v16)
- npm
- Prettier (auto format on save) Optional

## Folder structure (src)

- `styles.scss`: Global styles including the theme colors and some component utils.
- `app/shared/services`: Weather service that abstracts the calls from different API providers
- `app/shared/utils.ts`: Some utility functions
- `app/app.config.ts`: Config for the bootstrapApplication function

## Setup

``` bash
# install node dependencies
$ npm i
```

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running end-to-end tests

Run `npm run test:e2e` or `npm run test:e2e:ui` to execute the end-to-end tests via Playwright.
