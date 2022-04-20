const request = require('request')
const Wikiapi = require('wikiapi')
const jPath = require('JSONPath');

const searchWiki = async (name) => {
    const wiki =  new Wikiapi('fi')

    //The page might not exist so im using try&catch. this doesn't feel like the best solution but anyways..
    try {
        //Find wikipedia article with requested id(name)
        const page_data = await wiki.page(name, {})

        const parsed = page_data.parse();
        let infobox;

        //Read Infobox templates, convert to JSON.
        parsed.each('template', template_token => {
            if (template_token.name.startsWith('Taksonomia/eläimet')) {
                infobox = template_token.parameters;
                return parsed.each.exit;
            }
        });

        for (const [key, value] of Object.entries(infobox)){
            
            if(key === 'kuva'){
                let parsedUrl = value.replaceAll(' ', '_')
                infobox[key] = `https://commons.wikimedia.org/wiki/File:${parsedUrl}`
                //infobox[key] = `https://upload.wikimedia.org/wikipedia/commons/e/e5/${parsedUrl}`
                continue
            }
            /* wikipedia api is full of inconsistencies.......
            if(key === 'lahko' || key === 'heimo' || key === 'suku'){
                //get finnish name of lahko, we dont need latin here
                infobox[key] = value[0][0][0]
                continue
            }
            if(key === 'status'|| key === 'laji'){
                infobox[key] = value[0]
                continue
            }
            */
            infobox[key] = value.toString();
        }

        return infobox
    } catch (e) {
        //cant parse be because page was not found or maybe wiki is down or something.
        return null
    }
}

module.exports = {
    searchWiki
}