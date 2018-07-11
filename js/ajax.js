var content;
var name;

function loadDoc(_name) {
  name = _name;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          uploadPartHide();
          toggle_viewer(this.responseText);
          toggle_editor(this.responseText);
          save();
      }
  };
  xhttp.open("GET", "getfile?name=" + name, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}

function loginHandler() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            if (this.responseText == "1") {
                toggleLogin();
                showOut();
                uploadPartShow();

            } else {
                document.getElementById("error").innerHTML = "try again";
            }
        }
    };
    var uname = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    xhttp.open("GET", "login?username=" + uname + "&password=" + pass);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

}

function getFiles() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            arr = JSON.parse(this.responseText);
            // extract filenames from arr
            arr.forEach(function(element) {
                currentList.push(element["filename"]);
            });

            // display current directory
            setTreeHTML("");
        }
    };
    xhttp.open("GET", "list", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function UploadDoc() {
    var html = content;
    document.getElementById("right_part_show_html").innerHTML = html;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            uploadPartHide();
            toggle_viewer(html);
            toggle_editor(html);
            save()
        }
    };
    xhttp.open("POST", "save", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("fname=" + name + "&html=" + html);
}

function save() {
    function sendToServer() {
        var html = document.getElementById("left_part_edit_html").value;
        document.getElementById("right_part_show_html").innerHTML = html;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("got file " + this.responseText);
            }
        };
        xhttp.open("POST", "save", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("fname=" + name + "&html=" + html);
    }

    setTimeout(function() {
       sendToServer();
       save();
    }, 1000);
}

function logout() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        window.location.assign("/index.html");
      }
  };
  xhttp.open("GET", "logout", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}
