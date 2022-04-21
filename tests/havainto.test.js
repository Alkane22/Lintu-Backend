const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Havainto = require('../models/havainto')
const Lintu = require('../models/lintu')
const User = require('../models/user')
const havainto = require('../models/havainto')

describe('can add/del /api/havainnot', () => {
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
        //await Lintu.deleteMany({})
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

    test('adding havaintos with out auth', async () => {
        //await Havainto.deleteMany({})

        await Promise.all(
            helper.initialHavaintos.map(async (hav) => {
                const res = await api
                    .post('/api/havainnot/')
                    .send(hav)
                    .expect(400)
            })
        )

        const amount = await Havainto.countDocuments({})
        expect(amount).toBe(3)
    })

    
    test('deleting havaintos wihtout auth', async () => {
        const mlist = await helper.havainnotDB()

        await Promise.all(
            mlist.map(async (hav) => {
                const res = await api
                    .del(`/api/havainnot/${hav.id}`)
                    .expect(400)
            })
        )
    })

    test('deleting havaintos', async () => {
        const mlist = await helper.havainnotDB()

        await Promise.all(
            mlist.map(async (hav) => {
                const res = await api
                    .del(`/api/havainnot/${hav.id}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(200)
            })
        )
    })
}) 