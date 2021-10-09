const Order = (_ch : string) : number => {
    switch (_ch) {
    case '*': case '/': return 3;
    case '+': case '-': return 2;
    case '(':           return 1;
    }
    return -1;
}

const Polish = (_str : string) : string => {
    let out : string = "";
    const stack : string[] = [];
    let wk : string;
    for(let i = 0; i < _str.length; ++i) {
        if (!_str[i]) {                             //  空白なら読み飛ばす
            continue;
        } else if (_str[i].match(/^[a-zA-Z]+$/)) {  //  変数のとき
            out += _str[i]; //  2文字以上の変数名に対応したい
        } else if (_str[i].match(/^[0-9]+$/)) {     //  数値のとき
            out += _str[i]; //  実数に対応したい
        } else if (_str[i].match(/^\($/)) {         //  '('のとき
            stack.push('(');
        } else if (_str[i].match(/^\)$/)) {         //  ')'のとき
            wk = stack.pop();
            while(!wk.match(/^\($/)) {
                if (!stack.length) {
                    console.log("'('が不足しています");
                    break;  //  例外を投げる様に変更したい
                }
                out += wk;
                wk = stack.pop();
            }
        } else {                                    //  演算子のとき
            while (stack.length && Order(stack[stack.length - 1]) >= Order(_str[i])) {
                out += stack.pop();
            }
            stack.push(_str[i]);
        }
    }
    while (stack.length) {
        wk = stack.pop();
        if (wk.match(/^\($/)) {
            console.log("'('が余分です");
            break;  //  例外を投げる様に変更したい
        }
        out += wk;
    }
    return out;
}

const AVX = (_str : string) : string => {
    let d1 : string, d2 : string;
    const stack : string[] = [];
    for (let i = 0; i < _str.length; ++i) {
        if (_str[i].match(/^[a-zA-Z]+$/)) {
            stack.push(_str[i]);
        } else if (_str[i].match(/^[0-9]+$/)) {
            stack.push(`_mm256_set1_pd(${_str[i]})` );
        } else {
            d2 = stack.pop();
            d1 = stack.pop();
            switch (_str[i]) {
            case '+': stack.push(`_mm256_add_pd(${d1}, ${d2})`); break;
            case '-': stack.push(`_mm256_sub_pd(${d1}, ${d2})`); break;
            case '*': stack.push(`_mm256_mul_pd(${d1}, ${d2})`); break;
            case '/': stack.push(`_mm256_div_pd(${d1}, ${d2})`); break;
            }
        }
    }
    if (stack.length != 1) {
        console.log("エラー");
    }
    return stack.pop();
}

console.log(AVX(Polish("(a+3*b)*c")));