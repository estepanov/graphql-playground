# Lesson Three

This lesson covers using GraphQL to combine data

## Running this example

Because this lesson in based on using our GraphQL schema to pull async data from a RESTful API we have setup a second server using json-server.
This means you will need to start two seperate servers for this example to work properly.
You can run `npm run start` or `yarn start` to begin the express server running our GraphQL implementation. This will iniate our express server tha will run GraphQL on localhost:4000.

and then you must run our json-server: `npm run json:server` or for the yarn fans `yarn json:sever`. This will initiate json-server on localhost:3000

### A bit more on json-server

In this lesson we have added some data to our `db.json` and json-server will automatically create nested RESTful routes to fetch associated data. So if before we could see users by navigating to http://localhost:3000/users, now we can see users associated with a specific company by navigating to http://localhost:3000/companies/1/users.

## The lessons

If you examine the schema file located in the `schema/schema.js` and the `db.json` you will see that we have added a list of companies and associated users with those companies.

In this lesson we added the ability to query companies individually and query users associtaed with companies or vice-versa.

Running the following comand in GraphiQL should result in a user obj being returned that contains the users first name and company id, name, and ticker.

```GraphQL
{
  user(id:"23") {
    firstName
    company {
      id
      name
      ticker
    }
  }
}
```

Running :

```GraphQL
{
  company(id:"3") {
    name
    users {
      firstName
    }
  }
}
```

will now also fetch the company name and associated users where id = 1.

### Note on GraphQL queries

1.  Queries can be named. If a query will be refrenced multiple times it might be best to name it so you can refrence it. For example the following is a query named fetchNames to get all user's names:

```GraphQL
query fetchName {
  user(id:"1" ) {
    firstName
  }
}
```

2.  Queries can only request the same resource once, unless they name the results.
    For example:

```GraphQL
{
  user(id:"1" ) {
    firstName
  }
  user(id:"2" ) {
    firstName
  }
}
```

The query above asks for two users, but would return an error:

```Javascript
{
  "errors": [
    {
      "message": "Fields \"user\" conflict because they have differing arguments. Use different aliases on the fields to fetch both if this was intentional.",
      "locations": [
        {
          "line": 57,
          "column": 1
        },
        {
          "line": 60,
          "column": 3
        }
      ]
    }
  ]
}
```

If the request for user with id 2 was removed:

```GraphQL
{
  user(id:"1" ) {
    firstName
  }
}
```

it would work, and we would see the following response object:

```Javascript
{
  "data": {
    "user": {
      "firstName": "Bob"
    }
  }
}
```

The response object would need to have two keys named user with different values for the same keys. But if we wanted to keep both the requests we would need to assign the results of the same requested resource to different names:

```GraphQL
{
  bob: user(id:"2" ) {
    firstName
  }
  billinda: user(id:"1" ) {
    firstName
  }
}
```

Here we named the result of user id:"2" to be called bob and the result of user id:"1" to be billinda.

The result object returned by the query is:

```JavaScript
{
  "data": {
    "bob": {
      "firstName": "Bob"
    },
    "billinda": {
      "firstName": "Billinda"
    }
  }
}
```

In our prior examples if query a single user the return object just lists the result under the user key. Now the results are listed under the individually named "bob" and "billinda".

We did not have to name both, only one since we are only reuestig the resource twice.

3.  Query Fragments: Is a list of different properties that we want access to. This is most useful in the examples above when using GraphQL on the front-end. Remeber we listed the same properties for both "bob" and "billinda"?

```GraphQL
{
  bob: user(id:"2" ) {
    firstName
    age
  }
  billinda: user(id:"1" ) {
    firstName
    age
  }
}
```

Well here I added age for the sake of a sample. We have both firstName and age listed twice because we want the same information from both.

To use fragments we frist need to define a fragment:

```GraphQL
fragment userDetails on User {
  firstName
  age
}
```

then we append the fragment to the end of our query. And finally to use the fragment we do something that is similiar to object destructing in JavaScript:

```GraphQL
{
  bob: user(id:"2" ) {
    ...userDetails
  }
  billinda: user(id:"1" ) {
    ...userDetails
  }
}
```

and so our final fragement query will look like:

```GraphQL
{
  bob: user(id:"2" ) {
    ...userDetails
  }
  billinda: user(id:"1" ) {
    ...userDetails
  }
}

fragment userDetails on User {
  firstName
  age
}
```
