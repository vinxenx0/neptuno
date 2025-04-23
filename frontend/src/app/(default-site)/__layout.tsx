// app/layout.tsx


export const metadata = {
    title: "Tu SaaS - Plataforma Inteligente",
    description: "Transforma tu negocio con nuestra solución SaaS moderna.",
    keywords: ["SaaS", "automatización", "dashboard", "software"],
    authors: [{ name: "TuEmpresa", url: "https://tusitio.com" }],
    robots: "index, follow",
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: "Tu SaaS - Plataforma Inteligente",
      description: "Transforma tu negocio con nuestra solución SaaS moderna.",
      url: "https://tusitio.com",
      siteName: "Tu SaaS",
      images: [
        {
          url: "/og-image.png", // en /public
          width: 1200,
          height: 630,
          alt: "Tu SaaS portada",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
  

// obtengo este error:Error:
//  The default export is not a React Component in "/about-us/layout"
//    at errorMissingDefaultExport (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:439:9197)
//      at createComponentTreeInternal (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:439:17214)
//      at async (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:439:19354)
//      at async createComponentTreeInternal (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:439:18746)
//      at async getRSCPayload (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:443:9560)
//      at async renderToStream (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:443:39377)
//      at async renderToHTMLOrFlightImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:443:27540)
//      at async doRender (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:1650:34)
//      at async DevServer.renderToResponseWithComponentsImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:1915:28)
//      at async DevServer.renderPageComponent (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:2393:24)
//      at async DevServer.renderToResponseImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:2430:32)
//      at async DevServer.pipeImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:1003:25)
//      at async NextNodeServer.handleCatchallRenderRequest (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/next-server.js:304:17)
//      at async DevServer.handleRequestImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/base-server.js:895:17)
//      at async (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/dev/next-dev-server.js:371:20)
//      at async Span.traceAsyncFn (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/trace/trace.js:157:20)
//      at async DevServer.handleRequest (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/dev/next-dev-server.js:368:24)
//      at async invokeRender (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/lib/router-server.js:235:21)
//      at async handleRequest (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/lib/router-server.js:426:24)
//      at async requestHandlerImpl (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/lib/router-server.js:450:13)
//      at async Server.requestListener (file:///home/vinxenxo/neptuno/neptuno/frontend/node_modules/next/dist/server/lib/start-server.js:158:13)