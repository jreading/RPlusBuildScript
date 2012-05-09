(function () {


	var foo = function(){
		function thisFunc() {
			var foo = "foo";
		}
	};

	



	var baz = function(){
		console.log(foo);
		function thisFunc() {
			var foo = "foo";
			return foo;
		}
	};
	baz();
	}());