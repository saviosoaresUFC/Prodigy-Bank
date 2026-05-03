'use strict'

module.exports = async function (fastify, opts) {
    fastify.get('/', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Retorna os dados do usuário autenticado e sua conta',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nome: { type: 'string' },
                        email: { type: 'string' },
                        conta: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                numero: { type: 'string' },
                                saldo: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { id } = request.user

        const usuario = await fastify.prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                conta: {
                    select: {
                        id: true,
                        numero: true,
                        saldo: true
                    }
                }
            }
        })

        if (!usuario) {
            return reply.code(404).send({ error: 'Usuário não encontrado' })
        }

        // Converte Decimal para Number para o JSON
        if (usuario.conta) {
            usuario.conta.saldo = Number(usuario.conta.saldo)
        }

        return usuario
    })
}
