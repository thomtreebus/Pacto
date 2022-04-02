# Team *Kekw* Major Group project - Pacto

## Team members

The members of the team are:

- *Kaushik Chinta*
- *Chirag Mahesh*
- *Thom Treebus*
- *Aaron Patrick (Aaron) Monte*
- *Gunamay Sachdev*
- *Koichi Ueno*
- *Krishi Wali*
- *Kieran Woolley*

<!-- *Add any further information about the team here, such as absent team members.* -->

## Project structure

The project consists of two applications. A React app that the client interacts with, and a Node.js server app that handles the backend/API. The two applications are located in separate directories.

## Deployed version of the application

The deployed version of the application can be found at [pacto.co.uk](https://pacto.co.uk).


## Access credentials for viewing different roles

The application has certain features that can only be viewed by users with a moderator role. The following credentials can be used to view the application as a user that is a moderator for one of the pacts (named the PactoPact):

**email**: pac.to@kcl.ac.uk

**password**: Password123

You can also register for an account as long as you have a valid UK university email address. 

## Video Demonstration
A video walk through of the application that demonstrates all the major features is available [here](https://www.youtube.com/watch?v=-uVKdPKAN8w).

## Installation instructions

A detailed guide on how to install the application and run it as a developer can be viewed in the [Developer Instructions](/DevInstructions.md) file (DevInstructions.md)

## Testing Report

A report about the approach to testing that was used can be viewed in the [Testing Report](/TestReport.md) file (TestReport.md)

## Credits/Sources

### Packages 

The packages used by the two applications are specified in `package.json`

### MUI (Material UI)

The majority of components and elements used in the client application were created using [MUI](https://mui.com/), a React library that uses [Material Design](https://material.io/design). These components are labelled accordingly in the files where they are directly used. Additionally, some code that is shown in the [MUI documentation](https://mui.com/getting-started/installation/) has been used, this is also labelled in the files. All React MUI components are located in the following directories:
```
client/src/components
client/src/pages
client/src/layouts
client/src/providers
```

### APIs 

The following APIs are used in the project in both the client and server application:

- [Cloudinary](https://cloudinary.com/) - Cloud based image hosting where all the images are stored (post images, avatars, etc.)
- [Dicebar Avatars](https://avatars.dicebear.com/) - The seeder uses Dicebar to generate avatars for the seeded users.
- [University API](http://universities.hipolabs.com/search?country=United%20Kingdom) - A list of all universities in the UK that includes their name and domains.
- [Link Preview](https://www.linkpreview.net/) - Returns website information including a title, description, and thumbnail from any given URL, in JSON format.

## Note

The Certbot docker instructions were partially adapted from this [blog](https://mindsers.blog/post/https-using-nginx-certbot-docker/)