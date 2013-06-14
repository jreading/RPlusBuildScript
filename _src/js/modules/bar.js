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
	plugin('bar', bar, '.bar');
	return bar;
});