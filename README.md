This middleware was created to directly inject javascript files into `<script>` tags via templates rendered from the [Express JS](http://expressjs.com/) framework.

## Installation

```sh
npm install express-script-injector --save
```

## Usage


```js

var injector = require('express-script-injector');

var options = {
    path: __dirname + '/scripts' // **required** path to your scripts folder (default: undefined)
    debug: false // *optional* Enable debugging to console  (default: false)
    script: 'index.js' //  *optional* Script to inject  (default: index.js)
    enableCache: false //  *optional* Cache previously loaded scripts to RAM  (default: false)
    useRoute: false //  *optional* If set to true, it will attempt to match the root route and load a script with the same name. (default: false)
}

app.use(injector(options));

// OR

router.use(injector(options));
```

The injector middleware will then expose the content of a js file inside req._script, so that you can render it with a template (see example below)


## Example

This example shows how it might be used with an express application using handlebars templating.

```js

var express  = require('express'),
    exphbs   = require('express-handlebars'),
    injector = require('express-script-injector');

var app = express();

// Apply the injector middleware (note: it could also just be added to a router instead)
app.use(injector({path: __dirname + '/scripts', script: 'main.js'}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {

    // middleware exposes the content of the js file in req._script
    res.render('home', {injectedScript: req._script});

});

app.listen(3000);

```

Then somewhere in your home.hbs file:

```html
{{{injectedScript}}}
```

> This outputs the js in a `<script>` tag with the id of "injector-" + the file name

## Options

<table>
    <thead>
        <th>
            <td>Name</td>
            <td>Description</td>
            <td>Default</td>
        </th>
    </thead>
    <tbody>
        <tr>
            <td>path(required!)</td>
            <td>path to your scripts folder</td>
            <td>undefined</td>
        </tr>
        <tr>
            <td>debug</td>
            <td>Enable debugging to console</td>
            <td>false</td>
        </tr>
        <tr>
            <td>script</td>
            <td>file to inject</td>
            <td>index.js</td>
        </tr>
        <tr>
            <td>enableCache</td>
            <td>Cache previously loaded scripts to RAM</td>
            <td>false</td>
        </tr>
        <tr>
            <td>useRoute</td>
            <td>Experimental: If set to true, it will attempt to match the root route and load a script with the same name.  If it does not find a file, it "falls back" load the script option.</td>
            <td>false</td>
        </tr>
    </tbody>
</table>