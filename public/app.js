function getSize(size) {
    if(size > 1024*1024){ //1 MB
        size = `${(size/(1024*1024)).toFixed(2)} MB`;
    }
    else if(size > 1024){ //1 KB
        size = `${(size/1024).toFixed(2)} KB`;
    }
    else{ // size is in bytes
        size = `${size} B`;
    }
    return size;
}


let tooltipSelector = $('[data-toggle="tooltip"]')
tooltipSelector.tooltip()

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

let copyToClipboardBtn = document.getElementsByClassName('copy-to-clipboard')[0]
let originalCopyMessage = 'Copy to clipboard'
let messageOnCopy = '🎉 copied'


copyToClipboardBtn.addEventListener('click', () => {
    copyToClipboard(window.location.href)
    tooltipSelector.attr('title', messageOnCopy)
        .attr('data-original-title', messageOnCopy)
        .tooltip('update')
        .tooltip('show');
    setTimeout(() => {
        tooltipSelector.tooltip('hide')
        tooltipSelector.attr('title', originalCopyMessage)
        .attr('data-original-title', originalCopyMessage)
        .tooltip('update')
    }, 2000)
})



Dropzone.options.upload = {
    maxFilesize: 102400,
    timeout: 1/0,
    init: function() {
        this.on('complete', function(file){
            if(file.status !== 'success')   return;
            // window.location.reload();
            // return;
            console.log('file',file,'was added');
            let name = file.name;
            let names = document.getElementsByClassName('file-name');
            let idx = -1;
            for(let i=0; i<names.length; i++){
                if(names[i].innerText === name){
                    idx = i;
                    break;
                }
            }
            let date = new Date().toString().split(' ').slice(0,5).join(' ');
            if(idx == -1){ // element doesn't exist so add new element
                let grid = document.getElementById('grid');
                let url = document.URL.split('/').pop();
                let newHTML = `<div class="grid-item file-name"><a href="/uploads/${url}/${name}" download>${name}</a></div>
                                <div class="grid-item file-date"><span>${date}</span></div>
                                <div class="grid-item file-size"><span>${getSize(file.size)}</span></div>`;
                if(grid.innerHTML.trim() === "<h6>Nothing here, upload some files!</h6>")  grid.innerHTML = "";
                grid.innerHTML += newHTML;
            }
            else{ // modify existing element
                document.getElementsByClassName('file-date')[idx].innerText = date;
                document.getElementsByClassName('file-size')[idx].innerText = getSize(file.size);
            }
        });
    }
}
console.log('Upload configurations set to',Dropzone.options.upload);
