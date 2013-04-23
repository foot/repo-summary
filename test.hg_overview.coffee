
expect = require('chai').expect
hgOverview = require './hg_overview'


describe 'Parsing the hg summary output', ->

  data = """
  parent: 3011:b60af338017c default/3.0.1 tip
   use fake version fallback [#5455]
  branch: 3.0.1
  commit: (clean)
  update: (current)
  """

  it 'should parse it into an object', ->
    res = hgOverview.parseSummary(data)

    console.log res
    expect(res.commit).to.equal('(clean)')
    expect(res.update).to.equal('(current)')
    expect(res.branch).to.equal('3.0.1')