'use strict'

module.exports = async function (fastify, opts) {
    // Listar transações do usuário logado
    fastify.get('/', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Retorna o histórico de transações da conta do usuário',
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            valor: { type: 'number' },
                            tipo: { type: 'string' },
                            descricao: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            isEntrada: { type: 'boolean' },
                            contato: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { id: usuarioId } = request.user

        // Busca a conta do usuário
        const conta = await fastify.prisma.conta.findUnique({
            where: { usuarioId }
        })

        if (!conta) {
            return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        // Busca transações onde a conta é origem ou destino
        const transacoes = await fastify.prisma.transacao.findMany({
            where: {
                OR: [
                    { origemContaId: conta.id },
                    { destinoContaId: conta.id }
                ]
            },
            include: {
                origem: { include: { usuario: true } },
                destino: { include: { usuario: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return transacoes.map(t => {
            const isEntrada = t.destinoContaId === conta.id
            const contato = isEntrada 
                ? (t.origem?.usuario?.nome || 'Depósito')
                : (t.destino?.usuario?.nome || 'Pagamento')

            return {
                id: t.id,
                valor: Number(t.valor),
                tipo: t.tipo,
                descricao: t.descricao,
                createdAt: t.createdAt,
                isEntrada,
                contato
            }
        })
    })

    // Realizar Transferência / PIX
    fastify.post('/transferir', {
        onRequest: [fastify.authenticate],
        schema: {
            description: 'Realiza uma transferência entre contas',
            body: {
                type: 'object',
                required: ['numeroDestino', 'valor'],
                properties: {
                    numeroDestino: { type: 'string' },
                    valor: { type: 'number', minimum: 0.01 },
                    descricao: { type: 'string', maxLength: 100 }
                }
            }
        }
    }, async (request, reply) => {
        const { id: usuarioId } = request.user
        const { numeroDestino, valor, descricao } = request.body

        try {
            const resultado = await fastify.prisma.$transaction(async (tx) => {
                // 1. Busca conta origem
                const contaOrigem = await tx.conta.findUnique({
                    where: { usuarioId }
                })

                if (!contaOrigem) throw new Error('Conta origem não encontrada')

                // 2. Busca conta destino
                const contaDestino = await tx.conta.findUnique({
                    where: { numero: numeroDestino }
                })

                if (!contaDestino) throw new Error('Conta destino não encontrada')

                if (contaOrigem.id === contaDestino.id) throw new Error('Não é possível transferir para a mesma conta')

                // 3. Valida saldo
                if (Number(contaOrigem.saldo) < valor) {
                    throw new Error('Saldo insuficiente')
                }

                // 4. Deduz saldo origem
                await tx.conta.update({
                    where: { id: contaOrigem.id },
                    data: { saldo: { decrement: valor } }
                })

                // 5. Adiciona saldo destino
                await tx.conta.update({
                    where: { id: contaDestino.id },
                    data: { saldo: { increment: valor } }
                })

                // 6. Registra transação
                return await tx.transacao.create({
                    data: {
                        valor,
                        tipo: 'PIX',
                        descricao,
                        origemContaId: contaOrigem.id,
                        destinoContaId: contaDestino.id
                    }
                })
            })

            return { success: true, transacaoId: resultado.id }

        } catch (err) {
            return reply.code(400).send({ error: err.message })
        }
    })
}
