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
  REACT_APP_CLOUDINARY_CLOUD_NAME= *insert your cloud name*
  REACT_APP_CLOUDINARY_KEY= *insert your Cloudinary key*
  REACT_APP_CLOUDINARY_SECRET= *insert your Cloudinary secret*
  REACT_APP_CLOUDINARY_URL= *insert your Cloudinary URL*
  ```

### Setup Server Application

### External APIs/Services

#### Environment Variables
The client application relies on a few environment variables. Some variables will be unique to each developer/team, but we have provided a few values that we used during development, feel free to use those as well or change them to something else. Create a file called .env and add the following variables:

- The MongoDB development database connection URL that the server uses to connect to the database. For example:
  ```
  DB_CONNECTION_URL=mongodb://localhost:27017/db
  ```
- The MongoDB test database connection URL that the testing server uses. For example:
  ```
  TEST_DB_CONNECTION_URL=mongodb://localhost:27017/test
  ```
- The URL to the client application - Cross-Origin Resource Sharing (CORS). React runs on port 3000 by default
  ```
  CORS_URL=http://localhost:3000
  ```

- EMAIL STUFF
- Cloudinary variables - the values for these variables are the same as in the client .env file but the names are different
  ```
  CLOUDINARY_CLOUD_NAME= *insert your cloud name*
  CLOUDINARY_KEY= *insert your Cloudinary key*
  CLOUDINARY_SECRET= *insert your Cloudinary secret*
  ```
- [University API](http://universities.hipolabs.com/search?country=United%20Kingdom) - the API used for getting the name and domain for all the universities in the UK.
  ```
  UNIVERSITY_API=http://universities.hipolabs.com/search?country=United%20Kingdom
  ```
- [Link Preview](https://www.linkpreview.net/) URL and API key. Use the API key that you generated previously
  ```
  LINKPREVIEW_KEY= *insert your Link Preview API key*
  LINKPREVIEW_URL=http://api.linkpreview.net
  ```
- The URL of your server application. This is used for email verification. During development you can use localhost but update the variable once your server application is deployed. (Should be the same value as REACT_APP_URL in the client .env)
  ```
  DEPLOYED_URL=http://localhost:8000
  ```
## Development
### SOLID Principles

