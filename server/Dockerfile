# Pull Docker Hub base image
FROM node:16
# Set working directory
WORKDIR /usr/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Copy app to container
COPY . .
# Run the "start" script in package.json
CMD ["npm", "run", "start"]