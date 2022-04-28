const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Havainto = require('../models/havainto')
const Lintu = require('../models/lintu')
const User = require('../models/user')
const havainto = require('../models/havainto')

describe('can add /api/havainnot', () => {
    let token = ''
    let birdsJSON = []

    beforeEach(async () => {
        const userObject = {
            username: 'admin',
            password: 'admin'
        }

        const response = await api
            .post('/api/user/login')
            .send(userObject)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        token = response.body.token
    })

    test('adding birds', async () => {
        await Lintu.deleteMany({})
        await Promise.all(
            helper.birdnames.map(async (bird) => {
                const res = await api.get(`/api/havainnot/search/${bird}`)
            })
        )

        const amount = await Lintu.countDocuments({})
        expect(amount).toBe(19)
    })

    test('adding havaintos', async () => {
        await Havainto.deleteMany({})

        await Promise.all(
            helper.initialHavaintos.map(async (hav) => {
                const res = await api
                    .post('/api/havainnot/')
                    .set('Authorization', 'bearer ' + token)
                    .send(hav)
                    .expect(201)
            })
        )

        const amount = await Havainto.countDocuments({})
        expect(amount).toBe(3)
    })
}) 