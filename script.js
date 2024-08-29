// represesenting math problems as a tree of nodes.

class Node {
		constructor(value, left = null, right = null) {
				this.value = value;
				this.left = left;
				this.right = right;
		}
    
		toString() {
        // Format the tree as string, and add parentheses where necessary.
        
				if (!this.left && !this.right) {	// Leaf node (number)
						return this.value.toString();
				}
        
				const leftString = this.left.toString();
				const rightString = this.right.toString();

				// Determine if children need parentheses based on the parent operator
				const leftNeedsParentheses = this.needsParentheses(this.value, this.left);
				const rightNeedsParentheses = this.needsParentheses(this.value, this.right);

				return (leftNeedsParentheses ? `(${leftString})` : leftString )+ 
							 ` ${this.value} ` +
						(rightNeedsParentheses ? `(${rightString})` : rightString);
		}

		needsParentheses(parentOp, childNode) {
				
				const precedence = { '^': 3, '*': 2, '/': 2, '+': 1, '-': 1 };
				
				if (!childNode || !childNode.value) {
						return false; // No parentheses needed for leaf nodes
				}
				
				const parentPrecedence = precedence[parentOp];
				const childPrecedence = precedence[childNode.value];
				return childPrecedence <= parentPrecedence;	 
		}
}

function generate_term() {
    // Generate integers from 2 to 10
		return new Node(Math.floor(Math.random() * 9) + 2);
}

function generate_expression(num_terms) {
    // generate a formula with given number of terms.
    
    // Addition, substractions, multiplication and division (other
    // than by 0) and exponentiation (only by 0, 1, 2, 3 to keep
    // problems simple enough to do in your head)
	  if (num_terms == 1) {
		    return generate_term();
	  }
    
	  const operations = ["+", "-", "*", "/", "^"];
	  const operation = operations[Math.floor(Math.random() * operations.length)];
    
	  let n1 = Math.floor(Math.random() * (num_terms - 1));
	  let n2 = num_terms - 1 - n1;
    
	  if (operation === "^") {
		    n1 += n2;
		    n2 = 0;
	  }
    
	  const left = n1 > 0 ? generate_expression(n1) : generate_term();
	  const right = n2 > 0 ? generate_expression(n2) : generate_term();
    
	  if (n2 === 0 && operation === "^") {
			  right.value = new Fraction(Math.floor(Math.random() * 4, 1)); // Exponents 0 to 3
	  }
    
	  // Check for division by zero
	  if (operation === "/" && eval_ast(right) === 0) {
		    return generate_expression(num_terms); // Retry if division by zero
        // TODO: maybe just redo the denominator
	  }
    
	  return new Node(operation, left, right);
}

function eval_ast(node) {
		if (!node.left && !node.right) {
				return node.value; // Leaf node (number or fraction)
		}
    
		const leftVal = eval_ast(node.left);
		const rightVal = eval_ast(node.right);
    
		// Ensure both operands are Fractions for arithmetic operations
		const leftFraction = leftVal instanceof Fraction ? leftVal : new Fraction(leftVal);
		const rightFraction = rightVal instanceof Fraction ? rightVal : new Fraction(rightVal);
    
		switch (node.value) {
		case "+":
				return leftFraction.add(rightFraction);
		case "-":
				return leftFraction.sub(rightFraction);
		case "*":
				return leftFraction.mul(rightFraction);
		case "/":
				if (rightFraction.numerator === 0) {
						throw new Error("Division by zero encountered in expression.");
				}
				return leftFraction.div(rightFraction);
		case "^":
				if (!rightVal.denominator === 1 || rightVal.numerator < 0 ) {
						throw new Error("Exponent must be a non-negative integer.");
				}
				return leftFraction.pow(rightVal); // Assume you have a pow method in Fraction
		default:
				throw new Error(`Unknown operator: ${node.value}`);
		}
}

// We want all problems to be rationals, so we make our own Fraction class here.
class Fraction {
		constructor(numerator, denominator = 1) {
				if (typeof(denominator) !== "number" || ! Number.isInteger(denominator)) {
						throw new Error("denominator must be whole number");
				}
				if (typeof (numerator) !== "number" || ! Number.isInteger(numerator)) {
						throw new Error("numerator must be whole number");
				}
        
				this.numerator = numerator;
				this.denominator = denominator;
        
				if (denominator === 0) {
						throw new Error("Denominator cannot be zero");
				}
        
				this.simplify();
		}
		hashCode() {
				return `${this.numerator},${this.denominator}`;
		}
		
		equals(otherFraction) {
				this.simplify();
				otherFraction.simplify();
				return this.numerator === otherFraction.numerator && this.denominator === otherFraction.denominator;
		}
		
    
		gcd(a, b) {
				if (b == 0) {
						return a;
				} else {
						return this.gcd(b, a % b);
				}
		}
    
		simplify() {
				const gcd = this.gcd(Math.abs(this.numerator), this.denominator);
				this.numerator /= gcd;
				this.denominator /= gcd;
        
				if (this.denominator < 0) {
						this.numerator = -this.numerator;
						this.denominator = -this.denominator;
				}
		}
    
		add(other) {
				const newNumerator = this.numerator * other.denominator + other.numerator * this.denominator;
				const newDenominator = this.denominator * other.denominator;
				return new Fraction(newNumerator, newDenominator);
		}

		sub(other) {
				return this.add(new Fraction(-other.numerator, other.denominator));
		}

		mul(other) {
				const newNumerator = this.numerator * other.numerator;
				const newDenominator = this.denominator * other.denominator;
				return new Fraction(newNumerator, newDenominator);
		}

		div(other) {
				if (other.numerator === 0) {
						throw new Error("Division by zero");
				}
				return this.mul(new Fraction(other.denominator, other.numerator));
		}


		pow(other) {
				if (other.denominator != 1) {
						throw new Error("only whole powers allowed");
				}
				return new Fraction(Math.pow(this.numerator, other.numerator), Math.pow(this.denominator, other.numerator));
		}

		abs() {
				return new Fraction(Math.abs(this.numerator), this.denominator);
		}

		lessThan(other) {
				return this.numerator * other.denominator < other.numerator * this.denominator;
		}

		toString() {
				if (this.denominator === 1) {
						return this.numerator.toString();
				} else {
						return `${this.numerator}/${this.denominator}`;
				}
		}
}



// OK here goes the quiz specific code:

const numQuestions = 10;
let currentQuestion = 0;
let correctAnswers = 0;
const questionContainer = document.getElementById("question-container");
const choicesContainer = document.getElementById("choices-container");

const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const quizContainer = document.getElementById("quiz-container");

const statsContainer = document.getElementById("stats-container");
const statsTable = document.getElementById("stats-table");
const statsButton = document.getElementById("stats-button");
const backToQuizButton = statsContainer.children["back-to-quiz-button"];

// Load previous statistics from localStorage
const today = new Date().toDateString();
let stats = JSON.parse(localStorage.getItem("mathQuizStats")) || {};
stats[today] = stats[today] || { total: 0, correct: 0 };
let choices;
let answer;
let answerIndex; // index in choices array that's correct



// Event listener for "View Stats" button
statsButton.addEventListener("click", showStats);


		// Add event listener to the "Back to Quiz" button
backToQuizButton.addEventListener("click", () => {
		// Retrieve the stored question number
		currentQuestion = parseInt(localStorage.getItem("currentQuestion")) || 0; 
		// Show the quiz elements again
   quizContainer.style.display = "block";
    statsContainer.style.display = "none";
   
		// Generate the question corresponding to the stored question number
		generateQuestion();
    // TODO: dont regenerate question; store question when viewing stats and restore (like question number)
});

// helper function to shuffle answers
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

// Create a few plausible (wrong answers)
function generate_choices(answer) {
		const isWholeNumber = answer.denominator === 1;
		const choices = [answer];	 // Start with the correct answer
		const usedValues = new Set();			 // Track used values
		usedValues.add(answer.hashCode())

		while (choices.length < 4) {
				let wrongAnswer;
				if (isWholeNumber) {
						do {
								wrongAnswer = new Fraction(answer.numerator + Math.floor(Math.random() * 11) - 5, 1); 
						} while (usedValues.has(wrongAnswer.hashCode()));
				} else {
						do {
								const wrongDenom = Math.floor(Math.random() * 9) + 2;
								const wrongNum = answer.numerator + Math.floor(Math.random() * 11) - 5 * wrongDenom;
								wrongAnswer = new Fraction(wrongNum, wrongDenom);
						} while (usedValues.has(wrongAnswer.hashCode()));
				}
				usedValues.add(wrongAnswer);	
				choices.push(wrongAnswer);
		}

		shuffleArray(choices);
    answerIndex = choices.indexOf(answer);
		return choices;
}

// Change the quizcontainer to show current problem
function generateQuestion() {
    quizContainer.style.display = "block";
    statsContainer.style.display = "none";

	const expressionNode = generate_expression(5); // You can adjust the difficulty here
	const stringExpression = expressionNode.toString();
	answer = eval_ast(expressionNode);
	choices = generate_choices(answer);
	questionContainer.innerHTML = `<h2>Question ${
		currentQuestion + 1
	}:</h2>${stringExpression} = ?`;

	choicesContainer.innerHTML = "";
	for (let i = 0; i < choices.length; i++) {
		let choiceText =
			choices[i].denominator === 1
				? choices[i].numerator
				: `${choices[i].numerator} / ${choices[i].denominator}`;
		choicesContainer.innerHTML += `<label><input type="radio" name="choice" value="${i}"> ${choiceText}</label><br>`;
	}
}

// Function to check the selected answer (callback from submit button)
function checkAnswer() {
	  const selectedChoice = document.querySelector('input[name="choice"]:checked');
	  if (selectedChoice) {
		    const selectedAnswer = choices[parseInt(selectedChoice.value)];
        const selectedIndex = parseInt(selectedChoice.value);


		    if (selectedIndex === answerIndex) {
			      correctAnswers++;
			      stats[today].correct++;
            questionContainer.style.backgroundColor = "#c8e6c9"; // Green
            choicesContainer.children[answerIndex*2].style.backgroundColor = "#c8e6c9";
            // *2 because list is label, br, label, br, ...

		    } else {
            questionContainer.style.backgroundColor = "#ffcdd2"; // Red
            choicesContainer.children[answerIndex*2].style.backgroundColor = "#ffcdd2";

        }
        choicesContainer.children[answerIndex*2].classList.add('correct');
        
        // Reset styling after a delay
        setTimeout(() => {
            questionContainer.style.backgroundColor = ""; // Reset background
            choicesContainer.children[answerIndex*2].style.backgroundColor = "";
            choicesContainer.children[answerIndex*2].classList.remove('correct');
        		    stats[today].total++;
		        localStorage.setItem("mathQuizStats", JSON.stringify(stats));
		        currentQuestion++;
		        if (currentQuestion < numQuestions) {
                generateQuestion();
            } else {
			          showResult();
		        }
            
        }, 2000); // 2 second delay
        
	  }
}

// Display the final result
function showResult() {
	questionContainer.style.display = "none";
	choicesContainer.style.display = "none";
	submitButton.style.display = "none";
	resultContainer.innerHTML = `You answered ${correctAnswers} out of ${numQuestions} questions correctly!`;

}

// Display statistics - callback fom view Stats button
function showStats() {
  quizContainer.style.display = "none";
  statsContainer.style.display = "block";

	// Load latest stats in case there were changes
	stats = JSON.parse(localStorage.getItem("mathQuizStats")) || {};

	// Store the current question number before showing stats
	localStorage.setItem("currentQuestion", currentQuestion);


	let tableHTML =
		"<table><tr><th>Date</th><th>Total Questions</th><th>Correct Answers</th><th>% correct</th></tr>";
	  for (const date in stats) {
        const corr = (stats[date].correct/stats[date].total*100).toPrecision(4);
		  tableHTML += `<tr><td>${date}</td><td>${stats[date].total}</td><td>${stats[date].correct}</td><td>${corr}</td></tr>`;
	}
	tableHTML += "</table>";
	statsTable.innerHTML = tableHTML;
}

document.body.addEventListener("click", function(event) {
		if (event.target.id === "stats-button") {
				showStats();
		}
});

generateQuestion();
submitButton.addEventListener("click", checkAnswer); 


