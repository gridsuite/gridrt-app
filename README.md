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
- Zod

## Development Scripts

- **`npm run start`** - Starts the Vite development server.
- **`npm run start:checks`** - Starts the Vite development server with checker support enabled.
- **`npm run type-check`** - Runs TypeScript type checking without emitting files. This ensures all developers use the project's local TypeScript version from `node_modules` rather than a potentially different globally-installed version. Run this to verify your code has no type errors before committing.
- **`npm run lint`** - Runs ESLint and fails on warnings.
- **`npm run lint:format`** - Checks formatting with Prettier.
- **`npm run build`** - Builds the application. This automatically runs `npm run prebuild` first.
- **`npm run prebuild`** - Runs linting and type checking before the build. This script is executed automatically by npm before `npm run build` and ensures that the build is not executed if linting or type checking fails. You do not need to call this manually unless you want to verify code quality without building.
- **`npm run test`** - Runs tests with Vitest.

## OpenAPI Code Generation

The interface with `snapshot-refiner-server` is generated using OpenAPI code generation.
This includes hooks and types from the backend.

To do so, extract openapi.yaml from snapshot-refiner-server and run:

```sh
npm run generate:api
```

Do not manually modify generated files, as they are automatically generated and will be overwritten.

## Code Organization

`src` is organized by ownership:

- `app`: application startup, provider composition, routing, layout, store assembly,
  themes, and translation aggregation.
- `features`: authentication, preferences, notifications, About information, and process-launch interactions. A feature
  owns its state, hooks, components, and application-specific API behavior.
- `shared`: backend transport contracts, reusable UI, utilities, and configuration
  needed across features. Shared code must not import from `app` or `features`.
- `assets`: application branding and other static assets.
- `test-utils`: isolated test stores and MSW setup.

`App.tsx` owns provider composition and the application shell. Its private components
place hooks inside the Redux, router and notification contexts they require.

Application code composes features. Features use shared code and may depend on
another feature's explicit public interface. For example, preferences reads session
availability from the authentication entry point. Avoid importing another feature's
internal selectors, storage, or components.

The application layout determines where controls appear. `ProcessActions` owns
sandbox state and the launch dialog, while `AppTopBar` provides its application
container. `AuthenticationGate` decides whether to show application content or
login UI; `useAuthentication` owns session initialization and logout integration.

The notifications feature owns WebSocket URL configuration, the snackbar bridge,
and RTK Query error reporting. `App.tsx` composes the library providers, while
preferences owns the interpretation of preference-change notifications.

The About feature owns application version/license information and backend-module
loading. Application links remain navigation integration in the layout. The About
dialog UI is supplied by `commons-ui`.

Backend API definitions live in `shared/api`, including generated endpoints.
Application-specific interpretation, persistence and cache enhancements belong to
the consuming feature: `preferences/api/preferences-api.ts` enhances the shared
configuration API. The application store registers that enhanced API. Consumers
must use public API entry points rather than importing generated files directly.

### Redux boundary

Features may import typed React Redux hooks from `app/store/hooks.ts` and use
`import type` for `RootState` or `AppDispatch` from `app/store/store.ts`. These are
explicit integration exceptions. Features must not import the runtime store or
application initialization. Application adapters receive dispatch explicitly when
needed. ESLint checks these boundaries for both absolute and relative paths.

### Names, imports and tests

Use component names for `.tsx` files and descriptive kebab-case names for hooks
and functions. Organize features by responsibility: `components`, `hooks`, `api`, `store`,
`constants`, `types`, `storage`, and `utils`, creating only the folders a feature needs.
Use relative imports within a feature or application module, and imports rooted
at `src` across boundaries. TypeScript's `baseUrl` and Vite's tsconfig-paths plugin
provide the same resolution; there is no separate `@` alias.

Group tests in a `__test__` folder beside the code they cover (for example,
`hooks/__test__/use-hook.test.ts` or `components/__test__/Component.test.tsx`).
Create these folders only when tests are present. Reuse the isolated
store and MSW helpers rather than importing the production store, except for tests
specifically checking production-store integration. Test user-visible behavior and
integration boundaries rather than incidental component implementation.

## TypeScript Config

`tsconfig.json` checks application code, API generation scripts and the TypeScript
configuration files. Vite and Vitest use the same import resolution. Run
`npm run type-check` to check these files without emitting JavaScript.

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
