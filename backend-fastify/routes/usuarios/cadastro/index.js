'use strict'

const bcrypt = require('bcrypt')
const { trace, SpanStatusCode } = require('@opentelemetry/api')
const tracer = trace.getTracer('usuario-service')

module.exports = async function (fastify, opts) {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                    nome: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    senha: { type: 'string', minLength: 6 }
                }
            }
        }
    }, async (request, reply) => {
        const { nome, email, senha } = request.body

        return tracer.startActiveSpan('usuarios.cadastrar', async (span) => {
            try {
                const passwordHash = await bcrypt.hash(senha, 10)

                const novoUsuario = await fastify.prisma.$transaction(async (tx) => {
                    const user = await tx.usuario.create({
                        data: {
                            nome,
                            email,
                            senha: passwordHash
                        }
                    })

                    // Cria a conta com número aleatório de 6 dígitos e saldo inicial de R$ 1000
                    const numeroConta = Math.floor(100000 + Math.random() * 900000).toString()
                    
                    await tx.conta.create({
                        data: {
                            numero: numeroConta,
                            saldo: 1000.00,
                            usuarioId: user.id
                        }
                    })

                    return user
                })

                span.setAttribute('usuario.id', novoUsuario.id)

                return reply.code(201).send({
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email
                })

            } catch (err) {
                span.recordException(err)
                span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })

                // Prisma (P2002 = Unique Constraint)
                if (err.code === 'P2002') {
                    span.addEvent('cadastro_falhou_email_duplicado')
                    throw fastify.httpErrors.conflict('E-mail já cadastrado no sistema')
                }

                throw err
            } finally {
                span.end()
            }
        })
    })
}