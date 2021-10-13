/// <reference path="lexical.ts">
/// <reference path="syntaxtree.ts">
/// <reference path="optimizer.ts">
/// <reference path="sseavx.ts">
//  About HTML
var $form_sseavx = document.getElementById('form_sseavx');
var $form_type = document.getElementById('form_type');
var $input_equation = document.getElementById('input_equation');
var $output_equation = document.getElementById('output_equation');
var onChange = function (event) {
    var token = Lexical($input_equation.value);
    try {
        var tree = SyntaxTree(token);
        MoveSign(tree);
        //RemoveSign(tree);
        console.log(tree);
        //ShuffleTree(tree);
        //FMA(tree);
        $output_equation.value = SSEAVX(tree, $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
    }
    catch (e) {
        alert(e);
    }
};
$form_sseavx.addEventListener('change', onChange);
$form_type.addEventListener('change', onChange);
$input_equation.addEventListener('change', onChange);
var $button_copy = document.getElementById('button_copy');
$button_copy.addEventListener('click', function (event) {
    navigator.clipboard.writeText($output_equation.value);
});
//  string -> token[]
var Lexical = function (_str) {
    var out = [];
    for (var i = 0; i < _str.length;) {
        if (!_str[i]) { //  空白なら読み飛ばす
            ++i;
        }
        else if (_str[i].match(/[()+\-*/]/)) { //  符号もしくは演算子のとき
            if (_str[i] === '-' && (out.length === 0 || out[out.length - 1].kind === "operator")) {
                out.push({ kind: "operator", value: '_', children: [] });
            }
            else {
                out.push({ kind: "operator", value: _str[i], children: [] });
            }
            ++i;
        }
        else { //  変数もしくは数値のとき
            var token = { kind: "", value: "", children: [] };
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
/// <reference path="lexical.ts">
//  Token[] -> Token(Syntax tree)
var SyntaxTree = function (_token) {
    var idx = 0;
    var stack = [];
    Expression(_token, idx, stack);
    return stack[0];
};
var Expression = function (_token, _idx, _stack) {
    var idx = Term(_token, _idx, _stack);
    while (idx < _token.length && (_token[idx].value === '+' || _token[idx].value === '-')) {
        var op = _token[idx];
        idx = Term(_token, ++idx, _stack);
        Operate(op, _stack);
    }
    return idx;
};
var Term = function (_token, _idx, _stack) {
    var idx = Factor(_token, _idx, _stack);
    while (idx < _token.length && (_token[idx].value === '*' || _token[idx].value === '/')) {
        var op = _token[idx];
        idx = Factor(_token, ++idx, _stack);
        Operate(op, _stack);
    }
    return idx;
};
var Factor = function (_token, _idx, _stack) {
    var idx = _idx;
    if (_token[idx].kind === "operator" && _token[idx].value === '_') {
        var op = _token[idx];
        idx = Factor(_token, ++idx, _stack);
        Operate(op, _stack);
        return idx;
    }
    else {
        if (_token[idx].kind === "string" || _token[idx].kind === "number") {
            _stack.push(_token[idx]);
        }
        else if (_token[idx].value === '(') {
            idx = Expression(_token, ++idx, _stack);
            if (_token[idx].value !== ')') {
                throw new Error("Error in Factor : ')' is missing.");
            }
        }
        else {
            throw new Error("Error in Factor()");
        }
        return ++idx;
    }
};
var Operate = function (_op, _stack) {
    if (_op.value === '_') {
        var b1 = _stack.pop();
        _op.children.push(b1);
        _stack.push(_op);
    }
    else {
        var b2 = _stack.pop(), b1 = _stack.pop();
        _op.children.push(b1);
        _op.children.push(b2);
        _stack.push(_op);
    }
};
/// <reference path="syntaxtree.ts">
//  Token[](Syntaxtree) -> string
var SSEAVX = function (_node, _simd, _type) {
    if (_node.kind === "operator") {
        switch (_node.value) {
            case "(*+)": return "_mm" + _simd + "_fmadd_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ", " + SSEAVX(_node.children[2], _simd, _type) + ")";
            case "(*-)": return "_mm" + _simd + "_fmsub_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ", " + SSEAVX(_node.children[2], _simd, _type) + ")";
            case '+': return "_mm" + _simd + "_add_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ")";
            case '-': return "_mm" + _simd + "_sub_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ")";
            case '*': return "_mm" + _simd + "_mul_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ")";
            case '/': return "_mm" + _simd + "_div_" + _type + "(" + SSEAVX(_node.children[0], _simd, _type) + ", " + SSEAVX(_node.children[1], _simd, _type) + ")";
            case '_': return "_mm" + _simd + "_mul_" + _type + "(_mm" + _simd + "_set1_" + _type + "(-1.0), " + SSEAVX(_node.children[0], _simd, _type) + ")";
        }
    }
    else if (_node.kind === "number") {
        return "_mm" + _simd + "_set1_" + _type + "(" + _node.value + ")";
    }
    else {
        return _node.value;
    }
};
/// <reference path="lexical.ts">
//  Token(Syntax tree) -> Token(Syntax tree)
var MoveSign = function (_node) {
    for (var i = 0; i < _node.children.length; ++i) {
        MoveSign(_node.children[i]);
    }
    if ((_node.value === '*' || _node.value === '/') &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b1 = _node.children[0].children.pop();
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.pop();
        _node.children.push(b1);
        _node.children.push(b2);
    }
    else if ((_node.value === '*' || _node.value === '/') &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_') {
        var b2 = _node.children.pop();
        _node.children[0].children.push(b2);
        var op = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    }
    else if ((_node.value === '*' || _node.value === '/') &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b1 = _node.children.shift();
        _node.children[0].children.unshift(b1);
        var op = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    }
    else if (_node.value === '+' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '+';
    }
    else if (_node.value === '+' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_') {
        var b2 = _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '-';
    }
    else if (_node.value === '+' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b1 = _node.children.shift();
        _node.children[0].children.push(b1);
        _node.value = '_';
        _node.children[0].value = '-';
    }
    else if (_node.value === '-' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '-';
    }
    else if (_node.value === '-' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_') {
        var b2 = _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '+';
    }
    else if (_node.value === '-' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.value = '+';
    }
};
//  Token(Syntax tree) -> Token(Syntax tree)
var RemoveSign = function (_node) {
    for (var i = 0; i < _node.children.length; ++i) {
        RemoveSign(_node.children[i]);
    }
    if (_node.value === '_' && _node.children[0].kind === "operator" && _node.children[0].value === '-') {
        var b2 = _node.children[0].children.pop();
        var b1 = _node.children[0].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.children.push(b1);
        _node.value = '-';
    }
    else if (_node.value === '+' && _node.children[0].kind === "operator" && _node.children[0].value === '_') {
        var b1 = _node.children[0].children.pop();
        _node.children.shift();
        _node.children.push(b1);
        _node.value = '-';
    }
    else if (_node.value === '+' && _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.value = '-';
    }
    else if (_node.value === '-' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b1 = _node.children[0].children.pop();
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.children.push(b1);
    }
    else if (_node.value === '-' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_') {
        var b2 = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.value = '+';
    }
};
/*
//  Token(Syntax tree) -> Token(Syntax tree)
const MoveDownSign = (_node : Token) => {
    if (_node.value === '_' && _node.value === '*') {
        let b2 : Token = _node.children[0].children.pop();
        _node.children.push(b2);
        _node.value = '*';
        _node.children[0].value = '_';
    } else if (_node.value === '*' && _node.children[1].value === '_') {
        let b2 : Token = _node.children[1].children.pop();
        let b1 : Token = _node.children.shift();
        _node.children[0].children.push(b1);
        _node.children.push(b2);
    }
    for (let i = 0; i < _node.length; ++i) {
        MoveDownSign(_node.children[i]);
    }
}

//  Token(Syntax tree) -> Token(Syntax tree)
const ShuffleTree = (_node : Token) => {
    if ((_node.value === '+' || _node.value === '-') &&
        (_node.children[0].value === '+' || _node.children[0].value === '-') &&
        _node.children[0].children[0].value === '*' &&
        _node.children[0].children[1].value === '*' &&
        _node.children[1].value !== '*'
    ) {
        let b1 : Token = _node.children[0].children.pop();
        let b2 : Token = _node.children.pop();
        _node.children.push(b1);
        _node.children[0].children.push(b2);
        let op : string = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    } else if (
        _node.value === '+' &&
        (_node.children[1].value === '+' || _node.children[1].value === '-') &&
        _node.children[1].children[0].value === '*' &&
        _node.children[1].children[1].value === '*' &&
        _node.children[0].value !== '*'
    ) {
        
    }
    for (let i = 0; i < _node.children.length; ++i) {
        ShuffleTree(_node.children[i]);
    }
}

//  Token(Syntax tree) -> Token(Syntax tree)
const ReplaceFMA = (_node : Token) => {
    if (_node.value === '_' && (_node.children[0].value === '+' || _node.children[0].value === '-')) {
        if (_node.children[0].children[0].value === '*') {
            let op : string = _node.children[0].value;
            let b3 : Token = _node.children[0].children.pop();
            let b2 : Token = _node.children[0].children[0].pop();
            let b1 : Token = _node.children[0].children[0].pop();
            _node.children[0].children.pop();
            _node.children.pop();
            _node.children.push(b1);
            _node.children.push(b2);
            _node.children.push(b3);
            _node.value = `(_*${op})`;
        } else if (_node.children[0].children[1].value === '*') {
            let op : string = _node.children[0].value;
            let b3 : Token = _node.children[0].chilren[1].pop();
            let b2 : Token = _node.children[0].chilren[1].pop();
            _node.children[0].children.pop();
            let b1 : Token = _node.children[0].children.pop();
            _node.children.pop();
            _node.push(b2);
            _node.push(b3);
            _node.push(b1);
            _node.value = op === '+' ? "(_*-)" : "(*-)";
        }
    } else if (_node.value === '+' || _node.value === '-') {
        if (_node.children[0].value === '*') {
            let b2 : Token = _node.children[0].children.pop(), b1 : Token = _node.children[0].children.pop();
            _node.children.shift();
            _node.children.unshift(b2);
            _node.children.unshift(b1);
            _node.value = `(*${_node.value})`;
        } else if (_node.children[1].value === '*') {
            let b2 : Token = _node.children[1].children.pop(), b1 : Token = _node.children[1].children.pop();
            _node.children.pop();
            _node.children.unshift(b2);
            _node.children.unshift(b1);
            _node.value = _node.value === '+' ? "(*+)" : "(_*-)";
        }
    }
    for (let i = 0; i < _node.children.length; ++i) {
        ReplaceFMA(_node.children[i]);
    }
}*/ 
