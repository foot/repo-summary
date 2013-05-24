
expect = require('chai').expect
g = require './directory-chart'

describe "collapseRoot", ->

  it "should collapse multiple nodes down to a single one", ->

    root =
      name: 'a'
      children: [
        name: 'b'
        children: [
          name: 'c'
          children: [
            { name: 'd' }
            { name: 'e' }
          ]
        ]
      ]

    res = g.collapseRoot(root)
    expect(res).to.eql
      name: 'a/b/c'
      children: [
        { name: 'd' }
        { name: 'e' }
      ]

describe 'massageDirList', ->

  it 'should turn a flat list into a nested tree!', ->

    dirs = [
      { name: '/a/' }
      { name: '/a/b' }
    ]

    res = g.massageDirList dirs
