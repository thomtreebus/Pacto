# Pacto Developer Instructions
## Table of Contents
- [Pacto Developer Instructions](#pacto-developer-instructions)
  - [Table of Contents](#table-of-contents)
  - [Software Installation](#software-installation)
    - [1. Prerequisites](#1-prerequisites)
    - [2. Register for APIs](#2-register-for-apis)
      - [**Cloudinary**](#cloudinary)
      - [**Link Preview**](#link-preview)
      - [**University API**](#university-api)
    - [3. Setup Server Application](#3-setup-server-application)
      - [**Environment Variables**](#environment-variables)
      - [**Start Application**](#start-application)
    - [4. Setup Client Application](#4-setup-client-application)
      - [**Environment Variables**](#environment-variables-1)
      - [**Start Application**](#start-application-1)
  - [Development](#development)
    - [Test-Driven Development](#test-driven-development)
    - [SOLID Principles](#solid-principles)
      - [**Single Responsibility Principle**](#single-responsibility-principle)
      - [**Open-CLosed Principle**](#open-closed-principle)
      - [**Liskov Substitution Principle**](#liskov-substitution-principle)
      - [**Interface Segregation Principle**](#interface-segregation-principle)
      - [**Dependency Inversion Principle**](#dependency-inversion-principle)
## Software Installation
Unzip the .zip folder and open a new terminal window inside the project directory.
### 1. Prerequisites
In order to run the application, you must have the latest stable release version (note: future versions might not work with the versions that were used during development) of [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), [Docker](https://www.docker.com/), and [docker-compose](https://docs.docker.com/compose/). To check whether you have these  installed, run the following commands:
```
$ node -v
$ npm -v
$ docker -v
$ docker-compose -v
```
### 2. Register for APIs
Both the client and server applications utilize a few APIs. Some of these require creating an account and registering for an API key. It is important to do this before completing the rest of the setup.

#### **Cloudinary**
[Cloudinary](https://cloudinary.com/) is for cloud image hosting. You need to create an account on Cloudinary in order to get an API key. Follow the Cloudinary [docs](https://cloudinary.com/documentation) in order to set up your account. Once you have an account you will see the following values:
<p align="center">
  <a href="cloudinary" rel="noopener sponsored" target="_blank"><img src="https://i.imgur.com/breMIms.png" alt="cloudinary" title="Cloudinary Account" loading="lazy" /></a>
</p>
You will need to add these variables as environment variables in a later step.

<p></p>

#### **Link Preview**
[Link Preview](https://www.linkpreview.net/) is an API used to get website information from any given URL, in JSON format. It returns a title, thumbnail and short description of the website that a URL leads to and is used to show a small preview of a link in the client application.

Use the Link Preview [documentation](https://docs.linkpreview.net/) instructions to sign up for an API key. Once you have an account, you will be shown your API key:

<p align="center">
  <a href="cloudinary" rel="noopener sponsored" target="_blank"><img src="https://i.imgur.com/8QWqHKV.png" alt="cloudinary" title="Cloudinary Account" loading="lazy" /></a>
</p>
You will need to add this API key as an environment variable in a later step.

<p></p>

#### **University API**
The [University API](http://universities.hipolabs.com/search?country=United%20Kingdom) is a simple API that returns a university's name and domain name for any given UK university. It is used in the server application for email verification to determine if a user has a valid university email adress. There is no registration required to use this API.

### 3. Setup Server Application

#### **Environment Variables**
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
- [Cloudinary](https://cloudinary.com/) variables - add the Cloudinary values that you got when registering for an account
  ```
  CLOUDINARY_CLOUD_NAME= *insert your cloud name*
  CLOUDINARY_KEY= *insert your Cloudinary key*
  CLOUDINARY_SECRET= *insert your Cloudinary secret*
  ```
- [University API](http://universities.hipolabs.com/search?country=United%20Kingdom) URL - Add the URL for the University API as shown below:
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
#### **Start Application**
Before running the server application, you need to start the database 
```
$ npm run dbstart
```
If that doesn't run try running the same command with sudo
```
$ sudo run npm dbstart
```
Once the database is running, you can star the application
```
$ npm run start
```

### 4. Setup Client Application

#### **Environment Variables**
The server application relies on a few environment variables. Create a file called .env and add the following variables:

- The URL for the server application. While developing you can use localhost and choose a port to run the server application on
  ```
  REACT_APP_URL=http://localhost:8000
  ```
-  The Cloudinary variables need to be added to the client .env file as well. The values should be the same as in the server .env file but the variable names must include the REACT_APP_ prefix
    ```
    REACT_APP_CLOUDINARY_CLOUD_NAME= *insert your cloud name*
    REACT_APP_CLOUDINARY_KEY= *insert your Cloudinary key*
    REACT_APP_CLOUDINARY_SECRET= *insert your Cloudinary secret*
    REACT_APP_CLOUDINARY_URL= *insert your Cloudinary URL*
    ```

#### **Start Application**
Enter the client directory
```
$ cd client
```
Install the required packages with npm
```
$ npm install
```
Run the application
```
$ npm run start
```
Once the client application starts to run, a new tab will open and show the React app.

## Development
### Test-Driven Development

### SOLID Principles
#### **Single Responsibility Principle**
In the client application, each component is solely responsible for displaying data and changing the UI when there is a change in state. Any interaction with the database is done by making requests to the server application. Most elements are contained within their own component that can be reused by other components. 

In the server application, each file, or function has a sole responsibility. Routes are used to describe different API endpoints and calling the appropriate controller. Controllers perform a single CRUD operation. Various helpers/middleware are used for other specific purposes. By ensuring everything is responsible for one job, code becomes more reusable and easier to maintain. 

#### **Open-CLosed Principle**

#### **Liskov Substitution Principle**
The application currently doesn't rely on inheritance as React is by nature, a functional framework. The majority of the server application uses a functional programming approach. Therefore it is very rare for a class to have child classes.
#### **Interface Segregation Principle**
In the client application,pages only depend on components that it displays/uses. At the top of each file, only the required functions/components are imported in order to ensure that interfaces are segregated from each other. The server application will throw an error if there are any unused imports at the top of a file.
#### **Dependency Inversion Principle**
Abstractions are used rather than concretions in order to make code cleaner and more reusable. When creating new functions and classes, try to decouple them as much as possible.
