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

const Order = (_ch : string) : number => {
    switch (_ch) {
    case '_':           return 4;
    case '*': case '/': return 3;
    case '+': case '-': return 2;
    case '(':           return 1;
    }
    return -1;
}

//  token[](infix notation) -> token[](postfix notation)
const Polish = (_eqn : Token[]) : Token[] => {
    let out : Token[] = [];
    const stack : Token[] = [];
    for(let i = 0; i < _eqn.length; ++i) {
        if (_eqn[i].kind === "string" || _eqn[i].kind === "number") {   //  変数または実数のとき
            out.push(_eqn[i]);
        } else if (_eqn[i].kind === "operator") {                       //  演算子のとき
            if (_eqn[i].value === '(') {
                stack.push(_eqn[i]);
            } else if (_eqn[i].value === ')') {
                let wk : Token = stack.pop();
                while(wk.value !== '(') {
                    if (!stack.length) {
                        console.log("'('が不足しています");
                        break;  //  例外を投げる様に変更したい
                    }
                    out.push(wk);
                    wk = stack.pop();
                }
            } else {
                while (stack.length && Order(stack[stack.length - 1].value) >= Order(_eqn[i].value)) {
                    out.push(stack.pop());
                }
                stack.push(_eqn[i]);
            }
        } else {
            console.log("予期せぬトークンです");
            continue;   //  例外を投げる様にしたい
        }
    }
    while (stack.length) {
        let wk : Token = stack.pop();
        if (wk.value === '(') {
            console.log("'('が余分です");
            break;  //  例外を投げる様に変更したい
        }
        out.push(wk);
    }
    return out;
}

//  token[] -> string
const AVX = (_eqn : Token[]) : string => {
    let d1 : string, d2 : string;
    const stack : string[] = [];
    for (let i = 0; i < _eqn.length; ++i) {
        if (_eqn[i].kind === "string") {
            stack.push(_eqn[i].value);
        } else if (_eqn[i].kind === "number") {
            stack.push(`_mm256_set1_pd(${_eqn[i].value})` );
        } else {
            d2 = stack.pop();
            if (_eqn[i].value === '_') {
                stack.push(`_mm256_mul_pd(_mm256_set1_pd(-1.0), ${d2})`);
            } else {
                d1 = stack.pop();
                switch (_eqn[i].value) {
                case '+': stack.push(`_mm256_add_pd(${d1}, ${d2})`); break;
                case '-': stack.push(`_mm256_sub_pd(${d1}, ${d2})`); break;
                case '*': stack.push(`_mm256_mul_pd(${d1}, ${d2})`); break;
                case '/': stack.push(`_mm256_div_pd(${d1}, ${d2})`); break;
                }
            }
        }
    }
    if (stack.length != 1) {
        console.log("エラー");
    }
    return stack.pop();
}

console.log(AVX(Polish(Lexical("(_a[i]+3.0*_b[i])*(-c[i])"))));