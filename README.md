# DP Project

This repository contains the source code for the DP Project, consisting of a frontend and a backend.

## Structure

- `dp_fe`: Frontend application (Next.js)
- `dp_be`: Backend application (Node.js/Express)

## CI/CD

This project uses GitHub Actions for Continuous Integration.
The workflow is defined in `.github/workflows/ci.yml`.

### Frontend CI
- Runs on every push and pull request to `main`.
- Installs dependencies.
- Runs linting (`npm run lint`).
- Builds the application (`npm run build`).

### Backend CI
- Runs on every push and pull request to `main`.
- Installs dependencies.
- Runs linting (`npm run lint`).
- Runs tests (`npm test`) using a MongoDB service container.
