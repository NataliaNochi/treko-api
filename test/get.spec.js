import chai from 'chai';
import chaiHttp from 'chai-http';
import tasksModel from '../models/task'

chai.use(chaiHttp);

const app = require('../app');
const request = chai.request.agent(app);
const expect = chai.expect;

describe('get', () => {

    before((done) => {
        tasksModel.deleteMany({});
        done()
    })

    context('Verificar tarefas', () => {

        before('Inserir tarefas', (done) => {
            let tasks = [
                { title: 'Estudar NodeJs', owner: 'eu@test.com', done: false },
                { title: 'Fazer compras', owner: 'vc@test.com', done: false },
                { title: 'Estudar MongoDB', owner: 'eles@test.com', done: true },
            ]

            tasksModel.insertMany(tasks);
            done()
        })

        it('Deve retornar uma lista', (done) => {
            request
                .get('/task')
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    expect(res.body.data).to.be.an('array');
                    done();
                })
        })

        it('Deve filtrar por palavra chave', (done) => {
            request
                .get('/task')
                .query({ title: 'Estudar' })
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    expect(res.body.data[0].title).to.equal('Estudar NodeJs')
                    expect(res.body.data[1].title).to.equal('Estudar MongoDB')
                    done();
                })
        })
    })

    context('Quando busco por id', () => {
        it('Deve retornar uma unica tarefa', (done) => {
            let tasks = [
                { title: 'Ler um livro de javascript', owner: 'eu@teste.com', done: false },
            ]

            tasksModel.insertMany(tasks, (err, result) => {
                let id = result[0]._id  //após inserir o objeto tasks, retorna o atributo _id que foi inserido
               
                request
                    .get('/task/' + id)
                    .end((err, res) => {
                        expect(res.status).to.eql(200);
                        expect(res.body.data.title).to.equal(tasks[0].title);
                        done();
                    })
            });
        })
    })

    context('Quando tarefa não existe', () => {
        it('Deve retornar 404', (done) => {
            let id = require('mongoose').Types.ObjectId();
            request
                .get('/task/' + id)
                .end((err, res) => {
                    expect(res.status).to.eql(404);
                    expect(res.body).to.eql({});
                    done();
                })
        })
    })
})
