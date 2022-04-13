const wikiRouter = require('express').Router()
const request = require('request')

const wikisearch = (haku, callback) => {
    const url =
        "https://fi.wikipedia.org/w/api.php?action=query&titles=" +
        haku +
        "&format=json&formatversion=2&prop=extracts&exintro&explaintext&exsentences=4";
    request({ uri: url, json: true }, (error, response, body) => {
        if (error) {
            callback("ei yhteyttä darkboxiin", undefined);
        } else if (body.error) {
            callback("Ei oo paikkaa", undefined);
        } else {
            //callback(undefined, body.query.pages[0].extract);
            callback(undefined, body.query.pages);
        }
    });
};

wikiRouter.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Example http://localhost:3001/api/wiki/koli')
})

wikiRouter.get('/:id', (req, res) => {
    wikisearch(req.params.id, (error, data) => {
        if(!error){
            res.json(data[0])
        }
    })
})


module.exports = wikiRouter