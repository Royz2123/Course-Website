

function showOut(){
	document.getElementById("login").style.display = 'none';
  document.getElementById("signUp").style.display = 'none';
  document.getElementById("logout").style.display = 'inline-block';
}

function showIn(){
	document.getElementById("login").style.display = 'inline-block';
  document.getElementById("signUp").style.display = 'inline-block';
  document.getElementById("logout").style.display = 'none';

}

function sayHello(){
	document.getElementsByClassName("list-type4")[0].innerHTML = "hello, " + getCookie("username") + document.getElementsByClassName("list-type4")[0].innerHTML
}

function checkIn() {
    if (document.cookie != "") {
        showOut();
				uploadPartShow();
    } else {
      showIn();
    }

}

function uploadPartShow(){
	document.getElementById("not-login").style.display = "inline-block";
	document.getElementById("login!").style.display = "none";
	sayHello()
	getFiles()
}

function uploadPartHide(){
	document.getElementById("userInput").style.display = "none";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function toggle_editor(html) {
    document.getElementById("left_part_edit_html").style.display = "inline-block";
    document.getElementById("left_part_edit_html").innerHTML = html;
}

function toggle_viewer(html) {

    document.getElementById("right_part_show_html").style.display = "inline-block";
    document.getElementById("right_part_show_html").innerHTML = html;
}

function readSingleFile(evt) {
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            name = currentPath+ f.name;
            content = e.target.result;
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

function toggleLogin() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function createFolder(){
	var foldName = document.getElementById("folderinput").value;

	currentList.push(currentPath+foldName+"/.");
	setTreeHTML(currentPath);
}
