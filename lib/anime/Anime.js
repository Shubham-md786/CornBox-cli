import slugify from 'slugify';

// mal-scraper

class Anime {
    constructor(animeName /*, language*/) {
        this.animeName = animeName;
        // this.language = language;
        this.slug = animeName.replace(/\s/g, '%20');
        //slugify(this.animeName, { lower: true, trim: true });
    }
}

export default Anime;
