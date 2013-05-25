
expect = require('chai').expect
HgOverview = require './hg-overview'


describe 'Parsing the hg summary output', ->

  data = """
  parent: 3011:b60af338017c default/3.0.1 tip
   use fake version fallback [#5455]
  branch: 3.0.1
  commit: (clean)
  update: (current)
  """

  it 'should parse it into an object', ->
    res = HgOverview.parseSummary(data)

    expect(res.commit).to.equal('(clean)')
    expect(res.update).to.equal('(current)')
    expect(res.branch).to.equal('3.0.1')


describe 'getRepos', ->

  it 'should list all the dirs!', (done) ->

    HgOverview.getRepos '~/src', (err, repos) ->

      # console.log repos

      done()

