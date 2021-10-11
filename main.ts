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

//  About HTML
const $form_sseavx : HTMLFormElement = <HTMLFormElement>document.getElementById('form_sseavx');
const $form_type : HTMLFormElement = <HTMLFormElement>document.getElementById('form_type');
const $input_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('input_equation');
const $output_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('output_equation');
const onChange = (event) : void => {
    let token : Token[] = Lexical($input_equation.value);
    try {
        const generator = new SyntaxTreeGenerator(token, $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
        $output_equation.value = generator.stack[0];
    } catch (e) {
        alert(e);
    }
}
$form_sseavx.addEventListener('change', onChange);
$form_type.addEventListener('change', onChange);
$input_equation.addEventListener('change', onChange);

const $button_copy : HTMLButtonElement = <HTMLButtonElement>document.getElementById('button_copy');
$button_copy.addEventListener('click', (event) : void => {
    navigator.clipboard.writeText($output_equation.value);
});