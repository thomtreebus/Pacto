# Testing Report
This report explains the various activities performed as part of testing the Major Group Project application.

The finished product, Pacto, is a social networking application aimed at students attending universities in the United Kingdom. Pacto consists of two applications: a front-end client application and a server-side API. Both parts of the final application were tested separately and they each have an individual testing suite. 

## Testing Scope
- **In-Scope**: Functional testing for all features including user-facing and server-side functionality
  - Authentication
  - User Profiles
  - Pacts
  - Posts/Comments
  - Friends
  - Notifications
  - Search
  
  Running development application on different operating systems (Windows, macOS, Linux)
  
  User Acceptance Testing (UAT) - Ensure that  software solves the problem initially set out to solve
- **Out of Scope**: Performance testing was not done for this application. This includes measuring loading times and operating under heavy loads (large number of users, frequent requests, etc.). It was not possible to test the system for performance due to the limitations of certain third party services that are used (ex. free APIs with limited number of requests/bandwidth allowed).

End-to-end testing was not done as the client and server application were both tested separately. 

## Metrics
|        | Test Cases Executed | Test Cases Passed | Code Coverage |
|--------|---------------------|-------------------|---------------|
| Client | 374                 | 374               | 99.34%        |
| Server | 302                 | 302               | 97.20%        |

## Client Testing
The client application was created using [React](https://reactjs.org/) and automated testing was done using [Jest](https://testing-library.com/docs/react-testing-library/intro). [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) was used in order to test all the components and pages. 

In order to run the automated tests, run the following command from within the client directory:
```
$ npm run test
```

Server requests were mocked in order to test the client interaction with the server application. Although we thoroughly tested the server application, testing for the interaction between the client and server was not automated.

## Server Testing
The server application was created using [Node.js](https://nodejs.org/en/). Server-side testing was done using the [Jest](https://testing-library.com/docs/react-testing-library/intro) JavaScript testing framework as well as [supertest](https://www.npmjs.com/package/supertest).

In order to run the automated tests, run the following command from within the server directory:
```
$ npm run test
```

## Coverage
In order to view the automated test coverage in the terminal, run the following command from within either the client or server directory:
```
$ npm run coverage
```
Running coverage will create a new directory (within the directory that coverage was run in) called `coverage`. Within this directory, a html report is created that shows the test coverage in detail. The report is located at `/coverage/lcov-report/index.html`

The coverage for the client application currently looks like this:
<p>
  <a href="coverage" rel="noopener sponsored" target="_blank"><img src="https://i.imgur.com/k2052tP.png" alt="coverage" title="Client Test Coverage" loading="lazy" /></a>
</p>

The coverage for the server application currently looks like this:
<p>
  <a href="coverage" rel="noopener sponsored" target="_blank"><img src="https://i.imgur.com/HcxO7R3.png" alt="coverage" title="Server Test Coverage" loading="lazy" /></a>
</p>

## Manual Testing
The vast majority of testing has been automated, however, some parts of the project could not be tested automatically. Manual testing was employed for certain parts including:

- Email verification - There was no way to automatically test that a user receives an email and is able to click on a link to verify their account. Manual testing was used to check two important features. First a user should receive an email containing a verification code sent to the email address they used to register for an account. Secondly, a user should be able to use the verification code to verify that they are a student and activate their account. Both these steps were done manually by checking our own inbox (or spam folder) and using the link to create a new account. The verification email that a user receives looks like this: 
<p>
  <a href="email" rel="noopener sponsored" target="_blank"><img src="https://i.imgur.com/YfPlrF2.png" alt="email" title="Verification Email" loading="lazy" /></a>
</p>
  
- Seeder - The seeder that creates fake users, pacts, posts and comments is manually tested by looking at the seeded objects via the client application or by checking the database with a tool like [MongoDB Compass](https://www.mongodb.com/products/compass). First we would confirm that the `unseed` command would delete all database pages, and then we would check that the `seed` command created new objects.

- Page layouts - Automated testing was used to ensure a page contained all necessary components but manual testing was used to check that the layout of a page was correct. 

- Different screen sizes - Testing how the application looks/behaves on different screen sizes was done manually using [PolyPane](https://polypane.app/), an application that lets you view an app in multiple different screen sizes at the same time. We used PolyPane to view the client on different types of screens ranging from small mobile screens all the way up to 4k monitors. Each page of the user interface was tested manually on different screen sizes to ensure that the components displayed correctly and behaved as expected.

- Collapsible components - The React Testing Library is unable to set the screen size or height of a component which means we were unable to automate the testing of collapsible components. Some components would change depending on the size of the component (large text bodies would be collapsible, etc.) and this had to be tested manually. We would test this manually by for example, creating a post with a very long text body and making sure the post would not show all the text and instead show the first few lines and then an option to expand the text to reveal it entirely. 

