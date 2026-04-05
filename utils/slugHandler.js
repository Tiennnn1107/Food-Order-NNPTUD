var slugify = require('slugify');

module.exports = {
    ConvertToSlug: function (text) {
        return slugify(text, {
            replacement: '-',
            lower: true,
            strict: false,
            locale: 'vi'
        });
    }
};
