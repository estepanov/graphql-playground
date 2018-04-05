# Lesson Two

This lesson covers using GraphQL to query any external data sources. In this project it queries another api and the same fixed data from lesson one.

The secondary API in this sample is a server running [json-server](https://github.com/typicode/json-server 'json-server official GitHub repo').

We are also using [Axios](https://github.com/axios/axios 'Axios official GitHub repo') to fetch data on our express server from json-server.

## Running this example

Because this lesson in based on using our GraphQL schema to pull async data from a RESTful API we have setup a second server using json-server.
This means you will need to start two seperate servers for this example to work properly.
You can run `npm run start` or `yarn start` to begin the express server running our GraphQL implementation. This will iniate our express server tha will run GraphQL on localhost:4000.

and then you must run our json-server: `npm run json:server` or for the yarn fans `yarn json:sever`. This will initiate json-server on localhost:3000

## Usage

Once everything is installed and running you can find the GraphiQL, a developer query playground, by navigating to http://localhost:4000/graphql.

If you run the following query on GraphiQL:
`{ user(id:"23") { firstName } }`
You will see a response for a user with the firstName "bobby".

## The lessons

The resolve function of our RootQuery located in schema/schema.js is responsible for returning data given the requested parentValue and args.

### flow of data

1.  A user on a webpage makes a request to our Express server.
2.  The express server receives the request, checks if it is a request for GraphQL, if so it passes the request to the GraphQL express middleware.
3.  The express-graphql middleware will utilize our schema to locate the data.
4.  The schema will request data from our 'fake' API json-server.
5.  _Async request_ Json-server will take the request and serve the associated user data back to express-graphql server.
6.  The express-graphql server will pass the data to the user in step one.

### setting up resolve

We use [Axios](https://github.com/axios/axios 'Axios official GitHub repo') to 'fetch'
