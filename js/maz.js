

function loadDoc(name){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      multi_toggle_visibility();
      toggle_viewer(this.responseText);
      toggle_editor(this.responseText);
      save()
    }
    if(this.status == 404){
      //document.getElementById("dataPart").style.display = 'none';
      document.getElementById("uploadPart").style.display = 'block';

    }
  };
//  var name = document.getElementById('name').value;
  xhttp.open("GET", "getfile?name="+name, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();

}


function getFiles(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      arr = JSON.parse(this.responseText);
      e = document.getElementById("dataPart");
      for (var i=0; i < arr.length; i++){
          console.log(typeof arr[i].filename);
          //e.innerHTML += String(arr[i].filename);
          e.innerHTML += '<a onclick="loadDoc(\''+ arr[i].filename +'\')"> ' + arr[i].filename + ' </a>';
      }

    }
  };
  xhttp.open("GET", "list", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}

function save(){
    function sendToRoy() {
        var html =document.getElementById("left_part_edit_html").value;
        var filename = document.getElementById('name').value;
        document.getElementById("right_part_show_html").innerHTML = html;
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("got file " + this.responseText);
            }
          };
          xhttp.open("POST", "save", true);
          xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhttp.send("fname="+filename+"&html="+html);
    }

    var count = setInterval(sendToRoy, 5000);

    setTimeout(function() {
      clearInterval(count);
    }, 5000000000000);
}


function multi_toggle_visibility(){
	var tags_to_change = ["dataPart", "right_part_show_html","left_part_edit_html"];
	for (i = 0; i < tags_to_change.length; i++) {
		toggle_visibility(tags_to_change[i]);
	}
}

function first_toggle_visibility(){
	var tags_to_change = ["dataPart"];

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





/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openLogin() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it

/*window.onclick = function(event) {

  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

*/
