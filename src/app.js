import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'

const PORT = process.env.PORT ?? 3008



//  const welcomeFlow = addKeyword('prueba')
//      .addAction(
//          async (ctx, { flowDynamic, provider  }) => {
//              const to = ctx.from
//              await provider.sendFile(to, './assets/presentacion1TO.pdf')
//          }
//      )

// const flowString = addKeyword('prueba')
//     .addAnswer('Estas son las categorías disponibles:', null, async (ctx, {flowDynamic}) => {
//         await flowDynamic('Enviar un mensaje text')
//         // Enviar una imagen o pdf o etc
//         await flowDynamic([
//             {
//                 body:"soy una imagen",
//                 media:'https://repositorio.uam.es/bitstream/handle/10486/698762/menus_montero_ALVIMED_2020.pdf?sequence=4',
//                 delay:1000
//             }
//         ]) 
        
//     })

// const flow = addKeyword('flow1')
//     .addAction(async (_,{flowDynamic}) => {
//         // ...db get source...
//         await flowDynamic([
//             {body:'This is an pdf', media:'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
//         ])
//         await flowDynamic([
//             {body:'This is a video', media:'https://media.giphy.com/media/KWZKwdBC2ODWlQ8kgt/giphy.mp4'}
//         ])
//     })


const cotizacion1 = addKeyword('1').addAnswer('Proyectos referenciales:', null, async (ctx, {flowDynamic}) => {
            const pathPropuesta1 = join('assets','presentacion1TO.pdf')
            await flowDynamic([
                {
                    body:"1",
                    media: pathPropuesta1
                }
                ]) 
            
        }).addAnswer(null, null, async (ctx, {flowDynamic}) => {
            const pathPropuesta2 = join('assets','propuesta2TO.pdf')
            await flowDynamic([
                {
                    body:"2",
                    media: pathPropuesta2
                }
                ]) 
            
        }).addAnswer(null, null, async (ctx, {flowDynamic}) => {
            const pathPropuesta3 = join('assets','propuesta3TO.pdf')
            await flowDynamic([
                {
                    body:"3",
                    media: pathPropuesta3
                }
                ]) 
            
        }).addAnswer(null, null, async (ctx, {flowDynamic}) => {
            const pathPropuesta4 = join('assets','cotizacion1.pdf')
            await flowDynamic([
                {
                    body:"Cotización estimada",
                    media: pathPropuesta4
                }
                ]) 
        })

    const rangoInversion1 = addKeyword('1').addAnswer(['Indícame el rango de inversión que tienes proyectado:'
        ,'*1*: S/10,000 a S/15,000'
        ,'*2*: S/16 000 a S/24 000'
        ,'*3*: S/25 000 a S/34 000'
    ], {capture:true},async (ctx, {flowDynamic}) =>{
        if(!ctx.body.includes('1')){
            return fallBack()
        }
    }, [cotizacion1])


    const rangoCotizacion1 = addKeyword('1').addAnswer(['Indícame el rango en m² que tiene tu ambiente:'
    ,'*1*: 3m² a 5m²'
    ,'*2*: 6m² a 10m²'
    ,'*3*: 11m² a 15m²'
    ,'*4*: 16m² a 20m²'
    ], {capture:true},async (ctx, {flowDynamic}) =>{
        if(!ctx.body.includes('1')){
            return fallBack()
        }
    }, [rangoInversion1])

    const flujoCotizacion1 = addKeyword('1')
    .addAnswer(['Que ambiente necesitas'
            ,'*1*: Sala comedor'
            ,'*2*: Sala cocina'
            ,'*3*: Sala dormitorio principal'
            ,'*4*: Sala dormitorio secundario'
            ,'*5*: Sala baño privado'
            ,'*6*: Sala baño de visitas'
        ], {capture:true},async (ctx, {flowDynamic}) =>{
            if(!ctx.body.includes('1')){
                return fallBack()
            }
        },[rangoCotizacion1])

        const flujoPrincipal = addKeyword(['Hola', 'hola', 'buenas'])
        .addAnswer('hola que tal te saluda ... 😊')
        .addAnswer('¿Cual es tu nombre?', {capture:true}, async (ctx,{flowDynamic}) =>{
            
            const nombre = ctx.body;
            await flowDynamic([
                {body:`Hola ${nombre}, en que te puedo ayudar hoy?`}
                
            ])
        }).addAnswer(['*1*: Cotización de diseño por m²'
            , '*2*: Cotización de implementación por depa completo m²'
            ,'*3*: Cotización de implementación por ambiente m²'],null, null, [flujoCotizacion1])

        
        const flujoAdios = addKeyword(['gracias', 'adios', 'bye', 'chau']).addAnswer('hasta luego')


        // {
        //     buttons: [{ body: 'diseño' },
        //             { body: 'implementacion'},
        //             { body: 'implementacion'}],
        // }



const main = async () => {
    const adapterFlow = createFlow([flujoPrincipal,flujoAdios])
    const adapterProvider = createProvider(Provider, {
        jwtToken: 'EAAYgzcqAN3oBO7c5DrdV6c2FnfYm31JvUXVvnJOjnSzPGj6Fxq5x7WOIE2VxxfGE2IiEZCH7MLsA6EWSqZCZAzy1BVNNUw5jtc1cYln4eu5NbhgZB8rFcmSdVDOcBa6d8MNZB6rrOWae052dCbZAljLDEZCXqIkScpGWyJDwra8wk73gumZBc5E7lCN2ARNrgcTlovDM8i2u2BmCfo4ZATQNJ3xVyxPjrnKnTxjBw',
        numberId: '392059530655358',
        verifyToken: 'asd@Safiro',
        version: 'v18.0'
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
