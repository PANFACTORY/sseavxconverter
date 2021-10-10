//  string -> token[]
var Lexical = function (_str) {
    var out = [];
    for (var i = 0; i < _str.length;) {
        if (!_str[i]) { //  空白なら読み飛ばす
            ++i;
        }
        else if (_str[i].match(/[()+\-*/]/)) { //  符号もしくは演算子のとき
            if (_str[i] === '-' && (out.length === 0 || out[out.length - 1].kind === "operator")) {
                out.push({ kind: "operator", value: '_' });
            }
            else {
                out.push({ kind: "operator", value: _str[i] });
            }
            ++i;
        }
        else { //  変数もしくは数値のとき
            var token = { kind: "", value: "" };
            for (; i < _str.length && !_str[i].match(/[()+\-*/]/); ++i) {
                token.value += _str[i];
            }
            if (token.value.match(/\d+(?:\.\d+)?/)) {
                token.kind = "number";
            }
            else {
                token.kind = "string";
            }
            out.push(token);
        }
    }
    return out;
};
var Order = function (_ch) {
    switch (_ch) {
        case '_': return 4;
        case '*':
        case '/': return 3;
        case '+':
        case '-': return 2;
        case '(': return 1;
    }
    return -1;
};
//  token[](infix notation) -> token[](postfix notation)
var Polish = function (_eqn) {
    var out = [];
    var stack = [];
    for (var i = 0; i < _eqn.length; ++i) {
        if (_eqn[i].kind === "string" || _eqn[i].kind === "number") { //  変数または実数のとき
            out.push(_eqn[i]);
        }
        else if (_eqn[i].kind === "operator") { //  演算子のとき
            if (_eqn[i].value === '(') {
                stack.push(_eqn[i]);
            }
            else if (_eqn[i].value === ')') {
                var wk = stack.pop();
                while (wk.value !== '(') {
                    if (!stack.length) {
                        throw new Error("Error at Polish : '(' is missing.");
                    }
                    out.push(wk);
                    wk = stack.pop();
                }
            }
            else {
                while (stack.length && Order(stack[stack.length - 1].value) >= Order(_eqn[i].value)) {
                    out.push(stack.pop());
                }
                stack.push(_eqn[i]);
            }
        }
        else {
            throw new Error("Error at Polish : Unexpected token.");
        }
    }
    while (stack.length) {
        var wk = stack.pop();
        if (wk.value === '(') {
            throw new Error("Error '(' is extra.");
        }
        out.push(wk);
    }
    return out;
};
//  token[] -> string
var SSEAVX = function (_eqn, _sseavx, _type) {
    var d1, d2;
    var stack = [];
    for (var i = 0; i < _eqn.length; ++i) {
        if (_eqn[i].kind === "string") {
            stack.push(_eqn[i].value);
        }
        else if (_eqn[i].kind === "number") {
            stack.push("_mm" + _sseavx + "_set1_" + _type + "(" + _eqn[i].value + ")");
        }
        else {
            d2 = stack.pop();
            if (_eqn[i].value === '_') {
                stack.push("_mm" + _sseavx + "_mul_" + _type + "(_mm" + _sseavx + "_set1_" + _type + "(-1.0), " + d2 + ")");
            }
            else {
                d1 = stack.pop();
                switch (_eqn[i].value) {
                    case '+':
                        stack.push("_mm" + _sseavx + "_add_" + _type + "(" + d1 + ", " + d2 + ")");
                        break;
                    case '-':
                        stack.push("_mm" + _sseavx + "_sub_" + _type + "(" + d1 + ", " + d2 + ")");
                        break;
                    case '*':
                        stack.push("_mm" + _sseavx + "_mul_" + _type + "(" + d1 + ", " + d2 + ")");
                        break;
                    case '/':
                        stack.push("_mm" + _sseavx + "_div_" + _type + "(" + d1 + ", " + d2 + ")");
                        break;
                }
            }
        }
    }
    if (stack.length != 1) {
        throw new Error("Error at AVX");
    }
    return stack.pop();
};
//  About HTML
var $form_sseavx = document.getElementById('form_sseavx');
var $form_type = document.getElementById('form_type');
var $input_equation = document.getElementById('input_equation');
var $output_equation = document.getElementById('output_equation');
var onChange = function (event) {
    try {
        $output_equation.value = SSEAVX(Polish(Lexical($input_equation.value)), $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
    }
    catch (e) {
        alert(e);
    }
};
$form_sseavx.addEventListener('change', onChange);
$form_type.addEventListener('change', onChange);
$input_equation.addEventListener('change', onChange);
