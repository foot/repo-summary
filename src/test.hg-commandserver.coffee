
# fs = require "fs"
# os = require "os"
# fspath = require "path"
# uuid = require "uuid"
# {spawn} = require "child_process"
# {expect} = require('chai')

es = require 'event-stream'

{commandServer, runCommand} = require './hg-commandserver'


MakeTempRepo = (done) ->

  tmpDir = fspath.join(os.tmpDir(), uuid.v1())

  fs.mkdir tmpDir, (err) ->
    done err if err

    initProcess = spawn "hg", ["init"], 
      cwd: tmpDir

    initProcess.on "exit", (code) ->
      unless code == 0
        err = new Error "Non zero status code returned when creating temporary repo: " + code
        return done err

      done null, new HGRepo(tmpDir)


describe 'The commandserver', ->

  it 'should work!', (done) ->

    repo = '/Users/simon/src/hg-prompt/'

    server = commandServer()

    server.start repo, ->

      resultStream = runCommand(server, [ '-R', repo, 'summary' ]).output

      consoleLog = es.writeArray (err, array) ->
        console.log array
        done()

      resultStream.pipe(consoleLog)
