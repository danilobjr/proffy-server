import express from 'express'

const routes = express.Router()

routes.get('/', (_, response) => {
    const fakeUsers = [
        { id: 1, name: 'Danilo' },
        { id: 2, name: 'Carminha' }
    ]

    return response.json(fakeUsers)
})

export {
  routes
}
