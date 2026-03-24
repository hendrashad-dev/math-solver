const mahtInput = document.getElementById("mahtInput");
const solveButton = document.getElementById("solveButton");
const resultBox = document.getElementById("resultBox");
const historyList = document.getElementById('historyList');

let myHistory = [];


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

        addToHistory(inputValue + " = " + theAnswer)
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

function addToHistory(text) {
    myHistory.unshift(text);

    if (myHistory.length > 5) {
        myHistory.pop();
    }

    showHistory();
}

function showHistory() {
    let html = "";
    for (let i = 0; i < myHistory.length; i++) {
        html += "<li>" + myHistory[i] + "</li>";
    }
    
    historyList.innerHTML = html
}