import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import sinon from 'sinon';

describe('Database Configuration', () => {
    let consoleLogStub: sinon.SinonStub;
    let consoleErrorStub: sinon.SinonStub;
    let processExitStub: sinon.SinonStub;
    let mongooseConnectStub: sinon.SinonStub;
    let originalMongoDb: string | undefined;

    beforeEach(() => {

        originalMongoDb = process.env.MONGO_DB;


        consoleLogStub = sinon.stub(console, 'log');
        consoleErrorStub = sinon.stub(console, 'error');


        processExitStub = sinon.stub(process, 'exit').callsFake(() => {
            throw new Error('process.exit called');
        });

        mongooseConnectStub = sinon.stub(mongoose, 'connect');
    });

    afterEach(() => {

        consoleLogStub.restore();
        consoleErrorStub.restore();
        processExitStub.restore();
        mongooseConnectStub.restore();


        if (originalMongoDb !== undefined) {
            process.env.MONGO_DB = originalMongoDb;
        } else {
            delete process.env.MONGO_DB;
        }
    });

    describe('connectDB', () => {
        it('should successfully connect to MongoDB with configured URI', async () => {

            mongooseConnectStub.resolves();

            const { connectDB } = await import('../config/database.js');
            await connectDB();

            expect(mongooseConnectStub.calledOnce).to.be.true;
            expect(consoleLogStub.calledWith('✅ Connecté à MongoDB Atlas !')).to.be.true;

            // Check if mongoose.connect was called with correct options structure
            const callArgs = mongooseConnectStub.getCall(0).args;
            expect(callArgs[1]).to.deep.equal({
                serverApi: {
                    version: "1",
                    strict: true,
                    deprecationErrors: true,
                },
            });
        });

        it('should handle connection errors and exit process', async () => {
            const connectionError = new Error('Connection failed');
            mongooseConnectStub.rejects(connectionError);

            const { connectDB } = await import('../config/database.js');

            try {
                await connectDB();

                expect.fail('Expected connectDB to throw');
            } catch (error: any) {
                expect(error.message).to.equal('process.exit called');
            }

            expect(mongooseConnectStub.calledOnce).to.be.true;
            expect(consoleErrorStub.calledWith('❌ Erreur de connexion MongoDB :', connectionError)).to.be.true;
            expect(processExitStub.calledWith(1)).to.be.true;
        });

        it('should pass correct options to mongoose.connect', async () => {
            mongooseConnectStub.resolves();

            const { connectDB } = await import('../config/database.js');
            await connectDB();

            const expectedOptions = {
                serverApi: {
                    version: "1",
                    strict: true,
                    deprecationErrors: true,
                },
            };

            expect(mongooseConnectStub.calledOnce).to.be.true;
            const callArgs = mongooseConnectStub.getCall(0).args;
            expect(callArgs[1]).to.deep.equal(expectedOptions);
        });

        it('should handle different types of connection errors', async () => {

            const networkError = new Error('Network error');
            mongooseConnectStub.rejects(networkError);

            const { connectDB } = await import('../config/database.js');

            try {
                await connectDB();
                expect.fail('Expected connectDB to throw');
            } catch (error: any) {
                expect(error.message).to.equal('process.exit called');
            }

            expect(consoleErrorStub.calledWith('❌ Erreur de connexion MongoDB :', networkError)).to.be.true;
            expect(processExitStub.calledWith(1)).to.be.true;
        });

        it('should handle timeout errors', async () => {
            const timeoutError = new Error('Server selection timeout');
            mongooseConnectStub.rejects(timeoutError);

            const { connectDB } = await import('../config/database.js');

            try {
                await connectDB();
                expect.fail('Expected connectDB to throw');
            } catch (error: any) {
                expect(error.message).to.equal('process.exit called');
            }

            expect(consoleErrorStub.calledWith('❌ Erreur de connexion MongoDB :', timeoutError)).to.be.true;
            expect(processExitStub.calledWith(1)).to.be.true;
        });

        it('should handle authentication errors', async () => {
            const authError = new Error('Authentication failed');
            mongooseConnectStub.rejects(authError);

            const { connectDB } = await import('../config/database.js');

            try {
                await connectDB();
                expect.fail('Expected connectDB to throw');
            } catch (error: any) {
                expect(error.message).to.equal('process.exit called');
            }

            expect(consoleErrorStub.calledWith('❌ Erreur de connexion MongoDB :', authError)).to.be.true;
            expect(processExitStub.calledWith(1)).to.be.true;
        });
    });
});