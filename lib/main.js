(function() {
  module.exports = function(samjs) {
    samjs.mongo.plugins({
      configwise: function(options) {
        var processConfig, propName;
        if ((options != null ? options.configName : void 0) != null) {
          propName = options.propName;
          if (propName == null) {
            propName = "name";
          }
          processConfig = function(config) {
            var confname, entry, generator, i, iname, j, len, len1, model, names, newNames, ref, ref1, ref2, results;
            if (!samjs.util.isArray(config)) {
              return;
            }
            names = [];
            newNames = [];
            for (i = 0, len = config.length; i < len; i++) {
              entry = config[i];
              if (samjs.util.isObject(entry) && (entry[propName] != null)) {
                confname = entry[propName];
                names.push(confname);
                if (this.dbModels[confname] == null) {
                  this.dbModels[confname] = samjs.mongo.mongoose.model(this.name + confname, this.schema);
                  ref = this.interfaceGenerators;
                  for (iname in ref) {
                    generator = ref[iname];
                    this.interfaces[iname + confname] = generator(confname);
                  }
                  newNames.push(confname);
                }
              }
            }
            ref1 = this.dbModels;
            for (confname in ref1) {
              model = ref1[confname];
              if (names.indexOf(confname) < 0) {
                delete this.dbModels[confname];
                delete this.interfaces[this.name + confname];
                ref2 = this.interfaceGenerators;
                for (iname in ref2) {
                  generator = ref2[iname];
                  this.removeInterface[iname + confname]();
                  delete this.removeInterface[iname + confname];
                }
              }
            }
            if (!samjs.started.isPending()) {
              results = [];
              for (j = 0, len1 = newNames.length; j < len1; j++) {
                confname = newNames[j];
                results.push((function() {
                  var ref3, results1;
                  ref3 = this.interfaceGenerators;
                  results1 = [];
                  for (iname in ref3) {
                    generator = ref3[iname];
                    results1.push(this.removeInterface[iname + confname] = samjs.exposeInterface(this.name + confname, this.interfaces[iname + confname].bind(this)));
                  }
                  return results1;
                }).call(this));
              }
              return results;
            }
          };
          this.startup = function() {
            samjs.on(options.configName + ".updated", processConfig.bind(this));
            return samjs.configs[options.configName]._get().then(processConfig.bind(this));
          };
        }
        return this;
      }
    });
    return {
      name: "configwise"
    };
  };

}).call(this);
