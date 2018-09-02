// ==UserScript==
// @name         下載eHentai圖片!!
// @namespace    https://gist.github.com/poynt2005
// @description  Get the eHentai Gallery download link
// @author       紀克勤
// @match        *://*.e-hentai.org/g/*
// @match        *://g.e-hentai.org/g/*
// @match        *://e-hentai.org/g/*
// @match        *://exhentai.org/g/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function(){
    'use strict';

    /*
			Script that helps user download ehentai/exhentai gallery pictures
			Require Software: Internet Download Manager software
		*/

    function postParsingRstPage(inputText){

        inputText = inputText.replace(new RegExp("src" , "gm") , "dataSrc");

        var noScript = document.createElement("noscript");
        var div = document.createElement("div");
        noScript.appendChild(div);
        div.innerHTML = inputText;
        return noScript;
    }



    async function getAllPicURL(){

        var totalPage = ((pageDiv) => {
            let MAX = -1;
            for(let i of pageDiv)
                if(parseInt(i.innerText) > MAX)
                    MAX = parseInt(i.innerText);
            return MAX;
        })($($($(".ptt")[0]).find("td")).toArray());

        function findPicURL(inputDiv){
            var gdtms = $($($(inputDiv).find("#gdt")[0]).find(".gdtm")).toArray();
            var rstArr = [];
            for(let gdtm of gdtms)
                rstArr.push($(gdtm).find("a")[0].href);
            return rstArr;
        }

        function getAllPage(inputUrl){
            return new Promise(function(resolve, reject){
                $.ajax({
                    type: "GET",
                    url: inputUrl,
                    success: function(data){
                        var rstDiv = postParsingRstPage(data);
                        resolve(findPicURL(rstDiv));
                    }
                });
            });
        }

        async function recurGetAllPage(idx , rstArr){
            if(idx == totalPage)
                return rstArr;
            else{
                var pageURL = `${window.location.href}?p=${idx}`;
                rstArr = rstArr.concat(await getAllPage(pageURL));
                return recurGetAllPage(idx+1 , rstArr)
            }
        }

        var currentPagePicArr = findPicURL(postParsingRstPage($("html").html()));
        currentPagePicArr = currentPagePicArr.concat(await recurGetAllPage(1 , []));
        return currentPagePicArr;
    }



    async function getAllPicDownloadLink(picURLs){
        function getPicRealLink(inputURL){
            return new Promise(function(resolve , reject){
                $.ajax({
                    type: "GET",
                    url: inputURL,
                    success: function(data){
                        var rstDiv = postParsingRstPage(data);
                        var picSrc = $($(rstDiv).find("#i3")[0]).find("img")[0].getAttribute("datasrc");
                        var originalSrc = ((rstObj) => {
                            if(rstObj.length == 0)
                                return false;
                            else
                                return
                            rstObj[0].href;
                        })($($(rstDiv).find("#i7")[0]).find("a"));
                        resolve((originalSrc) ? originalSrc : picSrc);
                    }
                });
            });
        }

        async function recurGetPicRealLink(urlArr , idx , rstArr){
            if(idx == urlArr.length)
                return rstArr;
            else{
                rstArr = rstArr.concat(await getPicRealLink(urlArr[idx]));
                return recurGetPicRealLink(urlArr , idx+1 , rstArr);
            }
        }

        var rstArr = [];
        rstArr = rstArr.concat(await recurGetPicRealLink(picURLs , 0 , []));

        return rstArr;
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
        myButton.setAttribute("style" , "padding:5px 15px;color:white;border-radius:5px;background-color:#9999ff;");
        myButton.onclick = async function(){
            var picURLs = await getAllPicURL();
            var picDownLink = await getAllPicDownloadLink(picURLs);
            appendPage(picDownLink);

        }
        myButton.href = "javascript:void(0)";
        myButton.innerHTML = "下載圖集";

        var tipSpan = document.createElement("span");
        tipSpan.setAttribute("style" , "color:#00bfff;");
        tipSpan.innerHTML = "<h3>請搭配Internet Download Manager下載底下出現的連結</h3><br>";

        mybtnDiv.appendChild(myButton);
        mybtnDiv.appendChild(tipSpan);

        document.getElementById("taglist").append(mybtnDiv);
    })();
})();
