chai = require "chai"
should = chai.should()
samjs = require "samjs"
samjsMongo = require "samjs-mongo"
samjsMongoConfigwise = require("../src/main")
samjsClient = require "samjs-client"
samjsMongoClient = require "samjs-mongo-client"

fs = samjs.Promise.promisifyAll(require("fs"))
port = 3060
url = "http://localhost:"+port+"/"
testConfigFile = "test/testConfig.json"
mongodb = "mongodb://localhost/test"

describe "samjs", ->
  client = null
  before (done) ->
    samjs.reset()
    .plugins(samjsMongo,samjsMongoConfigwise)
    .options({config:testConfigFile})
    fs.unlinkAsync testConfigFile
    .catch -> return true
    .finally ->
      done()

  describe "mongo", ->
    describe "configwise", ->
      opt = null
      users = null
      it "should configure", (done) ->
        samjs.configs({name:"testConfig",read:true,write:true})
        .models({
          name:"testModel"
          db:"mongo",
          plugins:
            configwise:
              configName: "testConfig"
          schema:
            name: String
        })
        .startup().io.listen(port)
        client = samjsClient({
          url: url
          ioOpts:
            reconnection: false
            autoConnect: false
          })()
        client.install.onceInConfigMode
        .return client.install.set "mongoURI", mongodb
        .then -> done()
        .catch done
      it "should be started up", (done) ->
        samjs.started
        .then -> done()
        .catch done
      it "should have no interface", ->
        Object.keys(samjs.models.testModel.interfaces).length.should.equal 0
      it "should add an interface on config.set", (done) ->
        samjs.configs.testConfig._set [{name:"first"},{name:"second"}]
        .then ->
          Object.keys(samjs.models.testModel.interfaces).length.should.equal 2
          should.exist samjs.models.testModel.interfaces.testModelfirst
          should.exist samjs.models.testModel.interfaces.testModelsecond
          done()
      it "should work with two interfaces", (done) ->
        client.plugins(samjsMongoClient)
        modelfirst = new client.Mongo("testModelfirst")
        modelsecond = new client.Mongo("testModelsecond")
        modelfirst.insert({name:"test"})
        .then -> modelsecond.insert({name:"test2"})
        .then -> modelfirst.find()
        .then (result) ->
          result[0].name.should.equal "test"
          return modelsecond.find()
        .then (result) ->
          result[0].name.should.equal "test2"
          done()
        .catch done
      it "should remove the interface", (done) ->
        samjs.configs.testConfig._set [{name:"first"}]
        .then ->
          Object.keys(samjs.models.testModel.interfaces).length.should.equal 1
          should.exist samjs.models.testModel.interfaces.testModelfirst
          should.not.exist samjs.models.testModel.interfaces.testModelsecond
          done()
      it "should and not work on client anymore", (done) ->
        modelsecond = new client.Mongo("testModelsecond")
        modelsecond.find()
        .catch -> done()
      it "should remove entrys", (done) ->
        samjs.configs.testConfig._set [{name:"first"},{name:"second"}]
        .then ->
          modelsecond = new client.Mongo("testModelsecond")
          modelsecond.remove()
        .then ->
          modelfirst = new client.Mongo("testModelfirst")
          modelfirst.remove()
        .then -> done()
        .catch done

  after (done) ->
    if samjs.shutdown?
      samjs.shutdown().then -> done()
    else
      done()
