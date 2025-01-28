import Fastify from 'fastify';

import {getData } from "./api.js";
import fastifyStatic from "@fastify/static";
import path from "path";
import handlebars from 'handlebars';
import fastifyView from '@fastify/view';

const app = Fastify();
const __dirname = path.resolve();

app.register(fastifyStatic, {
    root: path.join(__dirname, 'templates')
});

app.register(fastifyView, {
    engine: {
        handlebars: handlebars
    },
    templates: 'templates',
    options: {
        partials: {
            header: path.join('header.hbs'),
            footer: path.join('footer.hbs')
        }
    }
});

app.get('/', async (request, reply) => {
    try {
        const data = await getData("https://gateway.marvel.com:443/v1/public/characters");
        return reply.view("index.hbs", { data: data });
    } catch (err) {
        console.error("Erreur : ", err);
        return reply.status(500).send(err.message);
    }
});

const start = async () => {
    try {
        await app.listen({ 
            port: 3000, 
            host: '0.0.0.0'
        });
        console.log('Serveur en marche');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();