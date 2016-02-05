import Rx from 'rx'

export function makeMapDriver (map, options = {}) {
  let handlers = []
  // serialize all the date from map by default
  // it is more safe to work with plain data
  let {serialize = true} = options

  // TODO: remove support of change event?
  function get (eventType = 'change', path) {
    var splits = Array.isArray(eventType)
      ? eventType
      : (eventType = eventType.trim()) && eventType.split(' ')

    // if multiple props returns object
    // {prop1$: ..., prop2$: /..}
    // in convention with https://github.com/staltz/combineLatestObj
    if (splits.length > 1) {
      return splits.reduce((obj, s) => {
        obj[s.replace(/\./g, '_') + '$'] = this.get(s, path)
        return obj
      }, {})
    }

    return Rx.Observable.create(observer => {
      // "change" on map (list)
      // how = "set"
      // how ="add" newVal -> added items, prevVal -> undefined
      // how = "removed" newVal -> undefined, prevVal -> removed items

      // TODO: find out way to say if map is list
      // "add" on list
      // "remove" on list (no "removed'!)
      // ev, added/removed items, howMany
      // there are also sets like "replace", "slice"...

      var setNextAttrValue = (val) => {
        val = serialize &&
          val && val.serialize && val.serialize() ||
          val

        observer.onNext(val)
      }

      var isAttrEvent = ['change', 'remove', 'add'].indexOf(eventType) < 0
      let handler = function (ev, attr, how, newVal, prevVal) {
        var args = Array.prototype.slice.call(arguments, 1)
        if (isAttrEvent) {
          // attr is newVal actually
          setNextAttrValue(attr)
        } else {
          observer.onNext(args)
        }
      }

      // TODO: make dynamic? too complex.
      var bindTo = path ? map.attr(path) : map

      if (!bindTo) {
        console.warn('[cycle-can] can not bind', eventType, 'path', path)
        return
      }

      // for attribute events set initial value
      if (isAttrEvent) {
        setNextAttrValue(bindTo.attr(eventType))
      }

      bindTo.bind(eventType, handler)
      handlers.push({eventType, handler})

      return function dispose () {
        bindTo.unbind(eventType, handler)
      }
    })
  }
  // we take either attr object
  // that will be passed to map.attr,
  // or array: first item is attribute name, second is value
  function publish (event) {
    if (Array.isArray(event)) {
      map.attr(event[0], event[1])
    } else {
      map.attr(event)
    }
  }
  return function mapDriver (events$) {
    events$.forEach(event => publish(event))
    return {
      get,
      dispose: () => handlers.forEach(h => map.unbind(h.eventType, h.handler))
    }
  }
}
