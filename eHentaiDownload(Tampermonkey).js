function getContent(){
	function getPage(num){
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(){
				if(xhr.readyState == XMLHttpRequest.DONE){
					if(xhr.status == 200){
						var rstDiv = document.createElement("div");
						rstDiv.innerHTML = xhr.responseText.replace(/src|script|link|iframe/gm, "datas");
						resolve(Array.from(rstDiv.querySelectorAll(".gdtm>div>a")).map(e => e.href));
					}
					else reject(xhr.responseText);
				}
			}
			xhr.open("GET", `${window.location.protocol}//${window.location.host}${window.location.pathname}?p=${num}`);
			xhr.send();
		});
	}

	var pageTotalNum = Array.from(document.querySelector(".ptt").querySelectorAll("td")).map(e => e.innerText).filter(e => /[0-9]+/.test(e)).map(e => parseInt(e)).sort((a,b) => b-a)[0];
	var rstArr = [], currentPage = 0;
	return function recurGetPage(){
		if(currentPage >= pageTotalNum) return Promise.resolve(rstArr.reduce((a,v) => a.concat(v), []).reduce((a,v) => a.concat(v), []));
		var toGet = (new Array(currentPage+5 >= pageTotalNum ? pageTotalNum-currentPage : 5)).fill(currentPage).map((e,i) => getPage(e+i));
		return Promise.all(toGet).then(rst => rstArr.push(rst)).then(() => {currentPage+=5; return recurGetPage();});
	}
}

function getPicURL(galleryURLArr){	
	function getPage(url){
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(){
				if(xhr.readyState == XMLHttpRequest.DONE){
					if(xhr.status == 200){
						var rstDiv = document.createElement("div");
						rstDiv.innerHTML = xhr.responseText.replace(/script|link|iframe/gm, "datas").replace(/src/gm, "data-src");
						resolve(rstDiv.querySelector("#i7 a") !== null && typeof rstDiv.querySelector("#i7 a") !== "undefined" ? rstDiv.querySelector("#i7 a").href : rstDiv.querySelector("#i3 img").getAttribute("data-src"));
					}
					else reject(xhr.responseText);
				}
			}
			xhr.open("GET", url);
			xhr.send();		
		});
	}
	var rstArr = [], currentPicBase=0;
	
	return function recurGetPage(){
		if(currentPicBase >= galleryURLArr.length) return Promise.resolve(rstArr.reduce((a,v) => a.concat(v), []).reduce((a,v) => a.concat(v), []));
		var toGet = galleryURLArr.slice(currentPicBase , (currentPicBase+10 >= galleryURLArr.length ? galleryURLArr.length : currentPicBase+10)).map(e => getPage(e));
		return Promise.all(toGet).then(rst => rstArr.push(rst)).then(() => {currentPicBase+=10; return recurGetPage();});	
	}
}	


function appendPage(linkArr){
	var rstBlock = document.createElement("div");
	var h2P = document.createElement("p");
	var h2 = document.createElement("h2");
	h2.innerHTML = "複製以下所有連結並複製，開啟IDM -> 任務 -> 從剪貼簿新增批次下載，以加入連結";

	var totalPageHint = document.createElement("p");
	totalPageHint.innerHTML = `總共找到${linkArr.length}個鏈結`;

	h2P.appendChild(h2);
	rstBlock.appendChild(h2P);
	rstBlock.appendChild(totalPageHint);

	for(let i of linkArr){
		let p = document.createElement("p");
		p.innerHTML = i;
		rstBlock.appendChild(p);
	}

	document.body.appendChild(rstBlock);
}
(function(){
	var mybtnDiv = document.createElement("div");
	mybtnDiv.setAttribute("style" , "text-align:center;position:relative;");

	var myButton = document.createElement("a");
	var hasGotten = false;
	myButton.setAttribute("style" , "padding:5px 15px;color:white;border-radius:5px;background-color:#9999ff;");
	myButton.onclick = () => !hasGotten ? getContent()().then(rst => getPicURL(rst)()).then(rst => appendPage(rst)).then(() => hasGotten = true).catch(err => console.log(err)) : console.log("已經獲得鏈結");
	
	myButton.href = "javascript:void(0)";
	myButton.innerHTML = "下載圖集";

	var tipSpan = document.createElement("span");
	tipSpan.setAttribute("style" , "color:#00bfff;");
	tipSpan.innerHTML = "<h3>請搭配Internet Download Manager下載底下出現的連結</h3><br>";

	mybtnDiv.appendChild(myButton);
	mybtnDiv.appendChild(tipSpan);

	document.getElementById("taglist").append(mybtnDiv);
})();
