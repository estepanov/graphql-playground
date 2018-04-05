# Lesson Four

This lesson addresses manipulating data with GraphQL. We will create the following mutation on the user data:

* add a user
* delete a user
* modify a user

## Running this example

Because this lesson in based on using our GraphQL schema to pull async data from a RESTful API we have setup a second server using json-server.
This means you will need to start two seperate servers for this example to work properly.
You can run `npm run start` or `yarn start` to begin the express server running our GraphQL implementation. This will iniate our express server tha will run GraphQL on localhost:4000.

and then you must run our json-server: `npm run json:server` or for the yarn fans `yarn json:sever`. This will initiate json-server on localhost:3000

### A bit more on json-server

Surprise: json-server also follows RESTful conventions for maniupulating data!

So...

* If we make a post request to http://localhost:3000/users then json-server will add a record to our users and return the added user oject.

* If we make a put request to http://localhost:3000/users/1 then json-server will completely replace information for user id of 1 with the passed object.

* If we make a patch request to http://localhost:3000/users/1 then json-server will update only the passed fields for the specified user of id 1.

_< AwkwardDetail >_
for both PUT and PATCH requests:
If we pass an id to in the object that contains the fields we want to update to the json-server, it will ignore the id field when it updates information. **So it is sage to keep the id field in the object we pass.**
_< /AwkwardDetail >_

* If we make a delete request to http://localhost:3000/users then json-server will remove a record from our users. The caveat here is that when json-server deletes some data it does not return any information about what it has deleted.

_< AwkwardDetail >_

GraphQL always expects to get some data back from a mutation. This means when we call delete on json-server from the GraphQL resolve function, GraphQL still expects some data to be returned while json-server will return null. So GraphQL will return null because of what json-server passed back to GraphQL. **In your actual implementations you can and probobably should configure your end-points to return data to better work with GraphQL.**

_< /AwkwardDetail >_

## The lessons

Prior to this lesson our GraphQL schema consisted of a single root query which would either fetch a userType or a companyType.

In this lesson we will setup mutations to have a group of very specific mutations that will be tied to a single mutations object. This is just like how we have set of queries tied to a single root query.

In our `schema/schema.js` file we first need to add a mutation variable that will be VERY similiar to the queries we created before.

```JavaScript
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // stuff will go here
  }
})
```

So you see that even the mutation is simply a GraphQLObjectType with both name and fields as keys, just like the userType, companyType, and rootQuery. The fields will contain types and resolve functions, this should all be familiar because we have seen it all before.

### Mutation to Add a User

#### Preparing the Schema File for Mutation

Every mutation will be have its own key on the fields object. The key for the object in fields should be descriptive of the mutation. So the mutation to add a user would be structured like this:

```JavaScript
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        // args go here
      },
      resolve() {}
    }
  }
})
```

The addUser field has a type, args, and resolve function. The important details here are:

* **type** is not the type of object we manipulating but the object we will be returning. In this example we are both manipulating and returning the same type. However, we could imagine a situation where we might manipulate some company but the function itself returns a user.
* **args** are the arguments that we expect to be passed when calling this specific mutation. If we want an argument to be required then we need to wrap our type with a GraphQLNonNull. GraphQLNonNull method will not valid the input other than make sure it is not null. It will not check if input is within a certain range or contains something.

```JavaScript
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve() {}
    }
  }
})
```

* **resolve** is the function that will actually perform the mutation and then return an object that matches the object type declared in type variable.

#### Writing the Mutation Query

When we query a mutation in this example we begin the query with mutation "object" and call the mutation field we want.

```GraphQL
mutation {
  addUser(firstName: "johnnie", age: 30) {
    id
    firstName
    age
  }
}
```

This sample calls addUser to create a new user with the firstName "johnnie" and age of 30. The id, firstName, and age fields that are nested inside of the adduser are the properties we want to be returned by the query. After the mutation completes we want to know the id, firstName, and age of the newly created user.

### Mutation to Delete a User

#### deleteUser Query

```GraphQL
mutation {
  deleteUser(id: "23") {
    id
  }
}
```

As described in the a bit more about json-server section on this page, GraphQL expects returned data on all mutations but json-server does not return any data on a delete request. Thus, even a successful execution of the above query will result in a returned id of null:

```JavaScript
{
  "data": {
    "deleteUser": {
      "id": null
    }
  }
}
```

Success! **HOWEVER, This is only normal behaivor because of the way json-server is structured. There is no way to tell GraphQL to expect nothing back from an query. ** If the deleteUser mutation query returned an error in GraphiQL, make sure the user id you passed is an actual user id in the `db.json` file.

### Mutation to Edit User

Now we will explain setting up the edit user mutation.

#### Schema to Edit User

we will add editUser field to the mutations GraphQLObject as such:

```JavaScript
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      // addUser object here. Full object available in schema/schema.js
    },
    deleteUser: {
      // deleteUser object here. Full object available in schema/schema.js
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios
          .patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data)
      }
    }
  }
})
```

We only wrapped the id type in GraphQLNonNull because no matter what, if we don't have a id we can not update a user according to our setup. The fields listed in args object are the different arguments that we COULD pass to editUser mutation query. For example we can optionally pass a firstName, age, or companyId but are not required to pass any of these arguments.

We can update any amount of fields so long as we pass an id as anargument in the query.

#### Query to Edit User

Lets start by looking up a user with id 1. You can see that I am asking for the firstName, age, company name, company ticker for this user.

```GraphQL
{
  user(id: "1") {
    firstName
    company {
      name
      ticker
    }
    age
  }
}
```

results in

```JavaScript
{
  "data": {
    "user": {
      "firstName": "Billinda",
      "company": {
        "name": "Google",
        "ticker": "GOOG"
      },
      "age": 29
    }
  }
}
```

Now if we want to change the age of the user id 1 to be age 30, but also request the same details we did above after:

```GraphQL
mutation {
  editUser(id: "1", age: 30) {
    id
    firstName
    age
    company {
      name
      ticker
    }
  }
}
```

results in

```JavaScript
{
  "data": {
    "editUser": {
      "id": "1",
      "firstName": "Billinda",
      "age": 30,
      "company": {
        "name": "Google",
        "ticker": "GOOG"
      }
    }
  }
}
```

If we only wanted to update the age and did not really care for most of the details to be returned after the mutation we could do:

```GraphQL
mutation {
  editUser(id: "1", age: 30) {
    id
    age
  }
}
```

this would result in

```JavaScript
{
  "data": {
    "editUser": {
      "id": "1",
      "age": 30,
    }
  }
}
```

If we want to change the firstName of user id 1 to be "Jack" and the age to be 48 we could call the mutation query:

```GraphQL
mutation {
  editUser(id: "1", name: "Jack", age: 48) {
    id
    firstName
    age
  }
}
```

this would result in the user id 1 firstName and age to change to "Jack" and 48 respectively:

```JavaScript
{
  "data": {
    "editUser": {
      "id": "1",
      "firstName": "Jack",
      "age": 48,
    }
  }
}
```
