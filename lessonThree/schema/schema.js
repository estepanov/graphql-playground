const axios = require('axios')
const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList
} = graphql

/*
    Company type should be defined above UserType because

    Also in GraphQL we treat associations as additional fields on Types
    and we need to define its own resolve function. This is because it is
    refrenced as its own Type.
*/
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // wrap fields values in arrow function.
  // this uses closure scope to get around circular refrence for the dependency: UserType
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    ticker: { type: GraphQLString },
    // this allows us to see associated users for each company.
    users: {
      // because it is a list of users and not a single user we wrap the type
      type: GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res => res.data)
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    // added company field to the user type for the association
    company: {
      type: CompanyType,
      // added a resolve here to fetch the requested company object
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data)
      }
    }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then(response => response.data) // because axios nests response data
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then(res => res.data)
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
