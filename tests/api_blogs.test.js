const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

let token = ''

const createBlogWithAuth = async () => {
  const authBlog = await api
    .post('/api/blogs')
    .send(helper.oneBlog2)
    .set('Authorization', token)

  return authBlog._body
}

const SECONDS = 1000
jest.setTimeout(70 * SECONDS)

beforeAll(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('testPassword', 10)
  const user = new User({
    username: 'testUsername',
    name: 'testName',
    passwordHash,
  })
  const savedUser = await user.save()

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id,
  }
  token = `bearer ${jwt.sign(userForToken, process.env.SECRET)}`
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('route: get /', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('correct amount of blogs returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('returned blog has field named id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('route: post /', () => {
  test('needs authorization to add a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api.post('/api/blogs').send(helper.oneBlog2).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('adds valid blog to db', async () => {
    const newBlog = helper.oneBlog
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map((r) => r.title)
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain('First class tests')
  })

  test('field likes gets value 0 as default', async () => {
    await Blog.deleteMany({})
    const newBlog = helper.oneBlog
    newBlog.likes = undefined
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body[0].likes).toBe(0)
  })

  test('responses statuscode 400 if title or url missing', async () => {
    const newBlog = Array.from(helper.oneBlog)
    newBlog.title = undefined
    const newBlog2 = Array.from(helper.oneBlog2)
    newBlog2.url = undefined

    await api.post('/api/blogs').send(newBlog).set('Authorization', token).expect(400)

    await api.post('/api/blogs').send(newBlog2).set('Authorization', token).expect(400)
  })
})

describe('route delete /:id', () => {
  test('authorization needed to delete blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogId = blogsAtStart[0].id

    await api.delete(`/api/blogs/${blogId}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('deleting blog with valid id removes correct blog from db', async () => {
    const authBlog = await createBlogWithAuth()
    const blogsAtStart = await helper.blogsInDb()

    await api.delete(`/api/blogs/${authBlog.id}`).set('Authorization', token).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const ids = blogsAtEnd.map((blog) => blog.id)

    const initialBlogsIds = helper.initialBlogs.map((blog) => blog._id)

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
    expect(ids).toEqual(initialBlogsIds)
  })

  test('deleting blog removes ref of blog from user', async () => {
    const authBlog = await createBlogWithAuth()
    const usersAtStart = await helper.usersInDb()
    expect(usersAtStart[0].blogs.toString()).toContain(authBlog.id)

    await api.delete(`/api/blogs/${authBlog.id}`).set('Authorization', token).expect(204)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd[0].blogs.toString()).not.toContain(authBlog.id)
  })

  test('will not delete blog when deleting with invalid blog id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete('/api/blogs/123456789invalidId')
      .set('Authorization', token)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

describe('route put /:id', () => {
  test('same amount of blogs after update', async () => {
    const origLikes = helper.initialBlogs[0].likes
    const blogs = Array.from(helper.initialBlogs)
    console.log('-----blogs--', blogs)
    let blogToUpdate = { ...blogs[0], likes: origLikes + 2 }
    console.log('-----updateblog-', blogToUpdate)

    await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send(blogToUpdate)
      .set('Authorization', token)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('correct amount of likes after update', async () => {
    const origLikes = helper.initialBlogs[0].likes
    let blogToUpdate = { ...helper.initialBlogs[0], likes: origLikes + 2 }

    await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send(blogToUpdate)
      .set('Authorization', token)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(helper.initialBlogs[0].likes + 2)
  })

  test('changes only updated likes value to blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const origLikes = helper.initialBlogs[0].likes
    const addedAmountOfLikes = 4
    let blogToUpdate = {
      ...helper.initialBlogs[0],
      likes: origLikes + addedAmountOfLikes,
    }

    await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .set('Authorization', token)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect({ ...blogsAtEnd[0] }).toEqual({
      ...blogsAtStart[0],
      likes: origLikes + addedAmountOfLikes,
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
