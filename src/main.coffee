# out: ../lib/main.js
module.exports = (samjs) ->
  samjs.mongo.plugins configwise: (options) ->
    if options?.configName?
      propName = options.propName
      propName ?= "name"
      processConfig = (config) ->
        return unless samjs.util.isArray config
        names =
          m: []
          i: []
          newA: []
        for entry in config
          if samjs.util.isObject(entry) and entry[propName]?
            addname = entry[propName]
            for mname,generator of @dbModelGenerators
              name = addname+"."+mname
              @dbModels[name] ?= generator.bind(@)(addname)
              names.m.push name
            newName = false
            for iname,generators of @interfaceGenerators
              name = addname+"."+iname
              unless @interfaces[name]?
                newName = true
                @interfaces[name] = []
                for generator in generators
                  @interfaces[name].push generator(addname)
              names.i.push name
            names.newA.push addname if newName
        for name, model of @dbModels
          if names.m.indexOf(name) < 0
            delete @dbModels[name]
        for name, iface of @interfaces
          if names.i.indexOf(name) < 0
            for remover in @removeInterface[name]
              remover()
            delete @interfaces[name]
            delete @removeInterface[name]
        unless samjs.started.isPending()
          for addname in names.newA
            for iname,generators of @interfaceGenerators
              @exposeInterfaces addname+"."+iname
      #replace startup
      @startup = ->
        samjs.on options.configName+".updated", processConfig.bind(@)
        return samjs.configs[options.configName]._get()
          .then processConfig.bind(@)
    return @
  return name: "configwise"
