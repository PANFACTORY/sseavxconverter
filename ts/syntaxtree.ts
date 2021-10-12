/// <reference path="lexical.ts">

//  Token[] -> Token(Syntax tree)
const SyntaxTree = (_token : Token[]) : Token => {
    let idx = 0;
    let stack : Token[] = [];
    Expression(_token, idx, stack);
    return stack[0];
}

const Expression = (_token : Token[], _idx, _stack : Token[]) => {
    let idx = Term(_token, _idx, _stack);
    while (idx < _token.length && (_token[idx].value === '+' || _token[idx].value === '-')) {
        let op : Token = _token[idx];
        idx = Term(_token, ++idx, _stack);
        Operate(op, _stack);
    }
    return idx;
}

const Term = (_token : Token[], _idx, _stack : Token[]) => {
    let idx = Factor(_token, _idx, _stack);
    while (idx < _token.length && (_token[idx].value === '*' || _token[idx].value === '/')) {
        let op : Token = _token[idx];
        idx = Factor(_token, ++idx, _stack);
        Operate(op, _stack);
    }
    return idx;
}

const Factor = (_token : Token[], _idx, _stack : Token[]) => {
    let idx = _idx;
    if (_token[idx].kind === "string" || _token[idx].kind === "number") {
        _stack.push(_token[idx]);
    } else if (_token[idx].value === '(') {
        idx = Expression(_token, ++idx, _stack);
        if (_token[idx].value !==')') {
            throw new Error("Error in Factor : ')' is missing.")
        }
    } else {
        throw new Error("Error in Factor()");
    }
    return ++idx;
}

const Operate = (_op : Token, _stack : Token[]) => {
    let d2 : Token = _stack.pop(), d1 : Token = _stack.pop();
    _op.children.push(d1);
    _op.children.push(d2);
    _stack.push(_op);
}

//  Token(Syntax tree) -> Token(Syntax tree)
const ShuffleTree = (_node : Token) => {
    if (_node.value === '+' || _node.value === '-') {
        if (
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
            _node.children[1].value === '+' &&
            _node.children[1].children[0].value === '*' &&
            _node.children[1].children[1].value === '*' &&
            _node.children[0].value !== '*'
        ) {
            let b1 : Token = _node.children.shift();
            let b2 : Token = _node.children[1].children.shift();
            _node.children[1].children.unshift(b1);
            _node.children.unshift(b2);
        }
    }
    for (let i = 0; i < _node.children.length; ++i) {
        ShuffleTree(_node.children[i]);
    }
}

//  Token(Syntax tree) -> Token(Syntax tree)
const FMA = (_node : Token) => {
    if (_node.value === '+' || _node.value === '-') {
        if (_node.children[0].value === '*') {
            let d2 : Token = _node.children[0].children.pop(), d1 : Token = _node.children[0].children.pop();
            _node.children.shift();
            _node.children.unshift(d2);
            _node.children.unshift(d1);
            _node.value = `(*${_node.value})`;
        } else if (_node.children[1].value === '*') {
            let d2 : Token = _node.children[1].children.pop(), d1 : Token = _node.children[1].children.pop();
            _node.children.pop();
            _node.children.unshift(d2);
            _node.children.unshift(d1);
            _node.value = `(*${_node.value})`;
        }
    }
    for (let i = 0; i < _node.children.length; ++i) {
        FMA(_node.children[i]);
    }
}