(function () {


	var foo = function(){
		function thisFunc() {
			var foo = "foo";
		}
	};

	



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

	}());