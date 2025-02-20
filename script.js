const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    if (calculator.waitingForSecondOperand === true) return;

    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }

    if (firstOperand == null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        const result = performCalculation[operator](firstOperand, inputValue);

        calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '%': (firstOperand, secondOperand) => firstOperand % secondOperand,
    '**': (firstOperand, secondOperand) => Math.pow(firstOperand, secondOperand),
    'sqrt': (firstOperand) => Math.sqrt(firstOperand),
    '=': (firstOperand, secondOperand) => secondOperand,
};

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
}

function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = calculator.displayValue;
}

function updateTime() {
    const timeDisplay = document.getElementById('time-display');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    timeDisplay.textContent = formattedTime;
}

function handleBackspace() {
    calculator.displayValue = calculator.displayValue.slice(0, -1) || '0';
}

function handleMic() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        calculator.displayValue = speechResult;
        updateDisplay();
        setTimeout(() => {
            handleOperator('=');
            updateDisplay();
        }, 3000);
    };
    recognition.start();
}

function fetchCurrencyRates() {
    // Note: Replace 'API_KEY' with a real API key from a currency conversion API service
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json())
        .then(data => {
            const currencySelect = document.getElementById('currency');
            for (const [currency, rate] of Object.entries(data.rates)) {
                const option = document.createElement('option');
                option.value = rate;
                option.textContent = `${currency} (${rate})`;
                currencySelect.appendChild(option);
            }
        });
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const rate = parseFloat(document.getElementById('currency').value);
    const result = amount * rate;
    document.getElementById('conversion-result').textContent = `Converted Amount: ${result.toFixed(2)}`;
}

updateDisplay();
updateTime();
setInterval(updateTime, 1000);
fetchCurrencyRates();

const keys = document.querySelector('.calculator-keys');
keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }

    target.classList.add('clicked');
    setTimeout(() => target.classList.remove('clicked'), 100);

    if (target.classList.contains('operator')) {
        handleOperator(target.value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('all-clear')) {
        resetCalculator();
        updateDisplay();
        return;
    }

    if (target.classList.contains('backspace')) {
        handleBackspace();
        updateDisplay();
        return;
    }

    if (target.classList.contains('mic')) {
        handleMic();
        return;
    }

    inputDigit(target.value);
    updateDisplay();
});

document.getElementById('convert').addEventListener('click', convertCurrency);
