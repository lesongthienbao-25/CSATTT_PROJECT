FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY src src
COPY index.html .
COPY vite.config.js .
COPY tailwind.config.js .
COPY postcss.config.js .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
