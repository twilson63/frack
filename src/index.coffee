redis = require 'redis'
fs = require 'fs'
tty = require 'tty'
input = process.stdin
output = process.stdout

green = '\033[0;32m'
red = '\033[0;31m'
reset = '\033[0m'

# Get Server and Name
try
  config = JSON.parse(fs.readFileSync([process.env.HOME, '.frack.json'].join('/')))
  if config.server?
    sub = redis.createClient(config.port, config.server)
    sub.auth config.password if config.password?
    pub = redis.createClient(config.port, config.server)
    pub.auth config.password if config.password?
    store = redis.createClient(config.port, config.server)
    store.auth config.password if config.password?
  else
    sub = redis.createClient()
    pub = redis.createClient()
    store = redis.createClient()

  sub.subscribe config.channel
  store.set "#{config.channel}:#{config.name}", "online"

  process.on 'exit', ->
    store.del "#{config.channel}:#{config.name}"

  log = (msg) -> 
    process.stdout.write "\b\b#{green}[#{msg.name}] #{red}-> #{reset}#{msg.body}> "
  sub.on 'message', (c, m) -> 
    msg = JSON.parse(m)
    if msg.name == config.name
      log msg
    else
      setTimeout ( -> log msg), 3000

  output.write '> '

  input.resume()
  input.on 'data', (data) ->
    if data.toString().match /^\$/
      # List online users
      console.log 'Users Online'
      store.keys "#{config.channel}:*", (e, d) -> 
        output.write(user.replace(/jrs:/, '')) for user in d
        output.write "\n> "
    else
      pub.publish config.channel, JSON.stringify(name: config.name, body: data.toString())
  input.on 'end', -> console.log 'Goodbye.'

catch err
  console.log 'config file is required'
  console.log err


