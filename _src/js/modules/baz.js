define(['foo'],function(foo) {


	var baz = function(){
		console.log(foo);
		function thisFunc() {
			var foo = "foo";
			return foo;
		}
	};
	plugin('baz', baz, '.baz');
	return baz;
});