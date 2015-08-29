# out: ../lib/main.js
module.exports = (samjs) ->
  samjs.mongo.plugins
    configwise: (options) ->
      if options?.configName?
        propName = options.propName
        propName ?= "name"
        processConfig = (config) ->
          return unless samjs.util.isArray config
          names = []
          newNames = []
          for entry in config
            if samjs.util.isObject(entry) and entry[propName]?
              confname = entry[propName]
              names.push confname
              unless @dbModels[confname]?
                @dbModels[confname] =
                  samjs.mongo.mongoose.model @name+confname, @schema
                for iname,generator of @interfaceGenerators
                  @interfaces[iname+confname] = generator(confname)
                newNames.push confname
          for confname, model of @dbModels
            if names.indexOf(confname) < 0 # something got deleted
              delete @dbModels[confname]
              delete @interfaces[@name+confname]
              for iname,generator of @interfaceGenerators
                @removeInterface[iname+confname]()
                delete @removeInterface[iname+confname]
          unless samjs.started.isPending()
            for confname in newNames
              for iname,generator of @interfaceGenerators
                @removeInterface[iname+confname] =
                  samjs.exposeInterface(@name+confname,
                                        @interfaces[iname+confname].bind(@))
        #replace startup
        @startup = ->
          samjs.on options.configName+".updated", processConfig.bind(@)
          return samjs.configs[options.configName]._get()
            .then processConfig.bind(@)

      return @

  return name: "configwise"
