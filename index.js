var config, fs, green, input, log, output, pub, red, redis, reset, store, sub, tty;

redis = require('redis');

fs = require('fs');

tty = require('tty');

input = process.stdin;

output = process.stdout;

green = '\033[0;32m';

red = '\033[0;31m';

reset = '\033[0m';

try {
  config = JSON.parse(fs.readFileSync([process.env.HOME, '.frack.json'].join('/')));
  if (config.server != null) {
    sub = redis.createClient(config.port, config.server);
    if (config.password != null) sub.auth(config.password);
    pub = redis.createClient(config.port, config.server);
    if (config.password != null) pub.auth(config.password);
    store = redis.createClient(config.port, config.server);
    if (config.password != null) store.auth(config.password);
  } else {
    sub = redis.createClient();
    pub = redis.createClient();
    store = redis.createClient();
  }
  sub.subscribe(config.channel);
  store.set("" + config.channel + ":" + config.name, "online");
  process.on('exit', function() {
    return store.del("" + config.channel + ":" + config.name);
  });
  log = function(msg) {
    return process.stdout.write("\b\b" + green + "[" + msg.name + "] " + red + "-> " + reset + msg.body + "> ");
  };
  sub.on('message', function(c, m) {
    var msg;
    msg = JSON.parse(m);
    if (msg.name === config.name) {
      return log(msg);
    } else {
      return setTimeout((function() {
        return log(msg);
      }), 3000);
    }
  });
  output.write('> ');
  input.resume();
  input.on('data', function(data) {
    if (data.toString().match(/^\$/)) {
      console.log('Users Online');
      return store.keys("" + config.channel + ":*", function(e, d) {
        var user, _i, _len;
        for (_i = 0, _len = d.length; _i < _len; _i++) {
          user = d[_i];
          output.write(user.replace(/jrs:/, ''));
        }
        return output.write("\n> ");
      });
    } else {
      return pub.publish(config.channel, JSON.stringify({
        name: config.name,
        body: data.toString()
      }));
    }
  });
  input.on('end', function() {
    return console.log('Goodbye.');
  });
} catch (err) {
  console.log('config file is required');
  console.log(err);
}
