FROM node:22-alpine AS build-frontend

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm clean-install

COPY . ./

RUN npm run build


FROM python:3.12-slim AS build-backend
WORKDIR /backend
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir --upgrade -r /requirements.txt
COPY backend /backend

COPY --from=build-frontend /frontend/dist /backend/dist

ENV DATABASE_URL=postgresql://assume@assume_db:5432/assume?password=assume
EXPOSE 8080
CMD ["fastapi", "run", "main.py", "--port", "8080"]

