import chai from 'chai';
import chaiHttp from 'chai-http';
import tasksModel from '../models/task'

chai.use(chaiHttp);

const app = require('../app');
const request = chai.request.agent(app);
const expect = chai.expect;
const rabbit = chai.request('http://rabbitmq:15672');

describe('post', () => {

    context('Quando cadastro uma tarefa', () => {
        let task = { title: 'Estudar Mongoose', owner: 'test@teste.com', done: false }

        before((done) => {

            rabbit
                .delete('/api/queues/%2F/tasksdev/contents')
                .auth('guest', 'guest')
                .end((err, res) => {
                    expect(res.status).to.eql(204);
                    done();
                })
        })

        it('Deve retornar 200', (done) => {
            request
                .post('/task')
                .send(task)
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    expect(res.body.data.title).to.be.an('string');
                    expect(res.body.data.owner).to.be.an('string');
                    expect(res.body.data.done).to.be.an('boolean');
                    done();
                })
        })

        it('Deve enviar um email', (done) => {

            let payload = { vhost: "/", name: "tasksdev", truncate: "50000", ackmode: "ack_requeue_true", encoding: "auto", count: "1" }

            rabbit
                .post('/api/queues/%2F/tasksdev/get')
                .auth('guest', 'guest')
                .send(payload)
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    expect(res.body[0].payload).to.contain(`Tarefa ${task.title} criada com sucesso!`);
                    done();
                })
        })
    })

    context('Quando não informo o titulo', () => {
        let task = { title: '', owner: 'test@teste.com', done: false }

        it('Deve retornar 400', (done) => {
            request
                .post('/task')
                .send(task)
                .end((err, res) => {
                    expect(res.status).to.eql(400);
                    expect(res.body.errors.title.message).to.eql('Oops! Title is required.');
                    done();
                })
        })
    })

    context('Quando não informo o owner', () => {
        let task = { title: 'Test', owner: '', done: false }

        it('Deve retornar 400', (done) => {
            request
                .post('/task')
                .send(task)
                .end((err, res) => {
                    expect(res.status).to.eql(400);
                    expect(res.body.errors.owner.message).to.eql('Oops! Owner is required.');
                    done();
                })
        })

    })

    context('Quando a tarefa já existe', () => {
        let task = { title: 'Planejar viagem para China', owner: 'test@teste.com', done: false }

        before((done) => {
            request
                .post('/task')
                .send(task)
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    done();
                })
        })

        it('Deve retornar 409', (done) => {
            request
                .post('/task')
                .send(task)
                .end((err, res) => {
                    expect(res.status).to.eql(409);
                    expect(res.body.errmsg).to.include('duplicate key');
                    done();
                })
        })
    })
})
