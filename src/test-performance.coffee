
es = require 'event-stream'
async = require 'async'
_ = require 'underscore'

HgOverview = require './hg-overview'
{ commandServer, runCommand } = require './hg-commandserver'


describe 'Performance of different approches', ->

  it 'Spawing new procs', (testComplete) ->

    @timeout 0

    HgOverview.getRepos '~/pld/', (err, repos) ->

      HgOverview.getReposStatus repos, (->), testComplete 

  it 'Using command servers', (testComplete) ->

    @timeout 0

    HgOverview.getRepos '~/pld/', (err, repos) ->

      getSummary = (s, repo, done) ->
        out = runCommand(s, [ '-R', repo, 'summary' ]).output
        writeArray = es.writeArray (err, array) ->
          done(null, array.join(''))
        out.pipe(writeArray)

      run = (s, repos, taskFinished, allFinished) ->
        tasks = repos.map (path) ->
          return (done) ->
            getSummary s, path, (err, summary) ->
              taskFinished()
              done()

        async.series tasks, allFinished

      # split up the work across all the repos.

      n = Math.min(5, repos.length)
      l = Math.floor(repos.length / n)
      repoSlices = _.range(n).map (i) ->
        return repos.slice(i * l, (i + 1) * l)

      tasks = repoSlices.map (repos) ->
        s = commandServer()
        return (done) ->
          s.start repos[0], ->
            run s, repos, (->), done

      async.parallel tasks, testComplete
