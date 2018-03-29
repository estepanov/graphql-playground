const express = require('express')
const expressGraphQL = require('express-graphql')

const app = express()
const port = 4000

app.use(
  '/graphql',
  expressGraphQL({
    graphiql: true
  })
)

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
