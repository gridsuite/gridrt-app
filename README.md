# GridRT

## Description

Frontend application developed with React to manage the snapshot refiner process.

This app uses the `@gridsuite/commons-ui` library released in npm packages.

User interface used to (to be completed):

- configure process;
- launch process;
- monitor processing status in real time;
- view results and logs;

`gridrt-app` consumes the REST API exposed by `snapshot-refiner-server`, manages UI state, handles navigation, and provides user interactions.

To launch the app, run:

```sh
npm install
npm start
```

If you are a developer and you want to update or enhance components used from the GridSuite `commons-ui` library, click [here](https://github.com/gridsuite/commons-ui) and follow the instructions.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Technical Stack

- React
- React Compiler
- TypeScript
- Vite
- React Router
- Redux Toolkit
- RTK Query
- React Hook Form
- Yup

## Development Scripts

- **`npm run start`** - Starts the Vite development server.
- **`npm run start:checks`** - Starts the Vite development server with checker support enabled.
- **`npm run type-check`** - Runs TypeScript type checking without emitting files. This ensures all developers use the project's local TypeScript version from `node_modules` rather than a potentially different globally-installed version. Run this to verify your code has no type errors before committing.
- **`npm run lint`** - Runs ESLint and fails on warnings.
- **`npm run lint:format`** - Checks formatting with Prettier.
- **`npm run build`** - Builds the application. This automatically runs `npm run prebuild` first.
- **`npm run prebuild`** - Runs linting and type checking before the build. This script is executed automatically by npm before `npm run build` and ensures that the build is not executed if linting or type checking fails. You do not need to call this manually unless you want to verify code quality without building.
- **`npm run test`** - Runs tests with Vitest.

### Test performance and isolation

Run the complete suite once with `npm run test:run`. Vitest pre-bundles Commons UI,
Material UI and React Router instead of repeatedly loading their dependency trees.
The optimizer cache is reused between runs; a fresh install or dependency change
adds a one-time pre-bundling cost before Vitest's reported duration starts.

Tests use one shared worker. `vitest.setup.ts` resets application modules before
each file so mocks, stores and MSW hooks are recreated, while dependencies remain
cached. It also explicitly runs React Testing Library cleanup and restores the
browser state modified by the current suite. New tests must clean up any additional
shared state they change. Test transforms use esbuild, not the app's React Compiler.

Check for order dependencies with
`npm run test:run -- --sequence.shuffle --sequence.seed 42`.
On the development machine, all 34 tests passed in 6.16 seconds wall-clock with the
optimizer cache. A cold run took 10.42 seconds (Vitest reported 4.42 seconds).

## OpenAPI Code Generation

The interface with `snapshot-refiner-server` is generated using OpenAPI code generation.
This includes hooks and types from the backend.

To do so, extract openapi.yaml from snapshot-refiner-server and run:

```sh
npm run generate:api
```

Do not manually modify generated files, as they are automatically generated and will be overwritten.

## TypeScript Config

The `tsconfig.json` file defines the application TypeScript configuration used by Vite, Vitest, ESLint, and Prettier.
Some property values have been changed to meet the project needs, such as `target`, `baseUrl`, and module resolution.

## License Headers and Dependencies Checking

To check dependencies license compatibility with this project locally, run:

```sh
npm run licenses-check
```

Notes:

- Check [license-checker-config.json](license-checker-config.json) for the license allow list and package exclusions.
  If you need to update this list, please inform the organization's owners.
- Some packages are excluded because their licenses are not correctly described in their package metadata:
    - `esprima@1.2.2`
    - `jackspeak@2.3.6`
    - `path-scurry@1.10.2`
