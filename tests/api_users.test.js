const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)

const SECONDS = 1000
jest.setTimeout(70 * SECONDS)

describe('when db contains one user at begin', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('testPassword', 10)
    const user = new User({
      username: 'testUsername',
      name: 'testName',
      passwordHash,
    })
    await user.save()
  })

  test('Initially Db contains one user', async () => {
    const users = await helper.usersInDb()
    expect(users.length).toBe(1)
  })

  test('creation succeed with a fresh username', async () => {
    const userAtStart = await helper.usersInDb()
    const newUser = {
      username: 'Irmeli',
      name: 'Irmeli Testaaja',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper status code and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    const oldUsername = usersAtStart[0].username

    const newUser = {
      username: oldUsername,
      name: 'Uolevi',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper status code and message if username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ua',
      name: 'Uolevi',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username should be at least 3 characters')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper status code and message if username missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '',
      name: 'Uolevi',
      password: 'salainen',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username required')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper status code and message if password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Uolevi',
      name: 'Uolevi',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password should be at least 3 characters')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper status code and message if password missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Uolevi',
      name: 'Uolevi',
      password: '',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password required')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
