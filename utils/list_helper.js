const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0 ? null : blogs.filter(blog => blog.likes === Math.max(...blogs.map((blog) => blog.likes)))[0]
}

const mostBlogs = (blogs) => {
  if (blogs[0]) {
    const most = _.chain(blogs)
      .groupBy('author')
      .mapValues((blogs) => blogs.length)
      .toPairs()
      .orderBy(1, 'desc')
      .fromPairs()
      .entries()
      .head()
      .value()

    return { 'author': most[0], 'blogs':  most[1] }
  }
  return null
}

const mostLikes = (blogs) => {
  if (blogs[0]) {
    const most = _.chain(blogs)
      .groupBy('author')
      .mapValues((blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0))
      .toPairs()
      .orderBy(1, 'desc')
      .fromPairs()
      .entries()
      .head()
      .value()
    return { 'author': most[0], 'likes':  most[1] }
  }
  return null
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
