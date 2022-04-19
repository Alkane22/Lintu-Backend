const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const havainto = require('../models/havainto')


beforeEach(async () => {
    await havainto.deleteMany({})
    const havainnot = helper.initialHavaintos.map(i => new havainto(i))
    const promiseArray = havainnot.map(i => i.save())

    await Promise.all(promiseArray)
})

test('add havainto', async () => {

    const newHavainto = {
        observations: { Naurulokki: 7 },
        county: "Kuopio",
        location: { Latitude: 8, Longitude: 9 },
        user: "625e976a05636ccf65890b9e",
        info: "Näin lokin, annoin sille ranskalaisen."
    }

    await api
        .post('/api/havainnot')
        .send(newHavainto)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/havainnot')

    const contents = response.body.map(r => r.info)

    expect(response.body).toHaveLength(helper.initialHavaintos.length + 1)
    //console.log(response)
    expect(contents).toContain('Näin lokin, annoin sille ranskalaisen.')
})