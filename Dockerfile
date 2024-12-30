FROM node:22.11.0
WORKDIR /app
COPY ./ ./
RUN npm install && npm install pm2@latest -g
CMD ["pm2-runtime", "app.js"]
