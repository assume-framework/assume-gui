# Assume GUI

## Start using docker
1. Make sure that assume dependecies (grafana and postgres) are up & running
2. Run `docker build -t assume_gui`
3. Run `docker run --name assume_gui-gui -p 8080:8080 --network assume_default -d assume_gui:latest`
Thats it!

## Build manually
### Prerequirements
1. Install [Assume](https://github.com/assume-framework/assume)
2. Install Fastapi using `pip install -r requirements.txt`
3. Install node.js and npm

### Start the App
1. Run `npm run build` to build the Frontend
2. Start the server with `fastapi run backend/main.py`
