# samjs-mongo-configwise

A module for the mongo plugin for samjs.
Exposes a model for each entry of a given config item.

## Example
```coffee
samjs.plugins(require("samjs-mongo"),require("samjs-mongo-configwise"))
.options({config:"config.json"})
.configs({name:"someConfig",read:true,write:true})
.models({
  name:"someModel"
  db:"mongo",
  plugins:
    configwise:
      configName: "someConfig"
      propName: "name"
  schema:
    name: String
}).startup().io.listen(3000)
## client side
samjs = require("samjs-client")({url: window.location.host+":3000/"})
samjs.plugins(require "samjs-mongo-client")
samjs.config.set "someConfig", [name:"first",name:"second"]
.then ->
  # two independet tables with the same schema
  someModelfirst = new samjs.Mongo("someModelfirst")
  someModelsecond = new samjs.Mongo("someModelsecond")
```
