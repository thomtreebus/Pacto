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

The project consists of two applications. A React app that the client interacts with, and a Node.js server app that handles the backend/API.

## Deployed version of the application

The deployed version of the application can be found at [pacto.co.uk](http://pacto.co.uk:3000).

## Access credentials for viewing different roles

The application has certain features that can only be viewed by users with a moderator role. The following credentials can be used to view the application as a user that is a moderator for one of the pacts (named the PactoPact):

**email**: pac.to@kcl.ac.uk
**password**: Password123

You can also register for an account as long as you have a valid UK university email address. 

## Installation instructions

A detailed guide on how to install the application and run it as a developer can be viewed in the [Developer Instructions](/DevInstructions.md) file (DevInstructions.md)

## Credits/Sources

### Packages 

The packages used by the two applications are specified in `package.json`

### MUI (Material UI)

The majority of components and elements used in the client application were created using [MUI](https://mui.com/), a React library that uses [Material Design](https://material.io/design). These components are labelled accordingly in the files where they are directly used. Additionaly, some code that is shown in the [MUI documentation](https://mui.com/getting-started/installation/) has been used, this is also labelled in the files. All React MUI components are located in the following directories:
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
