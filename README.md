# TestGator — Client

The frontend for [TestGator](https://github.com/arkdevuk/testgator) — React 19 + Vite, served as a static build via
Nginx.

Full documentation — features, architecture, license, and deployment guides (Docker Swarm, Kubernetes, single-node
Docker) — lives in the main repository: **[noarkdevuk/testgator](https://github.com/arkdevuk/testgator)**. This file
only
covers running this repo locally, so it doesn't drift out of sync with the main docs.

## Local development

```bash
npm install
npm run dev
```

Needs a running `testgator_server` API to talk to — see that repo for local setup.
