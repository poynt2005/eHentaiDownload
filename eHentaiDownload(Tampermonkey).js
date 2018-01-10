// ==UserScript==
// @name         下載eHentai圖片!!
// @namespace    eHentai
// @version      0.1
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


    //inject jQuery (use Tampermonkey require)

    //get pics real links and append to page
    function appendLinksPage(){
        //result block
        var picResultBlock = document.createElement("div");
        var ResultBlockName = document.createElement("span");
        var PicResultDiv = document.createElement("div");
        var newPicResDivID = "ResultDIV";
        PicResultDiv.setAttribute("id" , "newPicResDivID"); //要插入的
        ResultBlockName.innerHTML = "<h1>圖片下載連結(搭配IDM下載)</h1>";
        var tipP = document.createElement("p");
        tipP.innerHTML = "**** <b>複製以下所有連結並複製，開啟IDM -> 任務 -> 從剪貼簿新增批次下載，以加入連結<b> **** <br><br>";

        picResultBlock.appendChild(ResultBlockName);
        picResultBlock.appendChild(tipP);
        picResultBlock.appendChild(PicResultDiv);
        document.getElementsByTagName('body')[0].appendChild(picResultBlock);


        //get real pic link
        function getPICHTML(inputHref , divName){
            $.ajax({
                url : inputHref,
                type: 'GET',
                success : function(data){
                    var tmpDiv = document.createElement("div");
                    tmpDiv.innerHTML = data;

                    var tmpI3 = $($(tmpDiv).find("#i3")[0]);
                    var tmpI7 = $($(tmpDiv).find("#i7")[0]);
                    tmpI3.removeAttr("id");
                    tmpI7.removeAttr("id");
                    tmpI3.attr("class" , "i3");
                    tmpI7.attr("class" , "i7");
                    var resImgSrc = "";
                    resImgSrc = $(tmpI3.find("img")[0]).attr("src");
                    var resultSpan = document.createElement("span");
                    resultSpan.setAttribute("class" , "imgLinks");
                    if(tmpI7.text()){
                        resImgSrc = $(tmpI7.find("a")[0]).attr("href");
                    }
                    else{
                        var picName = resImgSrc.split("/").slice(-1)[0];
                        resultSpan.setAttribute("picName" , picName);
                    }
                    resultSpan.innerHTML = resImgSrc + "<br>";
                    document.getElementById(divName).appendChild(resultSpan);
                },
				
				//if error call the server again
               error : function(err){
                   getPICHTML(inputHref , divName);
               }
            });
        }

        for(let i of $(".pic-Page-URL-Span"))
            getPICHTML($(i).text() , "newPicResDivID");
    }

    //get all pages of gallery
    function appendPage(){
        var pageArr = new Array();
        for (let i of $($(".ptt")[0]).find('a'))
            if($(i).text()!='>')
                pageArr.push($(i).attr("href"));

        function getHTML(inputHref , newDivID){
            $.ajax({
                url : inputHref,
                type: 'GET',
                success : function(data){
                    document.getElementById(newDivID).innerHTML = "<h3>" + newDivID + "</h3>" + "<br>";
                    var tmpDiv = document.createElement("div");
                    tmpDiv.innerHTML = data;
                    var tmpGdt = $($(tmpDiv).find("#gdt")[0]);
                    for(let i of tmpGdt.find("a")){
                        var picURL = $(i).attr("href");

                        var picPageURLSpan = document.createElement("span");
                        picPageURLSpan.setAttribute("class" , "pic-Page-URL-Span");
                        picPageURLSpan.innerHTML = picURL + "<br>";
                        document.getElementById(newDivID).appendChild(picPageURLSpan);
                    }
                },
				// if error call server again
				error : function(err){
					getHTML(inputHref , newDivID);
				}
            });
        };

        for(let i = 0 ; i < pageArr.length ; i++){
            var newDiv = document.createElement("div");
            var newDivID = "result" + i;
            newDiv.setAttribute("id" , newDivID);
            newDiv.setAttribute("style" , "display:none");
            document.getElementsByTagName('body')[0].appendChild(newDiv);
            getHTML(pageArr[i] , newDivID);
        }
    };

    var mybtnDiv = document.createElement("div");
    mybtnDiv.setAttribute("style" , "text-align:center;position:relative;");

    var myButton = document.createElement("a");
    myButton.setAttribute("style" , "padding:5px 15px;color:white;border-radius:5px;background-color:#9999ff;");
    myButton.setAttribute("id" , "start-download");
    myButton.href = "javascript:void(0)";
    myButton.innerHTML = "下載圖集";

    var tipSpan = document.createElement("span");
    tipSpan.setAttribute("style" , "color:#00bfff;");
    tipSpan.innerHTML = "<h3>請搭配Internet Download Manager下載底下出現的連結</h3><br>";

    mybtnDiv.appendChild(myButton);
    mybtnDiv.appendChild(tipSpan);

    document.getElementById("taglist").append(mybtnDiv);

    $("#start-download").click(function(){
        var myWaitingTime = prompt("請輸入抓取目前分頁估算時間(秒)");
        if(myWaitingTime)
            if(!isNaN(myWaitingTime)){
                appendPage();
                setTimeout(appendLinksPage , myWaitingTime * 1000);
            }

    });
})();
