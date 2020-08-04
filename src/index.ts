import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (_, response) => {
    const fakeUsers = [
        { id: 1, name: 'Danilo' },
        { id: 2, name: 'Carminha' }
    ]

    return response.json(fakeUsers)
})

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Listening on port ${port}`))