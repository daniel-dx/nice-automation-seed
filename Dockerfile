# Prebuilt MS image
FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY tests ./tests
COPY report ./report
COPY env.js ./
COPY global-setup.js ./
COPY local-env.js ./
COPY playwright.config.js ./
COPY utils.js ./

CMD npm run test:dev; cd report; node index.js