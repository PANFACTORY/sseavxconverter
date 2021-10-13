/// <reference path="lexical.ts">

//  Token(Syntax tree) -> Token(Syntax tree)
const MoveUpSign = (_node : Token) => {
    for (let i = 0; i < _node.children.length; ++i) {
        MoveUpSign(_node.children[i]);
    }
    if (
        (_node.value === '*' || _node.value === '/') && 
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b1 : Token = _node.children[0].children.pop();
        let b2 : Token = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.pop();
        _node.children.push(b1);
        _node.children.push(b2);
    } else if (
        (_node.value === '*' || _node.value === '/') && 
        _node.children[0].kind === "operator" && _node.children[0].value === '_'
    ) {
        let b2 : Token = _node.children.pop();
        _node.children[0].children.push(b2);
        let op : string = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    } else if (
        (_node.value === '*' || _node.value === '/') && 
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b1 : Token = _node.children.shift();
        _node.children[0].children.unshift(b1);
        let op : string = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    } else if (
        _node.value === '+' && 
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b2 : Token = _node.children[1].children.pop();
        _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '+';
    } else if (
        _node.value === '+' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_'
    ) {
        let b2 : Token = _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '-';
    } else if (
        _node.value === '+' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b1 : Token = _node.children.shift();
        _node.children[0].children.push(b1);
        _node.value = '_';
        _node.children[0].value = '-';
    } else if (
        _node.value === '-' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_' &&
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b2 : Token = _node.children[1].children.pop();
        _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '-';
    } else if (
        _node.value === '-' &&
        _node.children[0].kind === "operator" && _node.children[0].value === '_'
    ) {
        let b2 : Token = _node.children.pop();
        _node.children[0].children.push(b2);
        _node.value = '_';
        _node.children[0].value = '+';
    } else if (
        _node.value === '-' && 
        _node.children[1].kind === "operator" && _node.children[1].value === '_'
    ) {
        let b2 : Token = _node.children[1].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.value = '+';
    } 
}

//  Token(Syntax tree) -> Token(Syntax tree)
const RemoveSign = (_node : Token) => {
    if (_node.value === '_' && _node.children[0].kind === "operator" && _node.children[0].value === '-') {
        let b2 : Token = _node.children[0].children.pop();
        let b1 : Token = _node.children[0].children.pop();
        _node.children.pop();
        _node.children.push(b2);
        _node.children.push(b1);
        _node.value = '-';
    }
    for (let i = 0; i < _node.children.length; ++i) {
        RemoveSign(_node.children[i]);
    }
}

//  Token(Syntax tree) -> Token(Syntax tree)
const ShuffleTree = (_node : Token) => {
    if (
        _node.value === '+' && 
        (_node.children[1].value === '+' || _node.children[1].value === '-') && 
        _node.children[1].children[0].value === '*' && 
        _node.children[1].children[1].value === '*' && 
        _node.children[0].value !== '*'
    ) {
        let b2 : Token = _node.children.pop();
        _node.children.unshift(b2);
    }

    if ((_node.value === '+' || _node.value === '-') &&
        (_node.children[0].value === '+' || _node.children[0].value === '-') && 
        _node.children[0].children[0].value === '*' && 
        _node.children[0].children[1].value === '*' && 
        _node.children[1].value !== '*'
    ) {
        let b2 : Token = _node.children[0].children.pop();
        let b3 : Token = _node.children.pop();
        _node.children.push(b2);
        _node.children[0].children.push(b3);
        let op : string = _node.value;
        _node.value = _node.children[0].value;
        _node.children[0].value = op;
    }  else if (
        _node.value === '-' && 
        _node.children[1].value === '+' && 
        _node.children[1].children[0].value === '*' && 
        _node.children[1].children[1].value === '*' && 
        _node.children[0].value !== '*'
    ) {
        let b1 : Token = _node.children.shift();
        let b3 : Token = _node.children[0].children.pop();
        _node.children[0].children.unshift(b1);
        _node.children.push(b3);
        _node.children[0].value = '-';
    }  else if (
        _node.value === '-' && 
        _node.children[1].value === '-' && 
        _node.children[1].children[0].value === '*' && 
        _node.children[1].children[1].value === '*' && 
        _node.children[0].value !== '*'
    ) {
        let b1 : Token = _node.children.shift();
        let b3 : Token = _node.children[0].children.pop();
        _node.children[0].children.unshift(b1);
        _node.children.unshift(b3);
        _node.value = '+';
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
            let b2 : Token = _node.children[0].children[0].children.pop();
            let b1 : Token = _node.children[0].children[0].children.pop();
            _node.children[0].children.pop();
            _node.children.pop();
            _node.children.push(b1);
            _node.children.push(b2);
            _node.children.push(b3);
            _node.children[0].value === '+' ? "(_*-)" : "(_*+)";
        } else if (_node.children[0].children[1].value === '*') {
            let op : string = _node.children[0].value;
            let b3 : Token = _node.children[0].children[1].children.pop();
            let b2 : Token = _node.children[0].children[1].children.pop();
            _node.children[0].children.pop();
            let b1 : Token = _node.children[0].children.pop();
            _node.children.pop();
            _node.children.push(b2);
            _node.children.push(b3);
            _node.children.push(b1);
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
            _node.value = _node.value === '+' ? "(*+)" : "(_*+)";
        }
    }
    for (let i = 0; i < _node.children.length; ++i) {
        ReplaceFMA(_node.children[i]);
    }
}