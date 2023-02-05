# node-quill-converter 
This repo was forked from extended-node-quill-converter (which was forked from node-quill-converter) and heavily customized to support all StudEzy custom elements.

## Getting Started
### Convert a plain text string to a Quill delta:
```js
const { convertTextToDelta } = require('node-quill-converter');

let text = 'hello, world';
let delta = convertTextToDelta(text);

console.log(JSON.stringify(delta)); // {"ops":[{"insert":"hello, world\n"}]}
```

### Convert a HTML string to a Quill delta:
```js
const { convertHtmlToDelta } = require('node-quill-converter');

let htmlString = '<p>hello, <strong>world</strong></p>';
let delta = convertHtmlToDelta(htmlString);

console.log(JSON.stringify(delta); // {"ops":[{"insert":"hello, "},{"insert":"world","attributes":{"bold":true}}]}
```

### Convert a Quill delta to an HTML string:
```js
const { convertDeltaToHtml } = require('node-quill-converter');

let html = await convertDeltaToHtml(delta);

console.log(html) ; // '<p>hello, <strong>world</strong></p>'
```

## License
MIT License Copyright (c) 2018 Joel Colucci, 2023 Noel Aeby