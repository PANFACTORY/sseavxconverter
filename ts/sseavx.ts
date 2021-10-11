/// <reference path="syntaxtree.ts">

//  Token[](Syntaxtree) -> string
const SSEAVX = (_node : Token) : string => {
    if (_node.kind === "operator") {
        switch (_node.value) {
        case '+': return `_mm256_add_pd(${SSEAVX(_node.children[0])}, ${SSEAVX(_node.children[1])})`;
        case '-': return `_mm256_sub_pd(${SSEAVX(_node.children[0])}, ${SSEAVX(_node.children[1])})`;
        case '*': return `_mm256_mul_pd(${SSEAVX(_node.children[0])}, ${SSEAVX(_node.children[1])})`;
        case '/': return `_mm256_div_pd(${SSEAVX(_node.children[0])}, ${SSEAVX(_node.children[1])})`;
        }
    } else if (_node.kind === "number") {
        return `_mm256_set1_pd(${_node.value})`;
    } else {
        return _node.value;
    }
} 