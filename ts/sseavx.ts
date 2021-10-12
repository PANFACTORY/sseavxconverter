/// <reference path="syntaxtree.ts">

//  Token[](Syntaxtree) -> string
const SSEAVX = (_node : Token, _simd : string, _type : string) : string => {
    if (_node.kind === "operator") {
        switch (_node.value) {
        case "(*+)": return `_mm${_simd}_fmadd_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)}, ${SSEAVX(_node.children[2], _simd, _type)})`;
        case "(*-)": return `_mm${_simd}_fmsub_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)}, ${SSEAVX(_node.children[2], _simd, _type)})`;
        case '+': return `_mm${_simd}_add_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)})`;
        case '-': return `_mm${_simd}_sub_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)})`;
        case '*': return `_mm${_simd}_mul_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)})`;
        case '/': return `_mm${_simd}_div_${_type}(${SSEAVX(_node.children[0], _simd, _type)}, ${SSEAVX(_node.children[1], _simd, _type)})`;
        case '_': return `_mm${_simd}_mul_${_type}(_mm${_simd}_set1_${_type}(-1.0), ${SSEAVX(_node.children[0], _simd, _type)})`;
        }
    } else if (_node.kind === "number") {
        return `_mm${_simd}_set1_${_type}(${_node.value})`;
    } else {
        return _node.value;
    }
} 