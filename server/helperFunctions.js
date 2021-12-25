module.exports = {
    // Room id generator
    RandomId(length = 16) {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
    },
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
};
