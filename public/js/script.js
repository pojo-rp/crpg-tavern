function copy(){
    let url = document.location.href;
    navigator.clipboard.writeText(url);

};

function copySuccess(){
    // alert("URL copied to your clipboard!!");
    const popup = document.getElementById('url-copied');
    popup.value = "URL copied";

};



