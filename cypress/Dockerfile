FROM cypress/browsers:node-20.13.1-chrome-125.0.6422.60-1-ff-126.0-edge-125.0.2535.51-1

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx cypress verify

CMD ["npx", "cypress", "run", "--record", "false"]
# CMD ["npx", "cypress", "run", "--record"]
