/// <reference path="lexical.ts">
/// <reference path="syntaxtree.ts">
/// <reference path="optimizer.ts">
/// <reference path="sseavx.ts">

//  About HTML
const $form_sseavx : HTMLFormElement = <HTMLFormElement>document.getElementById('form_sseavx');
const $form_fma : HTMLFormElement = <HTMLFormElement>document.getElementById('form_fma');
const $form_type : HTMLFormElement = <HTMLFormElement>document.getElementById('form_type');
const $input_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('input_equation');
const $output_equation : HTMLInputElement = <HTMLInputElement>document.getElementById('output_equation');
const onChange = (event) : void => {
    if ($input_equation.value) {
        let token : Token[] = Lexical($input_equation.value);
        try {
            let tree : Token =  SyntaxTree(token);
            if ($form_fma.elements['radio_fma'].value === 'yes') {
                MoveUpSign(tree);
                RemoveSign(tree);
                ShuffleTree(tree);
                ReplaceFMA(tree);
            }
            console.log(tree);
            $output_equation.value = SSEAVX(tree, $form_sseavx.elements['radio_sseavx'].value, $form_type.elements['radio_type'].value);
        } catch (e) {
            alert(e);
        }
    }
}
$form_sseavx.addEventListener('change', onChange);
$form_fma.addEventListener('change', onChange);
$form_type.addEventListener('change', onChange);
$input_equation.addEventListener('change', onChange);

const $button_delete : HTMLButtonElement = <HTMLButtonElement>document.getElementById('button_delete');
$button_delete.addEventListener('click', (event) : void => {
    $input_equation.value = "";
    $output_equation.value = "";
});

const $button_copy : HTMLButtonElement = <HTMLButtonElement>document.getElementById('button_copy');
$button_copy.addEventListener('click', (event) : void => {
    navigator.clipboard.writeText($output_equation.value);
});