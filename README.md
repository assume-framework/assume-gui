# Assume GUI
A simple frontend to create simulations using the ASSUME framework
## Start using docker
1. Get the `compose.yml` file
2. Run `docker compose -f compose.yml up` to start the app
Thats it!

## Build manually
### Prerequirements
1. Install node.js and npm, setup a python venv
2. Run `npm clean-install` to install frontend dependencies
3. Install backend dependencies using `pip install .`
4. (May sometimes be required)_ Use `pip install git+https://github.com/assume-framework/assume` for most recent changes of the assume framework
### Start the app in dev mode
1. Run `npm run dev` to start the frontend
2. Start the backend server with `python backend/main.py`

### Build the frontend for production
1. Run `npm run build` to build the frontend
2. Start the backend server with `python backend/main.py` (the backend will serve the built frontend)

