interface Token {
    kind : string;
    value : string;
}

//  string -> token[]
const Lexical = (_str : string) : Token[] => {
    let out : Token[] = [];
    for(let i = 0; i < _str.length;) {
        if (!_str[i]) {                             //  空白なら読み飛ばす
            ++i;
        } else if (_str[i].match(/[()+\-*/]/)) {    //  符号もしくは演算子のとき
            if (_str[i] === '-' && (out.length === 0 || out[out.length - 1].kind === "operator")) {
                out.push({ kind : "operator", value : '_' });
            } else {
                out.push({ kind : "operator", value : _str[i] });
            }
            ++i;
        } else {                                    //  変数もしくは数値のとき
            let token : Token = { kind : "", value : "" };
            for (; i < _str.length && !_str[i].match(/[()+\-*/]/); ++i) {
                token.value += _str[i];
            }
            if (token.value.match(/\d+(?:\.\d+)?/)) {
                token.kind = "number";
            } else {
                token.kind = "string";
            }
            out.push(token);
        }
    }
    return out;
}