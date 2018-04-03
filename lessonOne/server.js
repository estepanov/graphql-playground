const express = require('express')
const expressGraphQL = require('express-graphql')
const schema = require('./schema/schema')

const app = express()
const port = 4000

app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
)

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
