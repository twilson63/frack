var config, fs, green, input, log, output, pub, red, redis, reset, sub;

redis = require('redis');

fs = require('fs');

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
    return log(JSON.parse(m));
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
