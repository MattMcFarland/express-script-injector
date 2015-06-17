/*!
* express-script-injector
* Copyright(c) 2015 Matt McFarland
* MIT Licensed
*/

/**
 * Module dependencies.
 * @private
 */

var fs = require('fs');

module.exports = expressScriptInjector;

/**
 * Expose configuration for express-script-injector middleware
 *
 * @api public
 * @param {Object} options Injector options
 * @returns {expressScriptInjector}
 */
function expressScriptInjector(options) {


    // Configuration Section

    var opts = options || {},
        defaultScript,
        cache = {};

    // path must be defined
    if (!opts.path) {
        throw new Error('Path is undefined\nInvocation of expressScriptInjector requires the path option');
    }

    // Add trailing slash to path if it does not exist
    if (!endsWith(opts.path, "/")) {
        opts.path = opts.path + "/";
    }

    // Apply default configurations if necessary.
    if (!opts.debug)        opts.debug = false;         // Enable debugging to console  (default: false)
    if (!opts.script)       opts.script = 'index.js';   // Default script to inject  (default: index.js)
    if (!opts.enableCache)  opts.enableCache = false;   // Cache previously loaded scripts to RAM  (default: false)
    if (!opts.useRoute)     opts.useRoute = false;      /* Experimental; If set to true, it will attempt to match the root route
                                                        and load a script with the same name.  If it does not
                                                        find a file, it "falls back" to opts.script.
                                                        set this to false to only use opts.script.  (default: false) */

    if (opts.script.indexOf('/') > -1) {
        throw new Error('The script "' + opts.script + '"may not include a path, use [options.path] (with trailing slash) instead.');
    }


    /**
     * Provide debug logging
     * If debugging is enabled, then it echos all arguments passed into the console.
     * @param {arguments}
     * @return void
     */
    function debug() {
        if (opts.debug) {
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    }

    defaultScript = opts.path + opts.script;

    // End Configuration Section




  /**
   * Provide connect/express-style middleware
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @param {Function} next
   * @return {*}
   */
    return function(req, res, next) {

        var target, name;

        function getScript(target) {
            try {
                debug('getScript =>' + target);
                fs.readFile(target, function (err, data) {
                    if (err) {
                        if (target === defaultScript) {
                            next(err);
                        } else {
                            target = defaultScript;
                            getScript(target);
                        }
                    } else {
                        try {
                            req._script = '<script id="injector-' + name +
                                '" type="application/javascript">' + data +
                                '</script>';
                            if (opts.enableCache) {
                                cache[name] = req._script;
                            }
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                });
            } catch (e) {
                next(e);
            }
        }

        try {
            if (opts.useRoute) {
                target = '/' + (req.path.split('/')[1] + '.js');
            } else {
                target = defaultScript;
            }
            name = target.split('.')[0].split('/').pop();
        } catch (e) {
            throw new Error('injector options error\n', e);
        }

        if (opts.enableCache && cache[name]) {
            try {
                debug('injector=> cache enabled');
                req._script = cache[name];
                next();
            } catch (e) {
                next(e);
            }
        } else {
            getScript(target);
        }

    };
}

/**
 * Helper function to test if a string ends with supplied suffix
 * @param str {String} Test this string
 * @param suffix {String} See if it ends with this argument
 * @returns {boolean}
 */

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}