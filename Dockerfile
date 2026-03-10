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
RUN apt update && apt install -y git && apt clean && rm -rf /var/lib/apt/lists/*
RUN pip install git+https://github.com/assume-framework/assume
RUN pip-compile --resolver=backtracking -o requirements.txt ./pyproject.toml
COPY backend /server/backend
RUN pip install --no-cache-dir -e .

COPY --from=build-frontend /frontend/backend/static /server/backend/static

EXPOSE 9090
CMD ["assume-gui"]

