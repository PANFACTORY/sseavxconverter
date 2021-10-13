/// <reference path="lexical.ts">
/// <reference path="syntaxtree.ts">
/// <reference path="optimizer.ts">
/// <reference path="sseavx.ts">

//  About HTML
const $form_sseavx : HTMLFormElement = <HTMLFormElement>document.getElementById('form_sseavx');
const $form_type : HTMLFormElement = <HTMLFormElement>document.getElementById('form_type');
const $input_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('input_equation');
const $output_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('output_equation');
const onChange = (event) : void => {
    let token : Token[] = Lexical($input_equation.value);
    try {
        let tree : Token =  SyntaxTree(token);
        MoveUpSign(tree);
        //RemoveSign(tree);
        console.log(tree);
        //ShuffleTree(tree);
        //FMA(tree);
        $output_equation.value = SSEAVX(tree, $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
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