module.exports = {

    truncate: (string, { length = 25, omission = '...' }) => {
        if (string.length <= length) {
            return string;
        }
        return `${string.slice(0, length + 1)}${omission}`;
    }

}
