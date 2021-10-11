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
//  Syntax Tree generator class
var SyntaxTreeGenerator = /** @class */ (function () {
    function SyntaxTreeGenerator(_tkn, _sseavx, _type) {
        var _this = this;
        this.Expression = function () {
            _this.Term();
            while (_this.idx < _this.token.length && (_this.token[_this.idx].value === '+' || _this.token[_this.idx].value === '-')) {
                var op = _this.token[_this.idx].value;
                ++_this.idx;
                _this.Term();
                _this.Operate(op);
            }
        };
        this.Term = function () {
            _this.Factor();
            while (_this.idx < _this.token.length && (_this.token[_this.idx].value === '*' || _this.token[_this.idx].value === '/')) {
                var op = _this.token[_this.idx].value;
                ++_this.idx;
                _this.Factor();
                _this.Operate(op);
            }
        };
        this.Factor = function () {
            if (_this.token[_this.idx].kind === "string" || _this.token[_this.idx].kind === "number") {
                _this.stack.push(_this.token[_this.idx].value);
            }
            else if (_this.token[_this.idx].value === '(') {
                ++_this.idx;
                _this.Expression();
                if (_this.token[_this.idx].value !== ')') {
                    throw new Error("Error in Factor : ')' is missing.");
                }
            }
            else {
                throw new Error("Error in Factor()");
            }
            ++_this.idx;
        };
        this.Operate = function (_op) {
            var d2 = _this.stack.pop(), d1 = _this.stack.pop();
            switch (_op) {
                case '+':
                    _this.stack.push("_mm" + _this.sseavx + "_add_" + _this.type + "(" + d1 + ", " + d2 + ")");
                    break;
                case '-':
                    _this.stack.push("_mm" + _this.sseavx + "_sub_" + _this.type + "(" + d1 + ", " + d2 + ")");
                    break;
                case '*':
                    _this.stack.push("_mm" + _this.sseavx + "_mul_" + _this.type + "(" + d1 + ", " + d2 + ")");
                    break;
                case '/':
                    _this.stack.push("_mm" + _this.sseavx + "_div_" + _this.type + "(" + d1 + ", " + d2 + ")");
                    break;
            }
        };
        this.token = _tkn;
        this.stack = [];
        this.idx = 0;
        this.sseavx = _sseavx;
        this.type = _type;
        this.Expression();
    }
    return SyntaxTreeGenerator;
}());
//  About HTML
var $form_sseavx = document.getElementById('form_sseavx');
var $form_type = document.getElementById('form_type');
var $input_equation = document.getElementById('input_equation');
var $output_equation = document.getElementById('output_equation');
var onChange = function (event) {
    var token = Lexical($input_equation.value);
    try {
        var generator = new SyntaxTreeGenerator(token, $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
        $output_equation.value = generator.stack[0];
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
