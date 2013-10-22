/*
* This file is part of Wakanda software, licensed by 4D under
*  (i) the GNU General Public License version 3 (GNU GPL v3), or
*  (ii) the Affero General Public License version 3 (AGPL v3) or
*  (iii) a commercial license.
* This file remains the exclusive property of 4D and/or its licensors
* and is protected by national and international legislations.
* In any event, Licensee's compliance with the terms and conditions
* of the applicable license constitutes a prerequisite to any use of this file.
* Except as otherwise expressly stated in the applicable license,
* such license does not include any other license or rights on this file,
* 4D's and/or its licensors' trademarks and/or other proprietary rights.
* Consequently, no title, copyright or other proprietary rights
* other than those specified in the applicable license is granted.
*/
function writeToMyLog(message)
{
	var mutex = Mutex("syncOptimize");
	mutex.lock();
	var file = new File("f:/logOptimize.txt");
	var outStream = TextStream(file, "write");
	outStream.write(message);
	outStream.close();
	mutex.unlock();
	
}

function optimize( request, response)
{
	
	var url = request.url;
	var queryValues = getURLQuery(url);
	var fileNames = queryValues.files;
	var output = "";
	var contentType = null;
	
	//writeToMyLog("url : "+ url+"\n");
	
	var typeSend = "JS";
	
	//console.log(JSON.stringify(queryValues));
	var referer = /*queryValues.referer; */ request.headers.Referer;
	referer = referer.split('\\').join('/');
	//console.log("referer: "+referer)
	var mustskipfirst = false;
	if (referer.toLowerCase().indexOf("http://") == 0)
	{
		mustskipfirst = true;
		referer = referer.slice(7);
	}
	else if (referer.toLowerCase().indexOf("https://") == 0)
	{
		mustskipfirst = true;
		referer = referer.slice(8);
	}
	var path = getURLPath(referer);
	if (mustskipfirst)
		path = path.slice(1);
	var pattern = application.pattern;
	if (path.length > 0 && pattern != null)
	{
		if (path[0].toLowerCase() == pattern.toLowerCase())
			path = path.slice(1);
	}
	path.pop(); // removes the page.html in folder1/folder2/page.html
		
	
	var wafPath = getWalibFolder().path+"WAF";
	var serverPath = getWalibFolder().parent.path;
	var webFolderPath = application.getItemsWithRole( 'webFolder').path;	// sc 16/05/2012, webAppService property was removed
	var refererPath = webFolderPath;
	if (path.length > 0)
	{
		refererPath += path.join("/")+"/";
	}
	
	/*
	console.log("referer : "+refererPath)
	*/
	
	var maxModifDate = new Date(1990, 1 ,1);
	
	if (fileNames != null)
	{
		fileNames = fileNames.split(",");
		var nbFiles = fileNames.length;
		for (var i = 0; i < nbFiles; i++ )
		{
			var fileName = fileNames[i];
			var fullFileName;
			if (fileName[0]== '+')
				fullFileName = wafPath+fileName.slice(1);
			else if (/^\/walib/i.test(fileName))
			{
				if (serverPath[serverPath.length-1] == '/' && fileName[0]== '/') {
                                    fullFileName = serverPath+fileName.slice(1);
                                } else {
                                    fullFileName = serverPath+fileName;
                                }
			}
			else if (fileName[0]== '/')
			{
				fullFileName = webFolderPath+fileName.slice(1);
			}
			else
			{
				fullFileName = refererPath+fileName;
			}
			//console.log(fullFileName)
			var text = "";
			try
			{
				text = loadText(fullFileName);
			}
			catch (err)
			{
				text = loadText(fullFileName, 1018);
			}
			if (text != null)
			{
				var file = File(fullFileName);
				var fileDate = file.lastModifiedDate;
				if (fileDate > maxModifDate)
					maxModifDate = fileDate;
				if (contentType == null)
				{
					var ext = file.extension.toUpperCase();
					if (ext == 'CSS')
					{
						contentType = 'text/css; charset=UTF-8';
						typeSend = "CSS";
					}
					if (ext == 'JS')
					{
						contentType = 'application/javascript';
					}
				}
				output += "/*"+fullFileName+'*/'+"\n\n"+text + "\n";
				//console.log("OK   "+fullFileName);
			}
			else
			{
				//console.log("BAD BAD   "+fullFileName);
			}
		}
	}
	
	var needSend = true;
	var modifSince = request.headers["If-Modified-Since"];
	if (modifSince != null && modifSince != "")
	{
		var modifSinceDate = new Date(modifSince);
		if (maxModifDate < modifSinceDate)
		{
			needSend = false;
		}
		else
		{
			if (!(maxModifDate > modifSinceDate)) // en javascript on ne peut pas avoir l'egalite des dates directement 
			{
				needSend = false;
			}
		}
		//var sReq = "maxModifDate : "+maxModifDate.toUTCString()+"  ,  modifSinceDate : "+modifSinceDate.toUTCString()+"  ,  needSend : "+needSend;
		//trace(contentType + " --> "+sReq+"\n")

	}
	
	if (needSend)
	{
		/*
		var folder = Folder("f:/sendFiles");
		if (!folder.exists)
			folder.create();
		var uuid = generateUUID();
		var file = new File(folder, uuid+".txt");
		saveText(output, file);
		writeToMyLog(typeSend+" : full send, in file: "+uuid+".txt , modifSince = "+modifSince+" , maxModifDate = "+maxModifDate+"\n\n");
		*/
		
        if (queryValues.componentid) {
            response.body = output.replace(/{id}/g, queryValues.componentid);
        } else {
            response.body = output;
        }            		
		if (contentType != null)
		{
			response.headers["Content-Type"] = contentType;
		}
		response.headers["Last-Modified"] = maxModifDate.toUTCString();
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+1);
		response.headers["Expires"] = expireDate.toUTCString();
		response.headers["Pragma"] = "";
		response.allowCompression(1024, 50000000); // 50 mega max for compression
		response.statusCode = 200;
	}
	else
	{
		//writeToMyLog(typeSend+" : no send\n\n");
		if (contentType != null)
		{
			response.headers["Content-Type"] = contentType;
		}
		response.statusCode = 304;
		response.body = "";
		response.headers["Pragma"] = "";
		var expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear()+1);
		response.headers["Expires"] = ""; //expireDate.toUTCString();
	}
}
