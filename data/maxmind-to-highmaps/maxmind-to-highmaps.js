import { RU } from './RU';
import { UA } from './UA';


export const maxmindToHighmaps = {
    regions: {
        RU,
        UA
    },
    mapsPaths: {
        UA: 'countries/ua',
        RU: 'countries/ru/custom/ru-all-disputed',
        worldPalestine: 'custom/world-palestine'
    }
};
