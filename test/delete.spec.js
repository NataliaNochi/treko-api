import chai from 'chai';
import chaiHttp from 'chai-http';
import tasksModel from '../models/task'
import { get } from 'mongoose';

chai.use(chaiHttp);

const app = require('../app');
const request = chai.request.agent(app);
const expect = chai.expect;

describe('delete', () => {

    context('Quando apago uma tarefa', () => {
        let task = {
            _id: require('mongoose').Types.ObjectId(),
            title: 'Pagar conta de celular',
            owner: 'eu@test.com',
            done: false
        }

        before((done) => {
            tasksModel.insertMany([task])
            done()
        })

        it('Deve retornar 200', (done) => {
            request
                .delete('/task/' + task._id)
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    expect(res.body).to.eql({})
                    done()
                })
        })

        after('Deve retornar 404', (done) => {
            request
                .delete('/task/' + task._id)
                .end((err, res) => {
                    expect(res.status).to.eql(404);
                    done()
                })
        })
    })

    context('Quando a tarefa não existe', () => {
        it('Deve retornar 404', (done) => {
            let idInexistent = require('mongoose').Types.ObjectId();
            request
                .delete('/task/' + idInexistent)
                .end((err, res) => {
                    expect(res.status).to.eql(404);
                    expect(res.body).to.eql({})
                    done()
                })

        })
    })
})
