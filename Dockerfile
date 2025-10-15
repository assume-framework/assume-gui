FROM node:22-alpine AS build-frontend

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm clean-install

COPY . ./

RUN npm run build


FROM python:3.12-slim AS build-backend
WORKDIR /server
RUN pip install pip-tools
COPY pyproject.toml ./pyproject.toml
RUN pip-compile --resolver=backtracking -o requirements.txt ./pyproject.toml
COPY backend /server/backend
RUN pip install --no-cache-dir -e .

COPY --from=build-frontend /frontend/dist /server/dist

ENV DATABASE_URL=postgresql://assume@assume_db:5432/assume?password=assume
EXPOSE 8080
CMD ["assume-gui"]

