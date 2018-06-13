//var wazeModel = unsafeWindow.wazeModel;

function convertDateToDays(dateToConvert){
   var dateNow = new Date();
   return Math.floor((dateNow.getTime() - dateToConvert) / 86400000);
}

function deleteAllUnkCameras() {
    var obj = wazeModel.cameras.objects
    var foundCameras = new Array();
    for (var key in obj) 
	{
        var o = obj[key];
		if (!o.attributes.validated && 
			o.attributes.permissions < 0 &&
			((document.getElementById(o.geometry.id) != null) && (document.getElementById(o.geometry.id).style.visibility == 'visible')) &&
				o.attributes.rank < wazeModel.loginManager.user.rank &&
				o.attributes.updateBy != wazeModel.loginManager.user.id &&
			o.attributes.cretateBy != wazeModel.loginManager.user.id) 
		{
				foundCameras.push(wazeModel.cameras.objects[o.fid]);
				//Waze.Action.DeleteObject(wazeModel.cameras.objects[o.fid]);
		}
    }
    alert('There are ' + foundCameras.length + ' cameras that would have been selected for deletion.');
    wazeModel.deleteObjects(foundCameras);
}

function deleteAllUnkCamerasRebuildUI(){
	var html = '';
	html += '<hr>';
//	html += '<input type="number" min="1" size="3" style="width:50px;;line-height:14px;height:14px;margin-bottom:4px;" id="cameraCreatedDays"> days old<br>';
	html += '<button onclick="deleteAllUnkCameras()">Delete Cameras</button>';
	$('#deleteunkcameras').html(html);
}

//if (!(wazeModel.loginManager.user.rank < 2)) {
	deleteAllUnkCamerasRebuildUI();
//}
