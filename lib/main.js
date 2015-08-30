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
            var addname, base, base1, entry, generator, i, iface, iname, j, len, len1, mname, model, name, names, newName, ref, ref1, ref2, ref3, ref4, results;
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
                  generator = ref1[iname];
                  name = addname + "." + iname;
                  if (this.interfaces[name] == null) {
                    newName = true;
                  }
                  if ((base1 = this.interfaces)[name] == null) {
                    base1[name] = generator(addname);
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
                this.removeInterface[name]();
                delete this.interfaces[name];
                delete this.removeInterface[name];
              }
            }
            if (!samjs.started.isPending()) {
              ref4 = names.newA;
              results = [];
              for (j = 0, len1 = ref4.length; j < len1; j++) {
                addname = ref4[j];
                results.push((function() {
                  var ref5, results1;
                  ref5 = this.interfaceGenerators;
                  results1 = [];
                  for (iname in ref5) {
                    generator = ref5[iname];
                    name = addname + "." + iname;
                    results1.push(this.removeInterface[name] = samjs.exposeInterface(name, this.interfaces[name].bind(this)));
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
