FROM node:16
WORKDIR /home/huubinh49/Projects/dating_webapp/server
# rather than copying the entire working directory, we are only copying the package.json file. This allows us to take advantage of cached Docker layers.
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
EXPOSE 5000
CMD [ "node", "index.js" ]