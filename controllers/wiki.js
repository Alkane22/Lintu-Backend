const wikiRouter = require('express').Router()
const request = require('request')

const jPath = require('JSONPath');
const Wikiapi = require('wikiapi');

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

const wikiImage = (haku, koko, callback) => {
    const url = `https://fi.wikipedia.org/w/api.php?action=query&titles=${haku}&prop=pageimages&format=json&pithumbsize=${koko}`
    request({ uri: url, json: true }, (error, response, body) => {
        if (error) {
            callback("ei yhteyttä darkboxiin", undefined);
        } else if (body.error) {
            callback("Ei oo paikkaa", undefined);
        } else {
            //callback(undefined, body.query.pages[0].extract);
            callback(undefined, body.query.pages);
        }
    })
}

wikiRouter.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Example http://localhost:3001/api/wiki/info/hauki')
})

wikiRouter.get('/info/:id', (req, res) => {
    wikisearch(req.params.id, (error, data) => {
        if (!error) {
            res.json(data[0])
        }
    })
})

wikiRouter.get('/image/:id/:size', (req, res) => {
    //http://localhost:3001/api/wiki/image/hauki/200
    wikiImage(req.params.id, req.params.size, (error, data) => {
        if (!error) {
            res.json(jPath.eval(data, "$..source"))
        }
    })
})

wikiRouter.get('/wikiapi/:id', async (req, res) => {
    //Create Wikiapi object from finnish wikipedia
    const wiki = new Wikiapi('fi')

    //The page might not exist so im using try&catch. this doesn't feel like the best solution but anyways..
    try {
        //Find wikipedia article with requested id(name)
        const page_data = await wiki.page(req.params.id, {})

        const parsed = page_data.parse();
        let infobox;

        //Read Infobox templates, convert to JSON.
        parsed.each('template', template_token => {
            if (template_token.name.startsWith('Taksonomia/eläimet')) {
                infobox = template_token.parameters;
                return parsed.each.exit;
            }
        });

        for (const [key, value] of Object.entries(infobox))
            infobox[key] = value.toString();

        //respond with json of the infobox
        res.json(infobox)
    } catch (e) {
        //cant parse be because page was not found or maybe wiki is down or something.
        res.json({ error: 'notFound' })
    }
    //const page_data = await wiki.page(req.params.id, {})


})

module.exports = wikiRouter