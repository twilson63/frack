# Frack

> WARNING: Work In Progress...

A redis command-line chat application

## Install

``` sh
npm install frack -g
```
## Setup

Create a json settings file in your HOME directory and name it
`.frack.json`

``` json
{
  "name": "your nick name",
  "server": "redis server name",
  "port": 1000, // Redis Port
  "password": "redis server password",
  "channel": "channel you will be talking on"
}
```

## Usage

``` sh
frack
> Hello World
[foo] -> Hello World!
```
---

# Coming Soon !

## Search

``` sh
frack search foo
```
or

``` sh
frack
> $search foo
```
> Looking for all messages that contain /foo/
