

function loadDoc(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      multi_toggle_visibility();
      toggle_viewer(this.responseText);
      toggle_editor(this.responseText);
    }
  };
  var name = document.getElementById('name').value;
  xhttp.open("GET", "getfile?name="+name, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}



function multi_toggle_visibility(){
	var tags_to_change = ["mainPart", "dataPart", "right_part_show_html","left_part_edit_html"];
	
	for (i = 0; i < tags_to_change.length; i++) { 
		toggle_visibility(tags_to_change[i]);
	}
}
		
function first_toggle_visibility(){
	var tags_to_change = ["mainPart", "dataPart"];
	
	for (i = 0; i < tags_to_change.length; i++) { 
		toggle_visibility(tags_to_change[i]);
	}
}

function toggle_visibility(id) {
  console.log(id);
  var e = document.getElementById(id);
  if (e.style.display == 'inline-block')
	 e.style.display = 'none';
  else
	 e.style.display = 'inline-block';
}
 
function toggle_editor(html){
  document.getElementById("left_part_edit_html").innerHTML = html;
}

function toggle_viewer(html){
  document.getElementById("right_part_show_html").innerHTML = html;
}
