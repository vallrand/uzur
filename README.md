# Uzur

[![github-pages Status](https://github.com/vallrand/uzur/workflows/github-pages/badge.svg)](https://github.com/vallrand/uzur/actions)

Side-Scrolling prototype.
[Demo](http://vallrand.github.io/uzur/index.html)

### Development
```sh
npm install
npm run build
npm run start
```

### Debug

| URL Parameter | Default | Description |
| ------ | ------ | ------ |
| mobile | false | Enable mobile UI |
| seed | random | specify seed for RNG |
| volume | 1 | Global sound volume |

Example:
`http://127.0.0.1:8888?mobile=true&seed=7&volume=0.3`