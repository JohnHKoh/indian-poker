function makeCode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // No 'I' or 'O/0' cuz confusing lol
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function shuffle(n) {
    if (n > 52) {
        return null;
    }
    let cards = [
        //"10C.svg", // Duplicated 10s
        //"10D.svg",
        //"10H.svg",
        //"10S.svg",
        "2C.svg",
        "2D.svg",
        "2H.svg",
        "2S.svg",
        "3C.svg",
        "3D.svg",
        "3H.svg",
        "3S.svg",
        "4C.svg",
        "4D.svg",
        "4H.svg",
        "4S.svg",
        "5C.svg",
        "5D.svg",
        "5H.svg",
        "5S.svg",
        "6C.svg",
        "6D.svg",
        "6H.svg",
        "6S.svg",
        "7C.svg",
        "7D.svg",
        "7H.svg",
        "7S.svg",
        "8C.svg",
        "8D.svg",
        "8H.svg",
        "8S.svg",
        "9C.svg",
        "9D.svg",
        "9H.svg",
        "9S.svg",
        "AC.svg",
        "AD.svg",
        "AH.svg",
        "AS.svg",
        //"BLUE_BACK.svg",
        "JC.svg",
        "JD.svg",
        "JH.svg",
        "JS.svg",
        "KC.svg",
        "KD.svg",
        "KH.svg",
        "KS.svg",
        "QC.svg",
        "QD.svg",
        "QH.svg",
        "QS.svg",
        //"RED_BACK.svg",
        "TC.svg",
        "TD.svg",
        "TH.svg",
        "TS.svg"
    ];

    //Fisher-Yates shuffle
    var m = cards.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = cards[m];
        cards[m] = cards[i];
        cards[i] = t;
    }

    return cards.slice(0,n);
}

module.exports = {
    makeCode,
    shuffle
};