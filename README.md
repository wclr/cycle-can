# Cycle-Can 
[Can.js](https://github.com/canjs/canj) driver for [Cycle.js](http://cycle.js.org/). 

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Allows to link `can.Map` with cycle.js function.

```javascirpt
let map = new can.Map({a: 1, b: 2})
 
run(main, {
  HTTP: makeHTTPDriver(),
  map: makeMapDriver(map)
})

```

Pre-alpha =)