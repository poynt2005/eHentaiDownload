// ==UserScript==
// @name         下載nHentai圖片!!
// @namespace    nHentai
// @version      0.1
// @description  Get the nHentai Gallery download link
// @author       紀克勤
// @match        *://*.nhentai.net/g/*
// @match        *://nhentai.net/g/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

/*
		Script that helps user download nHentai gallery pictures
		Require : Internet Download Manager software
	*/

(function(){
    'use strict';
    var a = document.createElement("a");
    a.setAttribute("class" , "btn btn btn-secondary");
    a.setAttribute("id" , "start-download");
    a.href = "javascript:void(0)";
    a.innerHTML = "下載圖集";

    document.getElementsByClassName("buttons")[0].appendChild(a);

    $("#start-download").click(function(){
        //create links Result div
        var picPageDiv = document.createElement("div");
        picPageDiv.setAttribute("id" , "picPageDiv");
        document.getElementsByTagName("body")[0].appendChild(picPageDiv);

        //tips text
        var spanResultTitle = document.createElement("span");
        spanResultTitle.innerHTML = "<h1>以下是下載連結</h1> <br>";
        var pTip = document.createElement("p");
        pTip.innerHTML = "*** 請複製以下所有連結並使用Internet Download Manager -> 任務 -> 從剪貼簿新增批次下載 *** <br><br>";
        picPageDiv.appendChild(spanResultTitle);
        picPageDiv.appendChild(pTip);

        //ajax call server and append links
        function getPicPage(currentHref){
            $.ajax({
                type:"GET",
                url:currentHref,
                success:function(data){
                    var tmpdiv = document.createElement("div");
                    tmpdiv.innerHTML = data;

                    var imageContainer = $(tmpdiv).find("#image-container")[0];

                    var imgSource = $($(imageContainer).find("img")[0]).attr("src");
                    var imgName = imgSource.split("/").slice(-1)[0];

                    var picPageSpan = document.createElement("span");
                    picPageSpan.setAttribute("class" , "picPageSpan");
                    picPageSpan.setAttribute("downloadName" , imgName);
                    picPageSpan.innerHTML = imgSource + "<br>";
                    document.getElementById("picPageDiv").appendChild(picPageSpan);
                },
                error : function(err){
                    //if error call server again
                    getPicPage(currentHref);
                }
            });
        }

        for(let i of $(".thumb-container")){
            let imgHref = "https://" + window.location.hostname + $(i).find("a")[0].getAttribute("href");
            getPicPage(imgHref);
        }

    });
})();