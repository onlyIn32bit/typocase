/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236019783")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool2782219353",
    "name": "isOrdered",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236019783")

  // remove field
  collection.fields.removeById("bool2782219353")

  return app.save(collection)
})
