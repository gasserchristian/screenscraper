# README

The screen scaper allows to take full screenshots from a list of web links.

## Installation

NodeJS and a chromium web browser have to be installed.

```bash
npm install
npm run serve
```

Please verify if the web browser is installed at the path `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`. If it is not the case, you can adapt the path in `serve.js` at line `409`.

## Scap some links

Check that there is a root folder called `images` and a folder called `links`. If it is not the case, you can create both empty folders. In the `links` folder, you can put several JSON files containing lists of URLs. For instance in a file called `example.json`:

```json
[
    "urlA",
    "urlB"
]
```

By running the command `npm run serve`, you will obtain the local adress such as `localhost:3000`. Open that adress in you favorite web browser to open the GUI. Then you can decide which JSON file you want to have screenshots of the websites and in which format (mobile phone, desktop or tablet). Additionnally, you have the possibility to add a prefix to the output image name.

## Features

- screenshots in mobile/desktop/tablet format, landscape or portrait mode
- the json of url can be added manually or requested on the wikidata database or from openstreetmap

## Involved libraries

- express.js for API running
- nodedemon for auto refresh
- puppeteer to take control of the browser
- axios for making REST requests