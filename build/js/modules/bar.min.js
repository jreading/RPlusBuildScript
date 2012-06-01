define(['foo'],function(foo) {


	var bar = function(){
		console.log(foo);
		function thisFunc() {
			var foo = "foo";
			return foo;
		}


		function anotherFunc() {
			var bar = "bar";
			return bar;
		}
	};

	return bar;
});