# Testing Report
The finished product consists of two applications: a front-end application and a server-side API. Both parts of the final application were tested separately and they each have an individual testing suite. 
## Client Testing
The front-end application was created using React. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) was used in order to test all of the components and pages. 

In order to run the automated tests, run the following command from within the server directory:
```
$ npm run test
```
## Server Testing
Server-side testing was done using the [Jest](https://testing-library.com/docs/react-testing-library/intro) JavaScript testing framework as well as [supertest](https://www.npmjs.com/package/supertest).

In order to run the automated tests, run the following command from within the server directory:
```
$ npm run test
```

## Coverage
In order to view the automated test coverage in the terminal, run the following command from within either the client or server directory:
```
$ npm run coverage
```

## Manual Testing
The vast majority of testing has been automated, however, some parts of the project could not be tested automatically. Manual testing was employed for certain parts including:

- Email verification - There was no way to automatically test that a user receives an email and is able to click on a link to verify their account.
- Page layouts - Automated testing was used to ensure a page contained all necessary components but manual testing was used to check that the layout of a page was correct. 
- Seeder - The seeder that creates fake users, pacts, posts and comments is manually tested by looking at the seeded objects via the client application or by checking the database with a tool like [MongoDB Compass](https://www.mongodb.com/products/compass).

