const url = 'docs/' + localStorage.getItem("filepath");

let pdfDoc = null,
	pageIsRendering = false,
	pageNumIsPending = null;

if(localStorage.getItem("lastPage") !== null) pageNum = +localStorage.getItem("lastPage");
else pageNum = 1;

const scale = 1.8,
	  canvas = document.querySelector('#pdf-render'),
	  ctx = canvas.getContext("2d");

const renderPage = num => {

pageIsRendering = true;
pdfDoc.getPage(num).then(page => {

	const viewport = page.getViewport({ scale });
	canvas.height = viewport.height;
	canvas.width = viewport.width;

	const renderCtx = {
		canvasContext: ctx,
		viewport
	}

	page.render(renderCtx).promise.then(() => {
		pageIsRendering = false;
		if(pageNumIsPending !== null){

			renderPage(pageNumIsPending);
			pageIsRendering = null;
		}
	});

	document.querySelector('#page-num').textContent = num;

});
};

const queueRenderPage = num => {

	if(pageIsRendering){
		pageNumIsPending = num;
	}else{
		renderPage(num);
	}
}

const showPrevPage = () =>{

	if(pageNum <= 1){
		return;
	}

	pageNum--;
	queueRenderPage(pageNum);
	localStorage.setItem("lastPage", pageNum);
}

const showNextPage = () =>{

	if(pageNum >= pdfDoc.numPages){

		return;
	}

	pageNum++;
	queueRenderPage(pageNum);
	localStorage.setItem("lastPage", pageNum);
}


pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {

	pdfDoc = pdfDoc_;
	document.querySelector('#page-count').textContent = pdfDoc.numPages;
	renderPage(pageNum);

})
.catch(err => {

	/*)
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(err.message));
	document.querySelector('#wrapper').style.display = 'none';
	document.querySelector('.top-bar').appendChild(div);
	document.querySelector('.top-bar').className = 'error';
	*/
	document.querySelector("#Error").style.visibility = "visible";
	document.querySelector("#bottom").style.display = "none";

});

function goToHelper(pageNumEquals){

			pageNum = pageNumEquals;
			queueRenderPage(pageNum);
			
			localStorage.setItem("lastPage", pageNum);
			document.querySelector("#page-num").blur();

}

function goTo(e){

	if(e.type == "keypress"){

		if(e.key === "Enter"){

			if(+document.querySelector("#page-num").innerText > pdfDoc.numPages) {

				goToHelper(pdfDoc.numPages);

			}else if(+document.querySelector("#page-num").innerText <= 0){

				goToHelper(1);

			}else{

				goToHelper(+document.querySelector("#page-num").innerText);

			}

		}
	}
}

function changePath(){

	localStorage.setItem("filepath", document.querySelector("#file").value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]);
	localStorage.removeItem("lastPage");
	location.reload();

}

function changePDF(){

	document.querySelector("#file").click();
	document.querySelector("#file").addEventListener("change", function(){

		localStorage.setItem("filepath", document.querySelector("#file").value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]);
		localStorage.removeItem("lastPage");
		location.reload();

	});

}

document.querySelector("#prev-page").addEventListener('click', showPrevPage);
document.querySelector("#next-page").addEventListener('click', showNextPage);

document.querySelector("#prev-page-footer").addEventListener('click', showPrevPage);
document.querySelector("#next-page-footer").addEventListener('click', showNextPage);


document.querySelector("#page-num").addEventListener("keypress", goTo);
document.querySelector("#file").addEventListener("change", changePath);

document.querySelector("#changePDF").addEventListener("click", changePDF);