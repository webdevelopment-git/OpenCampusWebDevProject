document.addEventListener("DOMContentLoaded", function() {
    addListeners();
    checkKeyNeeded();
});

let latestCipher = "";
let latestKey = "";
let keyEncodings = ["Caesar", "XOR"];
let darkMode = true;

let morseCode = {a:".-", b:"-...", c:"-.-.", d:"-..", e:".", f:"..-.", g:"--.",
                 h:"....", i:"..", j:".---", k:"-.-", l:".-..", m:"--", n:"-.",
                 o:"---", p:".--.", q:"--.-", r:".-.", s:"...", t:"-", u:"..-",
                 v:"...-", w:".--", x:"-..-", y:"-.--", z:"--..",
                 1:".----", 2:"..---", 3:"...--", 4:"....-", 5:".....",
                 6:"-....", 7:"--...", 8:"---..", 9:"----.", 0:"-----"};

let morseCodeReverse = {".-":"a", "-...":"b", "-.-.":"c", "-..":"d", ".":"e",
                        "..-.":"f", "--.":"g", "....":"h", "..":"i", ".---":"j",
                        "-.-":"k", ".-..":"l", "--":"m", "-.":"n", "---":"o",
                        ".--.":"p", "--.-":"q", ".-.":"r", "...":"s", "-":"t",
                        "..-":"u", "...-":"v", ".--":"w", "-..-":"x",
                        "-.--":"y", "--..":"z", ".----":"1", "..---":"2",
                        "...--":"3", "....-":"4", ".....":"5", "-....":"6",
                        "--...":"7", "---..":"8", "----.":"9", "-----":"9"};

function addListeners() {
    document.getElementById("encode").addEventListener("click", function(){
        encode();
    });
    document.getElementById("decode").addEventListener("click", function(){
        decode();
    });
    document.getElementById("sendMail").addEventListener("click", function(){
        sendMail();
    });
    document.getElementById("encodingSelect").addEventListener("change",
    function(){
        checkKeyNeeded();
    });
    document.getElementById("viewMode").addEventListener("click", function() {
        switchViewMode();
    });
    document.getElementById("customColors").addEventListener("click",
    function() {
        document.getElementById("customColorDialogue").style.visibility=
        "visible";
    });
    document.getElementById("customColorClose").addEventListener("click",
    function() {
        document.getElementById("customColorDialogue").style.visibility=
        "hidden";
    });
    document.getElementById("customColorConfirm").addEventListener("click",
    function() {
        useCustomColors();
    });
}

function checkKeyNeeded() {
    let encoding = document.getElementById("encodingSelect").value;
    if (keyEncodings.indexOf(encoding) != -1) {
        document.getElementById("keyLabel").style.visibility = "visible";
        document.getElementById("key").style.visibility = "visible";
    } else {
        document.getElementById("keyLabel").style.visibility = "hidden";
        document.getElementById("key").style.visibility = "hidden";
    }
}

function encode() {
    let plaintext = document.getElementById("plaintext").value;
    let encoding = document.getElementById("encodingSelect").value;
    latestCipher = encoding;
    let encodedText = "";
    switch (encoding) {
        case "ASCII":
            encodedText = encodeASCII(plaintext);
            break;
        
        case "Binary":
            encodedText = encodeBinary(plaintext);
            break;

        case "Caesar":
            encodedText = encodeCaesar(plaintext);
            break;

        case "Hexadecimal":
            encodedText = encodeHexadecimal(plaintext);
            break;

        case "Morse":
            encodedText = encodeMorse(plaintext);
            break;
        
        case "ROT13":
            encodedText = deencodeROT13(plaintext);
            break;
        
        case "XOR":
            encodedText = encodeXOR(plaintext);
            break;
    }
    slowWrite(document.getElementById("encodedText"), encodedText);
}

function decode() {
    let encodedText = document.getElementById("encodedText").value;
    let encoding = document.getElementById("encodingSelect").value;
    let plaintext = "";
    switch (encoding) {
        case "ASCII":
            plaintext = decodeASCII(encodedText);
            break;
        
        case "Binary":
            plaintext = decodeBinary(encodedText);
            break;

        case "Caesar":
            plaintext = decodeCaesar(encodedText);
            break;
        
        case "Hexadecimal":
            plaintext = decodeHexadecimal(encodedText);
            break;

        case "Morse":
            plaintext = decodeMorse(encodedText);
            break;
        
        case "ROT13":
            plaintext = deencodeROT13(encodedText);
            break;
        
        case "XOR":
            plaintext = decodeXOR(encodedText);
            break;
    }
    slowWrite(document.getElementById("plaintext"), plaintext);
}

function encodeASCII(plaintext) {
    let temp = plaintext.split("\n").join(" ");
    let letters = [];
    for (let i = 0; i < temp.length; i++) {
        letters[i] = temp.charCodeAt(i);
    }
    return letters.join(", ");
}

function decodeASCII(encodedText) {
    let letters = encodedText.split(",\n").join(", ").split(", ");
    for (let i = 0; i < letters.length; i++) {
        letters[i] = String.fromCharCode(parseInt(letters[i]));
    }
    return letters.join("");
}

function encodeBinary(plaintext) {
    let letters = plaintext.split("\n").join(" ").split("");
    for (let i = 0; i < letters.length; i++) {
        letters[i] = binarize(letters[i].charCodeAt());
    }
    return letters.join(" ");
}

function binarize(integer) {
    let bin = "";
    while (integer != 0) {
        if (integer%2 == 1) {
            bin = "1" + bin;
            integer -= 1;
        } else {
            bin = "0" + bin;
        }
        integer /= 2;
    }
    while (bin.length < 8) {
        bin = "0" + bin;
    }
    return bin;
}

function decodeBinary(encodedText) {
    let letters = encodedText.split("\n").join(" ").split(" ");
    for (let i = 0; i < letters.length; i++) {
        letters[i] = String.fromCharCode(decimalize(letters[i]));
    }
    return letters.join("");
}

function decimalize(binary) {
    let dec = 0;
    for (let i = binary.length-1; i >= 0; i--) {
        dec = dec + (binary[i]*(2**(binary.length-1-i)));
    }
    return dec;
}

function encodeCaesar(plaintext) {
    let letters = plaintext.split("\n").join(" ").split("");
    let offset = parseInt(document.getElementById("key").value);
    if (offset != offset) {
        alert("This cipher needs a key. Please enter an integer as offset.");
    } else {
        latestKey = "" + offset;
        for (let i = 0; i < letters.length; i++) {
            let charCode = letters[i].charCodeAt();
            if (97 <= charCode && charCode <= 122) {
                charCode = (((((charCode - 97) + offset) % 26) + 26) % 26) + 97;
            } else if (65 <= charCode && charCode <= 90) {
                charCode = (((((charCode - 65) + offset) % 26) + 26) % 26) + 65;
            }
            letters[i] = String.fromCharCode(charCode);
        }
        return letters.join("");
    }
}

function decodeCaesar(encodedText) {
    let letters = encodedText.split("\n").join(" ").split("");
    let offset = parseInt(document.getElementById("key").value);
    if (offset != offset) {
        alert("This cipher needs a key. Please enter an integer as offset.");
    } else {
        for (let i = 0; i < letters.length; i++) {
            let charCode = letters[i].charCodeAt();
            if (97 <= charCode && charCode <= 122) {
                charCode = (((((charCode - 97) - offset) % 26) + 26) % 26) + 97;
            } else if (65 <= charCode && charCode <= 90) {
                charCode = (((((charCode - 65) - offset) % 26) + 26) % 26) + 65;
            }
            letters[i] = String.fromCharCode(charCode);
        }
        return letters.join("");
    }
}

function encodeHexadecimal(plaintext) {
    let letters = plaintext.split("");
    for (let i = 0; i < letters.length; i++) {
        letters[i] = hexadecimalize(letters[i].charCodeAt());
    }
    return letters.join(" ");
}

function hexadecimalize(integer) {
    let digits = [];
    digits[1] = hexadecimalizeDigit(integer % 16);
    digits[0] = hexadecimalizeDigit((integer-(integer%16))/16);
    return digits.join("");
}

function hexadecimalizeDigit(intDigit) {
    if (intDigit < 10) {
        return ""+intDigit;
    } else {
        return String.fromCharCode(intDigit + 55);
    }
}

function decodeHexadecimal(encodedText) {
    let letters = encodedText.split(" ");
    for (let i = 0; i < letters.length; i ++) {
        letters[i] = String.fromCharCode(decimalizeHex(letters[i]));
    }
    return letters.join("");
}

function decimalizeHex(hexadecimal) {
    let digits = hexadecimal.split("");
    return decimalizeHexDigit(digits[0]) * 16 + decimalizeHexDigit(digits[1]);
}

function decimalizeHexDigit(hexDigit) {
    let decDigit = Number.parseInt(hexDigit);
    if (decDigit != decDigit) {
        decDigit = hexDigit.charCodeAt();
        if (97 <= decDigit && decDigit <= 102) {
            decDigit -= 87;
        } else if (65 <= decDigit && decDigit <= 70) {
            decDigit -= 55;
        } else {
            decDigit = 0;
        }
    }
    return decDigit;
}

function encodeMorse(plaintext) {
    let words = plaintext.toLowerCase().split("\n").join(" ").split(" ");
    for (let i = 0; i < words.length; i++) {
        let letters = words[i].split("");
        for (let j = 0; j < letters.length; j++) {
            if (morseCode[letters[j]] != undefined) {
                letters[j] = morseCode[letters[j]];
            }
        }
        words[i] = letters.join(" ");
    }
    return morseBeatutify(words.join("   "));
}

function decodeMorse(encodedText) {
    let words = morseDebeautify(encodedText).split("\n").join("   ").split("   ");
    for (let i = 0; i < words.length; i++) {
        let letters = words[i].split(" ");
        for (let j = 0; j < letters.length; j++) {
            if (morseCodeReverse[letters[j]] != undefined) {
                letters[j] = morseCodeReverse[letters[j]];
            }
        }
        words[i] = letters.join("");
    }
    return words.join(" ").toUpperCase();
}

function morseBeatutify(str) {
    let letters = str.split("");
    for (let i = 0; i < letters.length; i++) {
        if (letters[i] == ".") {
            letters[i] = "·";
        }
    }
    return letters.join("");
}

function morseDebeautify(str) {
    let letters = str.split("");
    for (let i = 0; i < letters.length; i++) {
        if (letters[i] == "·") {
            letters[i] = ".";
        }
    }
    return letters.join("");
}

function deencodeROT13(string) {
    let letters = string.split("\n").join(" ").split("");
    for (let i = 0; i < letters.length; i++) {
        let charCode = letters[i].charCodeAt();
        if (97 <= charCode && charCode <= 122) {
            charCode = (((((charCode - 97) + 13) % 26) + 26) % 26) + 97;
        } else if (65 <= charCode && charCode <= 90) {
            charCode = (((((charCode - 65) + 13) % 26) + 26) % 26) + 65;
        }
        letters[i] = String.fromCharCode(charCode);
    }
    return letters.join("");
}

function encodeXOR(plaintext) {
    let binarizedPlaintext = encodeBinary(plaintext);
    let result = decodeBinary(deencodeXOR(binarizedPlaintext));
    return result;
}

function decodeXOR(encodedText) {
    let result = deencodeXOR(encodeBinary(encodedText));
    return decodeBinary(result);
}

function deencodeXOR(binText) {
    let key = document.getElementById("key").value;
    let longKey = "";
    while (longKey.length*8 < binText.length) {
        longKey += key;
    }
    longKey = encodeBinary(longKey);
    let result = [];
    for (let i = 0; i < binText.length; i++) {
        result[i] = digitXOR(binText[i], longKey[i]);
    }
    return result.join("");
}

function digitXOR(digit1, digit2) {
    if (digit1 == " " || digit2 == " ") {
        return " ";
    } else {
        if ((digit1 == "0" && digit2 == "0") || (digit1 == "1" && digit2 == "1")) {
            return "0";
        } else {
            return 1;
        }
    }
}

function sendMail() {
    let payload = document.getElementById("encodedText").value;
    if (keyEncodings.indexOf(latestCipher) != -1) {
        payload = "Used Cipher: " + latestCipher + "%0d%0a" + "Used key:    " +
        latestKey + "%0d%0a%0d%0a" + "Encoded text:%0d%0a" + payload;
    } else {
        payload = "Used Cipher: " + latestCipher + "%0d%0a%0d%0a" + "Encoded text:%0d%0a" +
        payload;
    }
    window.open("mailto:?body=" + payload);
}

function slowWrite(element, text) {
    for (let i = 1; i <= text.length; i++) {
        setTimeout(function(){element.value = text.substring(0,i);}, i * 75);
    }
}

function switchViewMode() {
    let switchViewButton = document.getElementById("viewMode");
    let fontElements = document.getElementsByClassName("font");
    let typeableElements = document.getElementsByClassName("typeable");
    let clickableElements = document.getElementsByClassName("clickable");
    let arrows = document.getElementsByClassName("arrow");
    if (darkMode) {
        for (let i = 0; i < fontElements.length; i++) {
            fontElements[i].style.color = "#000000";
        }
        for (let i = 0; i < typeableElements.length; i++) {
            typeableElements[i].style.backgroundColor = "#DDDDDD";
            typeableElements[i].style.borderColor = "#000000";
        }
        for (let i = 0; i < clickableElements.length; i++) {
            clickableElements[i].style.color = "#000000";
            clickableElements[i].style.backgroundColor = "#AAAAAA";
        }
        for (let i = 0; i < arrows.length; i++) {
            arrows[i].setAttribute("fill", "#AAAAAA");
            arrows[i].setAttribute("stroke", "#AAAAAA");
        }
        document.body.style.backgroundColor = "#FFFFFF";
        document.getElementById("favIcon").href="../Images/lockIcon_light.svg";
        switchViewButton.innerHTML = "Night Mode";
        darkMode = false;
    } else {
        for (let i = 0; i < fontElements.length; i++) {
            fontElements[i].style.color = "#006600";
        }
        for (let i = 0; i < typeableElements.length; i++) {
            typeableElements[i].style.backgroundColor = "#000000";
            typeableElements[i].style.borderColor = "#006600";
        }
        for (let i = 0; i < clickableElements.length; i++) {
            clickableElements[i].style.color = "#000000";
            clickableElements[i].style.backgroundColor = "#506050";
        }
        for (let i = 0; i < arrows.length; i++) {
            arrows[i].setAttribute("fill", "#506050");
            arrows[i].setAttribute("stroke", "#506050");
        }
        document.body.style.backgroundColor = "#112222";
        document.getElementById("favIcon").href="../Images/lockIcon_dark.svg";
        switchViewButton.innerHTML = "Day Mode";
        darkMode = true;
    }
}

function useCustomColors() {
    let fontElements = document.getElementsByClassName("font");
    let typeableElements = document.getElementsByClassName("typeable");
    let clickableElements = document.getElementsByClassName("clickable");
    let arrows = document.getElementsByClassName("arrow");
    let lockParts = document.getElementsByClassName("lockPart");
    let fontColor = markHexValue(document.getElementById("customFont").value);
    let typeableColor =
    markHexValue(document.getElementById("customTypeable").value);
    let clickableColor =
    markHexValue(document.getElementById("customClickable").value);
    let clickableFontColor =
    markHexValue(document.getElementById("customClickableFont").value);
    let customBackgroundColor =
    markHexValue(document.getElementById("customBackground").value);
    if (isNoValidColor(fontColor)) {
        fontColor = "#006600";
        alert("Invalid color entered for 'Font color'.")
    }
    if (isNoValidColor(typeableColor)) {
        typeableColor = "#000000";
        alert("Invalid color entered for 'Text box color'.")
    }
    if (isNoValidColor(clickableColor)) {
        clickableColor = "#506050";
        alert("Invalid color entered for 'Clickable element color'.")
    }
    if (isNoValidColor(clickableFontColor)) {
        clickableFontColor = "#000000";
        alert("Invalid color entered for 'Clickable element font color'.")
    }
    if (isNoValidColor(customBackgroundColor)) {
        customBackgroundColor = "#112222";
        alert("Invalid color entered for 'Background color'.")
    }
    for (let i = 0; i < fontElements.length; i++) {
        fontElements[i].style.color = fontColor;
    }
    for (let i = 0; i < typeableElements.length; i++) {
        typeableElements[i].style.backgroundColor = typeableColor;
        typeableElements[i].style.borderColor = fontColor;
    }
    for (let i = 0; i < clickableElements.length; i++) {
        clickableElements[i].style.color = clickableFontColor;
        clickableElements[i].style.backgroundColor = clickableColor;
    }
    for (let i = 0; i < arrows.length; i++) {
        arrows[i].setAttribute("fill", clickableColor);
        arrows[i].setAttribute("stroke", clickableColor);
    }
    document.body.style.backgroundColor = customBackgroundColor;
    for (let i = 0; i < lockParts.length; i++) {
        lockParts[i].setAttribute("fill", typeableColor);
        lockParts[i].setAttribute("stroke", typeableColor);
    }
    document.getElementsByClassName("lockShackle")[0].setAttribute("fill",
    typeableColor);
}

function isNoValidColor(str) {
    if (str[0] == "#") {
        str = str.substring(1, str.length);
    }
    if (str.length != 6) {
        return true;
    } else {
        for (let i = 0; i < str.length; i++) {
            if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B",
            "C", "D", "E", "F"].indexOf(str[i]) == -1) {
                return true;
            }
        }
    }
    return false;
}

function markHexValue(str) {
    if (str[0] == "#") {
        return str;
    } else {
        return "#"+str;
    }
}