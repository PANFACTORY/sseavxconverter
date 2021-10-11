/// <reference path="lexical.ts">

//  Syntax Tree generator class
class SyntaxTreeGenerator {
    token : Token[];
    stack : Token[];
    idx;
    sseavx : string;
    type : string;

    constructor(_token : Token[], _sseavx : string, _type : string) {
        this.token = _token;
        this.stack = [];
        this.idx = 0;
        this.sseavx = _sseavx;
        this.type = _type;
        this.Expression();
    }

    Expression = () => {
        this.Term();
        while (this.idx < this.token.length && (this.token[this.idx].value === '+' || this.token[this.idx].value === '-')) {
            let op : Token = this.token[this.idx];
            ++this.idx;
            this.Term();
            this.Operate(op);
        }
    }

    Term = () => {
        this.Factor();
        while (this.idx < this.token.length && (this.token[this.idx].value === '*' || this.token[this.idx].value === '/')) {
            let op : Token = this.token[this.idx];
            ++this.idx;
            this.Factor();
            this.Operate(op);
        }
    }

    Factor = () => {
        if (this.token[this.idx].kind === "string" || this.token[this.idx].kind === "number") {
            this.stack.push(this.token[this.idx]);
        } else if (this.token[this.idx].value === '(') {
            ++this.idx;
            this.Expression();
            if (this.token[this.idx].value !==')') {
                throw new Error("Error in Factor : ')' is missing.")
            }
        } else {
            throw new Error("Error in Factor()");
        }
        ++this.idx;
    }

    Operate = (_op : Token) => {
        let d2 : Token = this.stack.pop(), d1 : Token = this.stack.pop();
        _op.children.push(d1);
        _op.children.push(d2);
        this.stack.push(_op);
    }
}