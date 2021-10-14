/// <reference path="lexical.ts">

//  Token[] -> Token(Syntax tree)
const SyntaxTree = (_token : Token[]) : Token => {
    let stack : Token[] = [];
    if (_token.length > 2 && _token[1].value.match(/[+\-*/]?=/)) {
        stack.push(_token[0]);
        Expression(_token, 2, stack);
        Operate(_token[1], stack);
    } else {
        Expression(_token, 0, stack);
    }
    if (stack.length !== 1) {
        throw new Error("Error in SyntaxTree : stack.length !== 1.");
    }
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
    if (_token[idx].kind === "operator" && _token[idx].value === '_') {
        let op : Token = _token[idx];
        idx = Factor(_token, ++idx, _stack);
        Operate(op, _stack);
        return idx;
    } else {
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
}

const Operate = (_op : Token, _stack : Token[]) => {
    if (_op.kind === "operator" && _op.value === '_') {
        if (_stack.length < 1) {
            throw new Error("Error in SyntaxTree : stack.length < 1.");
        }
        let b1 : Token = _stack.pop();
        _op.children.push(b1);
        _stack.push(_op);
    } else {
        if (_stack.length < 2) {
            console.log(_stack);
            throw new Error("Error in SyntaxTree : stack.length < 2.");
        }
        let b2 : Token = _stack.pop(), b1 : Token = _stack.pop();
        _op.children.push(b1);
        _op.children.push(b2);
        _stack.push(_op);
    }
}