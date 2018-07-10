var content;
var name;

function loadDoc(_name){
  name = _name;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      toggle_visibility();
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
      e = document.getElementById("userFiles");
      for (var i=0; i < arr.length; i++){
          console.log(typeof arr[i].filename);
          //e.innerHTML += String(arr[i].filename);
          e.innerHTML += '<li><a onclick="loadDoc(\''+ arr[i].filename +'\')"> ' + arr[i].filename + ' </a></li>';
      }

    }
  };
  xhttp.open("GET", "list", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}

function UploadDoc(){
  var html = content;
  var filename = name;
  document.getElementById("right_part_show_html").innerHTML = html;
  var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        toggle_visibility();
        toggle_viewer(html);
        toggle_editor(html);
        save()
      }
    };
    xhttp.open("POST", "save", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("fname="+filename+"&html="+html);
}


function save(){
    function sendToRoy() {
        var html =document.getElementById("left_part_edit_html").value;
        var filename = name;
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



function toggle_visibility(id) {
  id = "userInput"
  var e = document.getElementById(id);
	e.style.display = 'none';
}

function toggle_editor(html){
  document.getElementById("left_part_edit_html").style.display = "inline-block";
  document.getElementById("left_part_edit_html").innerHTML = html;
}

function toggle_viewer(html){

  document.getElementById("right_part_show_html").style.display = "inline-block";
  document.getElementById("right_part_show_html").innerHTML = html;
}





function readSingleFile(evt) {
  //Retrieve the first (and only!) File from the FileList object
  var f = evt.target.files[0];

  if (f) {
    var r = new FileReader();
    r.onload = function(e) {
        name = f.name;
        content = e.target.result;
        alert("A");
    }
    r.readAsText(f);
  } else {
    alert("Failed to load file");
  }
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
