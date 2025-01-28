import {createHash} from 'node:crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const PUBLIC_KEY = process.env.PUBKEY;
const PRIVATE_KEY = process.env.PRIKEY;

/**
 * Récupère les données de l'endpoint en utilisant les identifiants
 * particuliers developer.marvels.com
 * @param url l'end-point
 * @return {Promise<json>}
 */
export const getData = async (url) => {
    try {
        const ts = new Date().getTime().toString();
        const hash = await getHash(PUBLIC_KEY, PRIVATE_KEY, ts);

        const noParams = url.indexOf('?') === -1;
        const debutParam = noParams ? '?' : '&';

        const finalUrl = url + debutParam + 'ts=' + ts + '&apikey=' + PUBLIC_KEY + '&hash=' + hash;

        const response = await fetch(finalUrl);
        if (!response.ok) {
            throw new Error(`L'API a répondu avec le statut : ${response.status}`);
        }
        
        const res = await response.json();
        if (!res.data || !res.data.results) {
            throw new Error('Format de réponse inattendu');
        }

        const triThumbnailValid = res.data.results.filter((char) => {
            return char.thumbnail && char.thumbnail.path && 
                   char.thumbnail.path.indexOf('image_not_available') === -1;
        });

        return triThumbnailValid.map((char) => ({
            ...char,
            imageUrl: `${char.thumbnail.path}.${char.thumbnail.extension}`
        }));
    } catch (error) {
        console.error('Erreur', error);
        throw error;
    }
}

/**
 * Calcul la valeur md5 dans l'ordre : timestamp+privateKey+publicKey
 * cf documentation developer.marvels.com
 * @param publicKey
 * @param privateKey
 * @param timestamp
 * @return {Promise<ArrayBuffer>} en hexadecimal
 */
export const getHash = async (publicKey, privateKey, timestamp) => {
    return createHash('md5').update(`${timestamp}${privateKey}${publicKey}`).digest('hex');
}