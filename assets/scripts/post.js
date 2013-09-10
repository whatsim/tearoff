function postPage(){
	var x = new XMLHttpRequest();
	x.open('post','/postPage');
	var el = document.getElementById('submission');
	var d = new FormData(el);
	x.addEventListener('loadend',redirect);
	x.send(d);
	
	function redirect(){
		var o = JSON.parse(x.response);
		window.location.href = "/"+o.url;
	}
	
	return false;
}