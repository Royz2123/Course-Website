// global tree variables
var currentPath = "";
var currentList = [];

// sets the HTML of the tree
function setTreeHTML(path)
{
    // set global variables to these parameters
    currentPath = path;

    // get all the files in the current path
    currentFiles = getCurrentDir(path, currentList);

    // get HTML document that we shall update, and reset
    e = document.getElementById("userFiles");
    e.innerHTML = "<p>Current Directory: ./" + path + "</p>";

    // first display all the folders
    for (var i = 0; i < currentFiles["folders"].length; i++){
        // create parameters for recursive tree call
        var parm1 = currentFiles["folders"][i]["itemname"] + '/';
        // create the html item
        var html_item = '<li><a onclick="setTreeHTML(\''
        html_item += path+parm1;
        html_item += '\')"> ';
        html_item += currentFiles["folders"][i]["itemname"];
        html_item += ' </a></li>';

        // update the html
        e.innerHTML += html_item
    }

    // next print all the files
    // first display all the folders
    for (var i = 0; i < currentFiles["files"].length; i++){
        // create the html item
        var html_item = '<li><a onclick="loadDoc(\'';
        html_item += currentFiles["files"][i]["filename"];
        html_item += '\')"> ';
        html_item += currentFiles["files"][i]["itemname"];
        html_item += ' </a></li>';

        // update the html
        e.innerHTML += html_item;
    }
}


function getCurrentDir(path, list)
{
            console.log("path"+path)
            console.log("list"+list)
    var splitPath = path.split("/");
    var parentDepth = splitPath.length - 1;
    var newList = {
        "files" : [],
        "folders" : []
    };

    for(var i =0; i < list.length; i++)
    {
        //console.log(list[i]);
        // check if this file/folder belongs in the current parent folder
        if(list[i].startsWith(path))
        {
            var splittedFilename = list[i].split("/");
            var currentDepth = splittedFilename.length - 1;
            var itemName = splittedFilename[parentDepth];

            // full item consists o
            var fullItem = {
                "filename" : list[i],
                "itemname" : itemName
            }

            // this is a file at this depth
            if (currentDepth == parentDepth)
            {
                newList["files"].push(fullItem);
            }

            // this is a folder at this depth
            else if(currentDepth > parentDepth)
            {
                newList["folders"].push(fullItem);
            }
        }
    }
    return newList;
}
