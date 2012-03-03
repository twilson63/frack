var config, fs, green, input, log, output, pub, red, redis, reset, sub, tty;

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
    sub.auth(config.password);
    pub = redis.createClient(config.port, config.server);
    pub.auth(config.password);
  } else {
    sub = redis.createClient();
    pub = redis.createClient();
  }
  sub.subscribe(config.channel);
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
      }), 5000);
    }
  });
  output.write('> ');
  input.resume();
  input.on('data', function(data) {
    return pub.publish(config.channel, JSON.stringify({
      name: config.name,
      body: data.toString()
    }));
  });
  input.on('end', function() {
    return console.log('Goodbye.');
  });
} catch (err) {
  console.log('config file is required');
  console.log(err);
}
