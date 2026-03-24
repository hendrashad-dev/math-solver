const mahtInput = document.getElementById("mahtInput");
const solveButton = document.getElementById("solveButton");
const resultBox = document.getElementById("resultBox");

solveButton.onclick = function () {
    const inputValue = mahtInput.value;

    if (inputValue == "") {
        alert("Please type something first!");
        return;
    }

    try {
        const theAnswer = eval(inputValue);
        resultBox.innerHTML = "The answer is: " + theAnswer;
        
        resultBox.style.color = "green";
    } catch (error) {
        resultBox.innerHTML = "Sorry, I can't solve this!";
        resultBox.style.color = "red";
    }
}

mahtInput.onkeydown = function(e) {
    if (e.key === 'Enter') {
        solveButton.onclick();
    }
};
