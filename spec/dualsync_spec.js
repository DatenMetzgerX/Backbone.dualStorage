// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, ModelWithAlternateIdAttribute, backboneSync, collection, localStorage, localsync, model, spyOnLocalsync, _ref,
    __slice = [].slice;

  Backbone = window.Backbone, backboneSync = window.backboneSync, localsync = window.localsync, localStorage = window.localStorage;

  _ref = {}, collection = _ref.collection, model = _ref.model, ModelWithAlternateIdAttribute = _ref.ModelWithAlternateIdAttribute;

  beforeEach(function() {
    backboneSync.calls = [];
    localStorage.clear();
    ModelWithAlternateIdAttribute = Backbone.Model.extend({
      idAttribute: '_id'
    });
    collection = new Backbone.Collection;
    collection.model = ModelWithAlternateIdAttribute;
    collection.add({
      _id: 12,
      position: 'arm'
    });
    collection.url = 'bones/';
    delete collection.remote;
    model = collection.models[0];
    return delete model.remote;
  });

  spyOnLocalsync = function() {
    spyOn(window, 'localsync').andCallFake(function(method, model, options) {
      if (!options.ignoreCallbacks) {
        return typeof options.success === "function" ? options.success() : void 0;
      }
    });
    return localsync = window.localsync;
  };

  describe('delegating to localsync and backboneSync, and calling the model callbacks', function() {
    describe('dual tier storage', function() {
      var checkMergedAttributesFor;
      checkMergedAttributesFor = function(method, modelToUpdate) {
        var originalAttributes, ready;
        if (modelToUpdate == null) {
          modelToUpdate = model;
        }
        spyOnLocalsync();
        originalAttributes = null;
        ready = false;
        runs(function() {
          var serverResponse;
          modelToUpdate.set({
            updatedAttribute: 'original value'
          });
          originalAttributes = _.clone(modelToUpdate.attributes);
          serverResponse = _.extend(model.toJSON(), {
            updatedAttribute: 'updated value',
            newAttribute: 'new value'
          });
          return dualsync(method, modelToUpdate, {
            success: (function() {
              return ready = true;
            }),
            serverResponse: serverResponse
          });
        });
        waitsFor((function() {
          return ready;
        }), "The success callback should have been called", 100);
        return runs(function() {
          var localsyncedAttributes, updatedAttributes;
          expect(modelToUpdate.attributes).toEqual(originalAttributes);
          localsyncedAttributes = _(localsync.calls).map(function(call) {
            return call.args[1].attributes;
          });
          updatedAttributes = {
            _id: 12,
            position: 'arm',
            updatedAttribute: 'updated value',
            newAttribute: 'new value'
          };
          return expect(localsyncedAttributes).toContain(updatedAttributes);
        });
      };
      describe('create', function() {
        it('delegates to both localsync and backboneSync', function() {
          var ready;
          spyOnLocalsync();
          ready = false;
          runs(function() {
            return dualsync('create', model, {
              success: (function() {
                return ready = true;
              })
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(backboneSync).toHaveBeenCalled();
            expect(backboneSync.calls[0].args[0]).toEqual('create');
            expect(localsync).toHaveBeenCalled();
            expect(localsync.calls[0].args[0]).toEqual('create');
            return expect(_(localsync.calls).every(function(call) {
              return call.args[1] instanceof Backbone.Model;
            })).toBeTruthy();
          });
        });
        return it('merges the response attributes into the model attributes', function() {
          return checkMergedAttributesFor('create');
        });
      });
      describe('read', function() {
        it('delegates to both localsync and backboneSync', function() {
          var ready;
          spyOnLocalsync();
          ready = false;
          runs(function() {
            return dualsync('read', model, {
              success: (function() {
                return ready = true;
              })
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(backboneSync).toHaveBeenCalled();
            expect(_(backboneSync.calls).any(function(call) {
              return call.args[0] === 'read';
            })).toBeTruthy();
            expect(localsync).toHaveBeenCalled();
            expect(_(localsync.calls).any(function(call) {
              return call.args[0] === 'update';
            })).toBeTruthy();
            return expect(_(localsync.calls).every(function(call) {
              return call.args[1] instanceof Backbone.Model;
            })).toBeTruthy();
          });
        });
        return describe('for collections', function() {
          return it('calls localsync update once for each model', function() {
            var collectionResponse, ready;
            spyOnLocalsync();
            ready = false;
            collectionResponse = [
              {
                _id: 12,
                position: 'arm'
              }, {
                _id: 13,
                position: 'a new model'
              }
            ];
            runs(function() {
              return dualsync('read', collection, {
                success: (function() {
                  return ready = true;
                }),
                serverResponse: collectionResponse
              });
            });
            waitsFor((function() {
              return ready;
            }), "The success callback should have been called", 100);
            return runs(function() {
              var updateCalls, updatedModelAttributes;
              expect(backboneSync).toHaveBeenCalled();
              expect(_(backboneSync.calls).any(function(call) {
                return call.args[0] === 'read';
              })).toBeTruthy();
              expect(localsync).toHaveBeenCalled();
              updateCalls = _(localsync.calls).select(function(call) {
                return call.args[0] === 'update';
              });
              expect(updateCalls.length).toEqual(2);
              expect(_(updateCalls).every(function(call) {
                return call.args[1] instanceof Backbone.Model;
              })).toBeTruthy();
              updatedModelAttributes = _(updateCalls).map(function(call) {
                return call.args[1].attributes;
              });
              expect(updatedModelAttributes[0]).toEqual({
                _id: 12,
                position: 'arm'
              });
              return expect(updatedModelAttributes[1]).toEqual({
                _id: 13,
                position: 'a new model'
              });
            });
          });
        });
      });
      describe('update', function() {
        it('delegates to both localsync and backboneSync', function() {
          var ready;
          spyOnLocalsync();
          ready = false;
          runs(function() {
            return dualsync('update', model, {
              success: (function() {
                return ready = true;
              })
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(backboneSync).toHaveBeenCalled();
            expect(_(backboneSync.calls).any(function(call) {
              return call.args[0] === 'update';
            })).toBeTruthy();
            expect(localsync).toHaveBeenCalled();
            expect(_(localsync.calls).any(function(call) {
              return call.args[0] === 'update';
            })).toBeTruthy();
            return expect(_(localsync.calls).every(function(call) {
              return call.args[1] instanceof Backbone.Model;
            })).toBeTruthy();
          });
        });
        return it('merges the response attributes into the model attributes', function() {
          return checkMergedAttributesFor('update');
        });
      });
      return describe('delete', function() {
        return it('delegates to both localsync and backboneSync', function() {
          var ready;
          spyOnLocalsync();
          ready = false;
          runs(function() {
            return dualsync('delete', model, {
              success: (function() {
                return ready = true;
              })
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(backboneSync).toHaveBeenCalled();
            expect(_(backboneSync.calls).any(function(call) {
              return call.args[0] === 'delete';
            })).toBeTruthy();
            expect(localsync).toHaveBeenCalled();
            expect(_(localsync.calls).any(function(call) {
              return call.args[0] === 'delete';
            })).toBeTruthy();
            return expect(_(localsync.calls).every(function(call) {
              return call.args[1] instanceof Backbone.Model;
            })).toBeTruthy();
          });
        });
      });
    });
    describe('respects the remote only attribute on models', function() {
      it('delegates for remote models', function() {
        var ready;
        ready = false;
        runs(function() {
          model.remote = true;
          return dualsync('create', model, {
            success: (function() {
              return ready = true;
            })
          });
        });
        waitsFor((function() {
          return ready;
        }), "The success callback should have been called", 100);
        return runs(function() {
          expect(backboneSync).toHaveBeenCalled();
          return expect(backboneSync.calls[0].args[0]).toEqual('create');
        });
      });
      return it('delegates for remote collections', function() {
        var ready;
        ready = false;
        runs(function() {
          collection.remote = true;
          return dualsync('read', model, {
            success: (function() {
              return ready = true;
            })
          });
        });
        waitsFor((function() {
          return ready;
        }), "The success callback should have been called", 100);
        return runs(function() {
          expect(backboneSync).toHaveBeenCalled();
          return expect(backboneSync.calls[0].args[0]).toEqual('read');
        });
      });
    });
    describe('respects the local only attribute on models', function() {
      it('delegates for local models', function() {
        var ready;
        spyOnLocalsync();
        ready = false;
        runs(function() {
          model.local = true;
          backboneSync.reset();
          return dualsync('update', model, {
            success: (function() {
              return ready = true;
            })
          });
        });
        waitsFor((function() {
          return ready;
        }), "The success callback should have been called", 100);
        return runs(function() {
          expect(localsync).toHaveBeenCalled();
          return expect(localsync.calls[0].args[0]).toEqual('update');
        });
      });
      return it('delegates for local collections', function() {
        var ready;
        ready = false;
        runs(function() {
          collection.local = true;
          backboneSync.reset();
          return dualsync('delete', model, {
            success: (function() {
              return ready = true;
            })
          });
        });
        waitsFor((function() {
          return ready;
        }), "The success callback should have been called", 100);
        return runs(function() {
          return expect(backboneSync).not.toHaveBeenCalled();
        });
      });
    });
    it('respects the remote: false sync option', function() {
      var ready;
      ready = false;
      runs(function() {
        backboneSync.reset();
        return dualsync('create', model, {
          success: (function() {
            return ready = true;
          }),
          remote: false
        });
      });
      waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
      return runs(function() {
        return expect(backboneSync).not.toHaveBeenCalled();
      });
    });
    return describe('server response', function() {
      describe('on read', function() {
        describe('for models', function() {
          return it('gets merged with existing attributes on a model', function() {
            var ready;
            spyOnLocalsync();
            localsync.reset();
            ready = false;
            runs(function() {
              return dualsync('read', model, {
                success: (function() {
                  return ready = true;
                }),
                serverResponse: {
                  side: 'left',
                  _id: 13
                }
              });
            });
            waitsFor((function() {
              return ready;
            }), "The success callback should have been called", 100);
            return runs(function() {
              expect(localsync.calls[1].args[0]).toEqual('update');
              return expect(localsync.calls[1].args[1].attributes).toEqual({
                position: 'arm',
                side: 'left',
                _id: 13
              });
            });
          });
        });
        return describe('for collections', function() {
          return it('gets merged with existing attributes on the model with the same id', function() {
            var ready;
            spyOnLocalsync();
            localsync.reset();
            ready = false;
            runs(function() {
              return dualsync('read', collection, {
                success: (function() {
                  return ready = true;
                }),
                serverResponse: [
                  {
                    side: 'left',
                    _id: 12
                  }
                ]
              });
            });
            waitsFor((function() {
              return ready;
            }), "The success callback should have been called", 100);
            return runs(function() {
              expect(localsync.calls[2].args[0]).toEqual('update');
              return expect(localsync.calls[2].args[1].attributes).toEqual({
                position: 'arm',
                side: 'left',
                _id: 12
              });
            });
          });
        });
      });
      describe('on create', function() {
        return it('gets merged with existing attributes on a model', function() {
          var ready;
          spyOnLocalsync();
          localsync.reset();
          ready = false;
          runs(function() {
            return dualsync('create', model, {
              success: (function() {
                return ready = true;
              }),
              serverResponse: {
                side: 'left',
                _id: 13
              }
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(localsync.calls[0].args[0]).toEqual('create');
            return expect(localsync.calls[0].args[1].attributes).toEqual({
              position: 'arm',
              side: 'left',
              _id: 13
            });
          });
        });
      });
      return describe('on update', function() {
        return it('gets merged with existing attributes on a model', function() {
          var ready;
          spyOnLocalsync();
          localsync.reset();
          ready = false;
          runs(function() {
            return dualsync('update', model, {
              success: (function() {
                return ready = true;
              }),
              serverResponse: {
                side: 'left',
                _id: 13
              }
            });
          });
          waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
          return runs(function() {
            expect(localsync.calls[0].args[0]).toEqual('update');
            return expect(localsync.calls[0].args[1].attributes).toEqual({
              position: 'arm',
              side: 'left',
              _id: 13
            });
          });
        });
      });
    });
  });

  describe('offline storage', function() {
    return it('marks records dirty when options.remote is false, except if the model/collection is marked as local', function() {
      var ready;
      spyOnLocalsync();
      ready = void 0;
      runs(function() {
        ready = false;
        collection.local = true;
        return dualsync('update', model, {
          success: (function() {
            return ready = true;
          }),
          remote: false
        });
      });
      waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
      runs(function() {
        expect(localsync).toHaveBeenCalled();
        expect(localsync.calls.length).toEqual(1);
        return expect(localsync.calls[0].args[2].dirty).toBeFalsy();
      });
      runs(function() {
        localsync.reset();
        ready = false;
        collection.local = false;
        return dualsync('update', model, {
          success: (function() {
            return ready = true;
          }),
          remote: false
        });
      });
      waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
      return runs(function() {
        expect(localsync).toHaveBeenCalled();
        expect(localsync.calls.length).toEqual(1);
        return expect(localsync.calls[0].args[2].dirty).toBeTruthy();
      });
    });
  });

  describe('dualStorage hooks', function() {
    beforeEach(function() {
      var ready;
      model.parseBeforeLocalSave = function() {
        return new ModelWithAlternateIdAttribute({
          parsedRemote: true
        });
      };
      ready = false;
      runs(function() {
        return dualsync('create', model, {
          success: (function() {
            return ready = true;
          })
        });
      });
      return waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
    });
    return it('filters read responses through parseBeforeLocalSave when defined on the model or collection', function() {
      var response;
      response = null;
      runs(function() {
        return dualsync('read', model, {
          success: function() {
            var callback_args;
            callback_args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return response = callback_args;
          }
        });
      });
      waitsFor((function() {
        return response;
      }), "The success callback should have been called", 100);
      return runs(function() {
        return expect(response[0].get('parsedRemote') || response[1].get('parsedRemote')).toBeTruthy();
      });
    });
  });

  describe('storeName selection', function() {
    it('uses the model url as a store name', function() {
      model = new ModelWithAlternateIdAttribute();
      model.local = true;
      model.url = '/bacon/bits';
      spyOnLocalsync();
      dualsync(null, model, {});
      return expect(localsync.calls[0].args[2].storeName).toEqual(model.url);
    });
    it('prefers the model urlRoot over the url as a store name', function() {
      model = new ModelWithAlternateIdAttribute();
      model.local = true;
      model.url = '/bacon/bits';
      model.urlRoot = '/bacon';
      spyOnLocalsync();
      dualsync(null, model, {});
      return expect(localsync.calls[0].args[2].storeName).toEqual(model.urlRoot);
    });
    it('prefers the collection url over the model urlRoot as a store name', function() {
      model = new ModelWithAlternateIdAttribute();
      model.local = true;
      model.url = '/bacon/bits';
      model.urlRoot = '/bacon';
      model.collection = new Backbone.Collection();
      model.collection.url = '/ranch';
      spyOnLocalsync();
      dualsync(null, model, {});
      return expect(localsync.calls[0].args[2].storeName).toEqual(model.collection.url);
    });
    it('prefers the model storeName over the collection url as a store name', function() {
      model = new ModelWithAlternateIdAttribute();
      model.local = true;
      model.url = '/bacon/bits';
      model.urlRoot = '/bacon';
      model.collection = new Backbone.Collection();
      model.collection.url = '/ranch';
      model.storeName = 'melted cheddar';
      spyOnLocalsync();
      dualsync(null, model, {});
      return expect(localsync.calls[0].args[2].storeName).toEqual(model.storeName);
    });
    return it('prefers the collection storeName over the model storeName as a store name', function() {
      model = new ModelWithAlternateIdAttribute();
      model.local = true;
      model.url = '/bacon/bits';
      model.urlRoot = '/bacon';
      model.collection = new Backbone.Collection();
      model.collection.url = '/ranch';
      model.storeName = 'melted cheddar';
      model.collection.storeName = 'ketchup';
      spyOnLocalsync();
      dualsync(null, model, {});
      return expect(localsync.calls[0].args[2].storeName).toEqual(model.collection.storeName);
    });
  });

  describe('when to call user-specified success and error callbacks', function() {
    it('uses the success callback when the network is down', function() {
      var ready;
      ready = false;
      localStorage.setItem('bones/', "1");
      runs(function() {
        return dualsync('create', model, {
          success: (function() {
            return ready = true;
          }),
          errorStatus: 0
        });
      });
      return waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
    });
    it('uses the success callback when an offline error status is received (e.g. 408)', function() {
      var ready;
      ready = false;
      localStorage.setItem('bones/', "1");
      runs(function() {
        return dualsync('create', model, {
          success: (function() {
            return ready = true;
          }),
          errorStatus: 408
        });
      });
      return waitsFor((function() {
        return ready;
      }), "The success callback should have been called", 100);
    });
    it('uses the error callback when an error status is received (e.g. 500)', function() {
      var ready;
      ready = false;
      runs(function() {
        return dualsync('create', model, {
          error: (function() {
            return ready = true;
          }),
          errorStatus: 500
        });
      });
      return waitsFor((function() {
        return ready;
      }), "The error callback should have been called", 100);
    });
    return describe('when offline', function() {
      it('uses the error callback if no existing local store is found', function() {
        var ready;
        ready = false;
        runs(function() {
          return dualsync('read', model, {
            error: (function() {
              return ready = true;
            }),
            errorStatus: 0
          });
        });
        return waitsFor((function() {
          return ready;
        }), "The error callback should have been called", 100);
      });
      it('uses the success callback if the store exists with data', function() {
        var ready, storeModel;
        storeModel = model.clone();
        storeModel.storeName = 'store-exists';
        localStorage.setItem(storeModel.storeName, "1,2,3");
        ready = false;
        return runs(function() {
          dualsync('read', storeModel, {
            success: (function() {
              return ready = true;
            }),
            errorStatus: 0
          });
          return waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
        });
      });
      return it('success if server errors and Store exists with no entries', function() {
        var ready, storeModel;
        storeModel = model.clone();
        storeModel.storeName = 'store-exists';
        localStorage.setItem(storeModel.storeName, "");
        ready = false;
        return runs(function() {
          dualsync('read', storeModel, {
            success: (function() {
              return ready = true;
            }),
            errorStatus: 0
          });
          return waitsFor((function() {
            return ready;
          }), "The success callback should have been called", 100);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=dualsync_spec.map
