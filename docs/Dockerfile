# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies
RUN npm ci

RUN npm i -g live-server

# Copy the rest of the application code to the container
COPY . .

RUN cd dist

# Specify the command to start the Node.js app

CMD ["sh", "bin/run.sh"]