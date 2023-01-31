const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful 2',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful2.html',
    likes: 5,
    __v: 0,
  },
]

const listWithThreeBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
]

test('dummy returns one', () => {
  const blogs = []

  expect(listHelper.dummy(blogs)).toBe(1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listWithThreeBlogs)
    expect(result).toBe(24)
  })

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })
})

describe('favoriteBlog', () => {
  test('empty list returns null', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toBe(null)
  })

  test('finds blog with max count of likes from the list', () => {
    const result = listHelper.favoriteBlog(listWithThreeBlogs)
    expect(result).toEqual({
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
    })
  })

  test('list with one blog returns blog right', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    expect(result).toEqual({
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful 2',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful2.html',
      likes: 5,
      __v: 0,
    })
  })

  describe('mostBlogs', () => {
    test('empty list of blogs returns null', () => {
      const result = listHelper.mostBlogs([])
      expect(result).toBe(null)
    })

    test('list containing one blog returns object containing author and one as count of blogs', () => {
      const result = listHelper.mostBlogs(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        blogs: 1,
      })
    })

    test('list containing several blogs returns object containing author with most blogs and count of blogs', () => {
      const blogs = [...listWithOneBlog, ...listWithThreeBlogs]
      const result = listHelper.mostBlogs(blogs)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        blogs: 3,
      })
    })
  })

  describe('mostLikes', () => {
    test('empty list of blogs returns null', () => {
      const result = listHelper.mostBlogs([])
      expect(result).toBe(null)
    })

    test('list containing one blog returns object containing author and sum of likes', () => {
      const result = listHelper.mostLikes(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 5,
      })
    })

    test('list containing several blogs returns object containing author with most likes and sum of likes', () => {
      const blogs = [...listWithOneBlog, ...listWithThreeBlogs]
      const result = listHelper.mostLikes(blogs)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 22,
      })
    })
  })
})
