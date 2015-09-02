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
            var addname, base, entry, generator, generators, i, iface, iname, j, k, l, len, len1, len2, len3, mname, model, name, names, newName, ref, ref1, ref2, ref3, ref4, ref5, remover, results;
            if (!samjs.util.isArray(config)) {
              return;
            }
            names = {
              m: [],
              i: [],
              newA: []
            };
            for (i = 0, len = config.length; i < len; i++) {
              entry = config[i];
              if (samjs.util.isObject(entry) && (entry[propName] != null)) {
                addname = entry[propName];
                ref = this.dbModelGenerators;
                for (mname in ref) {
                  generator = ref[mname];
                  name = addname + "." + mname;
                  if ((base = this.dbModels)[name] == null) {
                    base[name] = generator.bind(this)(addname);
                  }
                  names.m.push(name);
                }
                newName = false;
                ref1 = this.interfaceGenerators;
                for (iname in ref1) {
                  generators = ref1[iname];
                  name = addname + "." + iname;
                  if (this.interfaces[name] == null) {
                    newName = true;
                    this.interfaces[name] = [];
                    for (j = 0, len1 = generators.length; j < len1; j++) {
                      generator = generators[j];
                      this.interfaces[name].push(generator(addname));
                    }
                  }
                  names.i.push(name);
                }
                if (newName) {
                  names.newA.push(addname);
                }
              }
            }
            ref2 = this.dbModels;
            for (name in ref2) {
              model = ref2[name];
              if (names.m.indexOf(name) < 0) {
                delete this.dbModels[name];
              }
            }
            ref3 = this.interfaces;
            for (name in ref3) {
              iface = ref3[name];
              if (names.i.indexOf(name) < 0) {
                ref4 = this.removeInterface[name];
                for (k = 0, len2 = ref4.length; k < len2; k++) {
                  remover = ref4[k];
                  remover();
                }
                delete this.interfaces[name];
                delete this.removeInterface[name];
              }
            }
            if (!samjs.started.isPending()) {
              ref5 = names.newA;
              results = [];
              for (l = 0, len3 = ref5.length; l < len3; l++) {
                addname = ref5[l];
                results.push((function() {
                  var ref6, results1;
                  ref6 = this.interfaceGenerators;
                  results1 = [];
                  for (iname in ref6) {
                    generators = ref6[iname];
                    results1.push(this.exposeInterfaces(addname + "." + iname));
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
