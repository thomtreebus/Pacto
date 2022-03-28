# Developer Instructions
## Software Installation
Unzip the .zip folder and open a new terminal window inside the project directory.
### Prerequisites
In order to run the application, you must have the latest stable release version of [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), [Docker](https://www.docker.com/), and [docker-compose](https://docs.docker.com/compose/). To check whether you have these  installed, run the following commands:
```
$ node -v
$ npm -v
$ docker -v
$ docker-compose -v
```

### Setup Client Application
Enter the client directory
```
$ cd client
```
Install the required packages with npm
```
$ npm install
```
#### Environment Variables
The client application relies on a few environment variables. Create a file called .env and add the following variables:

- The URL for the server application. While developing you can use localhost and choose a port to run the server application on
  ```
  REACT_APP_URL=http://localhost:8000
  ```
- [Cloudinary](https://cloudinary.com/) is for cloud image hosting. You need to create an account on Cloudinary in order to get an API key. Follow the Cloudinary [docs](https://cloudinary.com/documentation) in order to set up your account. Once an account is created, add the required variables to .env
  ```
  REACT_APP_CLOUDINARY_CLOUD_NAME
  REACT_APP_CLOUDINARY_KEY
  REACT_APP_CLOUDINARY_SECRET
  REACT_APP_CLOUDINARY_URL
  ```

### Setup Server Application
#### Environment Variables

## Development
### SOLID Principles

