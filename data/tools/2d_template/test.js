deepCopy =function(p, c){
	var c = c || {};
	for (var i in p) {
	if (typeof p[i] === 'object') {
		c[i] = (p[i].constructor === Array) ? [] : {};
		deepCopy(p[i], c[i]);
		} else {
			c[i] = p[i];
		}
	}
	return c;
}

var A={"A":"a","B":12}
var cA = function(){
	deepCopy(A,this);
	this.C = "cc";
}

ca = new cA();
/*
ca.B = 13;
console.log(ca.B);
console.log(A.B);
var n2ref={"A":A,"ca":ca}
console.log(n2ref.A.B);
console.log(n2ref.ca.B);
ca.B=14;
console.log(n2ref.ca.B);
var arr = new Array();
arr[0] = 123;
arr["ca"]=ca;
console.log(arr["ca"].B);
ca.B=15;
console.log(arr["ca"].B);
console.log(ca.B);
*/

var arr = new Array();
arr.push(ca);
arr.push(4);
arr["a"]=arr[0];
arr["c"]=5;
ca.B=15;
for(var i in arr){
	console.log(arr[i]);
}
console.log(arr.length);

var sub = arr.filter(function(a){return a.A !=undefined || a>3});
for(var i = 0;i<sub.length;i++)console.log(arr[i]);
sub[0].B=133;
console.log(arr[0].B);
arr[0].B=135;
console.log(sub[0].B);
console.log(arr[0].B);
sub[1] = 5;
console.log(arr[1]);
console.log(sub[1]);
