var num = 1; // Comments can be preceded by double backslashes
var str = 'string';
var name = 'Mike';
/* 
	Three variables represented by a straightforward name.
 */

var numArray = [1, 3, 5, 7, 9];
var strArray = ['a', 'b', 'c', 'd', 'e'];

numArray[3]; // The output will be 7 - the fourth entry.
strArray[0]; // The output will be 'a' - the first entry.

console.log(num);
console.log(numArray[3]);

var profile = {
	name: 'Tsung-Ying',
	age: 40,
	dob: '1981-xx-xx',
	phones: [923123456, 988765432]
};

console.log(profile.name); // The output will be 'Tsung-Ying'.
console.log(profile.age); // The output will be 40.

console.log(profile.phones[0]);

function calc(num1, num2) {
	let results = {
		sum: num1 + num2,
		diff: num1 - num2,
		prod: num1 * num2,
	};
	return results;
}

var calRes1 = calc(2, 5);
console.log(calRes1.sum);
console.log(calRes1.diff);
console.log(calRes1.prod);