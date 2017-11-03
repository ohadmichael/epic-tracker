function AuthService() {
    return {
        check: check
    };

    function check(input) {
        return getHash(input) === 827497775;
    }

    function getHash(s) {
        var hash = 0, i, chr, len;
        if (s.length === 0) return hash;
        for (i = 0, len = s.length; i < len; i++) {
            chr   = s.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    };
};

module.exports = AuthService;