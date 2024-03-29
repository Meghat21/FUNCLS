
> A quiz restful api with multiple and single choice options comprising of many questions in many categories. It has a public and admin route where admin can create questions and options etc


## Requirement

> A quiz restful api with multiple and single choice options comprising of many questions in many categories. It has a public and admin route where admin can create questions and options etc.

## Features

> CRUD (Create, Read, Update And Delete)

- Authentication with JWT (Reset Password with email)
  - Login (User/Admin)
  - Register
  - Forgot Password
- Admin Routes
  - CRUD Operations questions and options
  - CRUD operations for categories
  - CRUD operations for users
- Pagination and search where necessary
- API Security (NoSQL Injections, XSS Attacks, http param pollution etc)

## API Documentation

Hosted on netlify: [Coming Soon]()

Extensive and testing documentation with postman: [Quiz API](https://documenter.getpostman.com/view/9407876/SzYW3zz8?version=latest)

## Database Model

Though the diagram uses sql data type, this diagram is to show you the various collections in the mongo database.

![Screenshot](public/quiz_entity_diagram.jpg)

## Requirement

- NodeJS
- MongoDB

## Configuration File



```ENV
NODE_ENV=development
PORT=3001

MONGO_URI=YOUR_URL

JWT_SECRET=YOUR_SECRET
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=noreply@quizapp.com
FROM_NAME=QuizzApp
```

Email testing: use mailtrap for email testing, it's easy no stress.

## Installation

Install all npm dependecies

```console
npm install
```

Install nodemon globally

```console
npm install -g nodemon
```

Run database seeder

- Seeder folder is \_data/
- Edit the seeder file if you want to

```console
node seeder -i
```

Delete all data

```console
node seeder -d
```

## Start web server

```console
node run dev
```

## License

This project is licensed under the MIT License

## Developed by Reagan Ekhameye (Tech Reagan)

Reach me on twitter [@techreagan](https://www.twitter.com/techreagan)
