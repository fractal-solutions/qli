
// Random JavaScript functions

function randomGreeting() {
  const greetings = ['Hello', 'Hi', 'Hey', 'Hola', 'Bonjour'];
  const index = Math.floor(Math.random() * greetings.length);
  return greetings[index];
}

function getFullYear() {
  return new Date().getFullYear();
}

function calculateSquare(number) {
  return number * number;
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function isPalindrome(str) {
  const reversed = reverseString(str);
  return str === reversed;
}

// Example usage
console.log(randomGreeting());   // Prints a random greeting
console.log(getFullYear());      // Prints the current year
console.log(calculateSquare(5)); // Prints 25
console.log(reverseString('bun')); // Prints 'nub'
console.log(isPalindrome('racecar')); // Prints true
