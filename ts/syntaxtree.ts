/// <reference path="lexical.ts">

//  Syntax Tree generator class
class SyntaxTreeGenerator {
    token : Token[];
    stack : string[];
    idx;
    sseavx : string;
    type : string;

    constructor(_tkn : Token[], _sseavx : string, _type : string) {
        this.token = _tkn;
        this.stack = [];
        this.idx = 0;
        this.sseavx = _sseavx;
        this.type = _type;
        this.Expression();
    }

    Expression = () => {
        this.Term();
        while (this.idx < this.token.length && (this.token[this.idx].value === '+' || this.token[this.idx].value === '-')) {
            let op : string = this.token[this.idx].value;
            ++this.idx;
            this.Term();
            this.Operate(op);
        }
    }

    Term = () => {
        this.Factor();
        while (this.idx < this.token.length && (this.token[this.idx].value === '*' || this.token[this.idx].value === '/')) {
            let op : string = this.token[this.idx].value;
            ++this.idx;
            this.Factor();
            this.Operate(op);
        }
    }

    Factor = () => {
        if (this.token[this.idx].kind === "string" || this.token[this.idx].kind === "number") {
            this.stack.push(this.token[this.idx].value);
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

    Operate = (_op : string) => {
        let d2 : string = this.stack.pop(), d1 : string = this.stack.pop();
        switch (_op) {
        case '+': this.stack.push(`_mm${this.sseavx}_add_${this.type}(${d1}, ${d2})`); break;
        case '-': this.stack.push(`_mm${this.sseavx}_sub_${this.type}(${d1}, ${d2})`); break;
        case '*': this.stack.push(`_mm${this.sseavx}_mul_${this.type}(${d1}, ${d2})`); break;
        case '/': this.stack.push(`_mm${this.sseavx}_div_${this.type}(${d1}, ${d2})`); break;
        }
    }
}