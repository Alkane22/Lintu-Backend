const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')
const Lintu = require('../models/lintu')
const helper = require('./test_helper')


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('admin', 10)
    const user = new User({ username: 'admin', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      password: 'salainen',
    }

    await api
      .post('/api/user')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })


  test('can login', async () => {
    const resp = await api
      .post('/api/user/login')
      .send({ username: "admin", password: "admin" })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    console.log(resp.body.token)
  })

})

