function loadDoc(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      multi_toggle_visibility();
      toggle_editor(this.responseText);
      toggle_viewer(this.responseText);
    }
  };
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.open("GET", "index.html", true);
  xhttp.send();
}

function toggle_visibility(id) {
  var e = document.getElementById(id);
  if (e.style.display == 'block')
	 e.style.display = 'none';
  else
	 e.style.display = 'block';}

function toggle_editor(html){
  document.getElementById(left_part_edit_html) = html;
}
function toggle_veiwer(html){
  document.getElementById(right_part_show_html) = html;
}
